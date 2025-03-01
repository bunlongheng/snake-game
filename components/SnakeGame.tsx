import { useEffect, useRef, useState, useCallback } from 'react';

const gridSize = 20;
const gridWidth = 400;
const gridHeight = 400;

type Point = { x: number; y: number; };

interface GameState {
  snake: Point[];
  food: Point;
  gameRunning: boolean;
  soundOn: boolean;
  thoughts: string;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 160, y: 160 }, { x: 140, y: 160 }],
    food: { x: 300, y: 300 },
    gameRunning: false,
    soundOn: true,
    thoughts: "Click 'Start Game' to begin."
  });

  const safe = useCallback((p: Point, snake: Point[]) => {
    return (
      p.x >= 0 &&
      p.x < gridWidth &&
      p.y >= 0 &&
      p.y < gridHeight &&
      !snake.some(s => s.x === p.x && s.y === p.y)
    );
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

  const distance = (a: Point, b: Point) => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  };

  const autoThink = useCallback((snake: Point[], food: Point) => {
    const head = snake[0];
    const directions = [
      { dir: { x: gridSize, y: 0 }, label: 'Right' },
      { dir: { x: -gridSize, y: 0 }, label: 'Left' },
      { dir: { x: 0, y: gridSize }, label: 'Down' },
      { dir: { x: 0, y: -gridSize }, label: 'Up' }
    ];
    const candidates = directions.map(d => {
      const next = { x: head.x + d.dir.x, y: head.y + d.dir.y };
      const isSafe = safe(next, snake);
      const dist = distance(next, food);
      return { ...d, isSafe, dist, next };
    }).filter(c => c.isSafe);

    if (!candidates.length) {
      return { x: 0, y: 0, thought: "I'm trapped, staying put." };
    }
    candidates.sort((a, b) => a.dist - b.dist);
    return {
      x: candidates[0].dir.x,
      y: candidates[0].dir.y,
      thought: `Heading ${candidates[0].label} to reach food safely.`
    };
  }, [safe]);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      const { snake, food } = prev;
      const { x, y, thought } = autoThink(snake, food);
      if (x === 0 && y === 0 && thought.includes('trapped')) {
        return { ...prev, thoughts: thought };
      }
      const head = { x: snake[0].x + x, y: snake[0].y + y };
      const newSnake = [head, ...snake];
      if (head.x === food.x && head.y === food.y) {
        const newFood = placeFood(newSnake);
        return { ...prev, snake: newSnake, food: newFood, thoughts: thought };
      }
      newSnake.pop();
      return { ...prev, snake: newSnake, thoughts: thought };
    });
  }, [autoThink, placeFood]);

  const draw = useCallback((gs: GameState) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, gridWidth, gridHeight);
    ctx.fillStyle = 'red';
    ctx.fillRect(gs.food.x, gs.food.y, gridSize, gridSize);
    gs.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? 'black' : 'green';
      ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.gameRunning) {
      timer = setInterval(() => {
        moveSnake();
        draw(gameState);
      }, 150);
    }
    return () => clearInterval(timer);
  }, [gameState, moveSnake, draw]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <canvas ref={canvasRef} width={gridWidth} height={gridHeight} className="bg-black border border-green-500" />
      <div className="text-white mt-4">
        <button
          onClick={() => setGameState(p => ({ ...p, gameRunning: !p.gameRunning }))}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {gameState.gameRunning ? 'Pause Game' : 'Start Game'}
        </button>
        <button
          onClick={() => setGameState(p => ({ ...p, soundOn: !p.soundOn }))}
          className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {gameState.soundOn ? 'Sound: On' : 'Sound: Off'}
        </button>
      </div>
      <p className="mt-2 text-white">{gameState.thoughts}</p>
    </div>
  );
}