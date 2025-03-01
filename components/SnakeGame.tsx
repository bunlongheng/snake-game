import { useEffect, useRef, useState, useCallback } from 'react';

const gridSize = 20;
const gridWidth = 400;
const gridHeight = 400;
const snakeNames = ['Slithery', 'Cobra', 'Python', 'Mamba', 'Viper', 'Boa', 'Snek'];

type Point = { x: number; y: number };
interface GameState {
  snake: Point[];
  food: Point;
  gameRunning: boolean;
  soundOn: boolean;
  thoughts: string;
  score: number;
  lastFoodTime: number;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audio1Up, setAudio1Up] = useState<HTMLAudioElement | null>(null);
  const [snakeName, setSnakeName] = useState('Snek');
  const [state, setState] = useState<GameState>({
    snake: [{ x: 160, y: 160 }, { x: 140, y: 160 }],
    food: { x: 300, y: 300 },
    gameRunning: false,
    soundOn: true,
    thoughts: `Meet Snek! Click 'Start Game' to begin.`,
    score: 0,
    lastFoodTime: Date.now()
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('snakeName');
      if (storedName) {
        setSnakeName(storedName);
        setState(p => ({ ...p, thoughts: `Meet ${storedName}! Click 'Start Game' to begin.` }));
      } else {
        const randomName = snakeNames[Math.floor(Math.random() * snakeNames.length)];
        setSnakeName(randomName);
        setState(p => ({ ...p, thoughts: `Meet ${randomName}! Click 'Start Game' to begin.` }));
        localStorage.setItem('snakeName', randomName);
      }
      setAudio1Up(new Audio('/audio/1up.mp3'));
    }
  }, []);

  const safe = useCallback((p: Point, s: Point[]) => {
    return p.x >= 0 && p.x < gridWidth && p.y >= 0 && p.y < gridHeight && !s.some(v => v.x === p.x && v.y === p.y);
  }, []);

  const placeFood = useCallback((snake: Point[]) => {
    let f;
    do {
      f = {
        x: Math.floor(Math.random() * (gridWidth / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (gridHeight / gridSize)) * gridSize
      };
    } while (!safe(f, snake));
    return f;
  }, [safe]);

  const distance = (a: Point, b: Point) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const pathDistance = (snake: Point[], start: Point, goal: Point) => {
    const visited = new Set<string>();
    const tail = snake[snake.length - 1];
    const queue = [{ p: start, d: 0 }];
    while (queue.length) {
      const { p, d } = queue.shift()!;
      if (p.x === goal.x && p.y === goal.y) return d;
      for (const [dx, dy] of [[gridSize, 0], [-gridSize, 0], [0, gridSize], [0, -gridSize]]) {
        const nx = p.x + dx, ny = p.y + dy;
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const collide = snake.some(s => s.x === nx && s.y === ny) && !(nx === tail.x && ny === tail.y);
          if (!collide) {
            const key = `${nx},${ny}`;
            if (!visited.has(key)) {
              visited.add(key);
              queue.push({ p: { x: nx, y: ny }, d: d + 1 });
            }
          }
        }
      }
    }
    return Infinity;
  };

  const autoThink = useCallback((snake: Point[], food: Point) => {
    const head = snake[0];
    const dirs = [
      { x: gridSize, y: 0, label: 'Right' },
      { x: -gridSize, y: 0, label: 'Left' },
      { x: 0, y: gridSize, label: 'Down' },
      { x: 0, y: -gridSize, label: 'Up' }
    ];
    const candidates = dirs.map(d => {
      const next = { x: head.x + d.x, y: head.y + d.y };
      const ok = safe(next, snake);
      const dist = distance(next, food);
      const path = ok ? pathDistance(snake, next, food) : Infinity;
      return { ...d, next, ok, dist, path };
    }).filter(z => z.ok);
    if (!candidates.length) return { x: 0, y: 0, thought: "I'm trapped, staying put." };
    candidates.sort((a, b) => a.path - b.path || a.dist - b.dist);
    return { x: candidates[0].x, y: candidates[0].y, thought: `Heading ${candidates[0].label} safely.` };
  }, [safe]);

  const moveSnake = useCallback(() => {
    setState(prev => {
      const { snake, food, score, lastFoodTime, soundOn } = prev;
      const { x, y, thought } = autoThink(snake, food);
      if (x === 0 && y === 0 && thought.includes('trapped')) return { ...prev, thoughts: thought };
      const head = { x: snake[0].x + x, y: snake[0].y + y };
      const newSnake = [head, ...snake];
      if (head.x === food.x && head.y === food.y) {
        const now = Date.now();
        const timeDiff = now - lastFoodTime;
        const points = Math.max(10, Math.floor(10000 / (timeDiff + 1)));
        const newFood = placeFood(newSnake);
        if (soundOn && audio1Up) audio1Up.play();
        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          thoughts: thought,
          score: score + points,
          lastFoodTime: now
        };
      }
      newSnake.pop();
      return { ...prev, snake: newSnake, thoughts: thought };
    });
  }, [autoThink, placeFood, audio1Up]);

  const draw = useCallback((gs: GameState) => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, gridWidth, gridHeight);
    ctx.fillStyle = 'red';
    ctx.fillRect(gs.food.x, gs.food.y, gridSize, gridSize);
    const len = gs.snake.length;
    gs.snake.forEach((seg, i) => {
      const alpha = 1 - (i / (len - 1)) * 0.9;
      ctx.fillStyle = `rgba(0,255,0,${alpha})`;
      ctx.fillRect(seg.x - 2, seg.y - 2, gridSize + 4, gridSize + 4);
      ctx.fillStyle = i === 0 ? 'black' : 'green';
      ctx.fillRect(seg.x, seg.y, gridSize, gridSize);
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.gameRunning) {
      timer = setInterval(() => {
        moveSnake();
        draw(state);
      }, 120);
    }
    return () => clearInterval(timer);
  }, [state, moveSnake, draw]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-8">
      <div className="rounded-2xl shadow-2xl p-6 border-4 border-green-600 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-4">{snakeName} the Snake</h1>
        <canvas
          ref={canvasRef}
          width={gridWidth}
          height={gridHeight}
          className="bg-black border-4 border-green-500 mb-4 rounded"
        />
        <div className="flex space-x-4">
          <button
            onClick={() => setState(s => ({ ...s, gameRunning: !s.gameRunning }))}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            {state.gameRunning ? 'Pause Game' : 'Start Game'}
          </button>
          <button
            onClick={() => setState(s => ({ ...s, soundOn: !s.soundOn }))}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            {state.soundOn ? '🔊' : '🔇'}
          </button>
        </div>
        <p className="text-white mt-4 text-lg">Score: {state.score} | Length: {state.snake.length}</p>
        <p className="text-white mt-2 text-center">{state.thoughts}</p>
      </div>
    </div>
  );
}