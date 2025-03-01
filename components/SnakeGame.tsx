import { useEffect, useRef, useState, useCallback } from 'react';

const gridSize = 20;
const gridWidth = 400;
const gridHeight = 400;

type Point = {
  x: number;
  y: number;
};

interface GameState {
  snake: Point[];
  food: Point;
  direction: Point;
  gameRunning: boolean;
  soundOn: boolean;
  thoughts: string;
}

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 160, y: 160 }, { x: 140, y: 160 }],
    food: { x: 300, y: 300 },
    direction: { x: 20, y: 0 },
    gameRunning: false,
    soundOn: true,
    thoughts: "Click 'Start Game' to begin."
  });

  const checkCollision = (head: Point) => {
    return head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight || gameState.snake.some(segment => head.x === segment.x && head.y === segment.y);
  };

  const moveSnake = useCallback(() => {
    const head = { x: gameState.snake[0].x + gameState.direction.x, y: gameState.snake[0].y + gameState.direction.y };
    if (checkCollision(head)) {
      setGameState(prev => ({ ...prev, gameRunning: false, thoughts: "Crashed! Game over." }));
      return;
    }
    const newSnake = [...gameState.snake];
    newSnake.unshift(head);
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
      placeFood();
      setGameState(prev => ({ ...prev, snake: newSnake, thoughts: "Found food! Searching for more..." }));
    } else {
      newSnake.pop();
      setGameState(prev => ({ ...prev, snake: newSnake }));
    }
  }, [gameState]);

  const placeFood = () => {
    let x, y;
    do {
      x = Math.floor(Math.random() * (gridWidth / gridSize)) * gridSize;
      y = Math.floor(Math.random() * (gridHeight / gridSize)) * gridSize;
    } while (gameState.snake.some(segment => segment.x === x && segment.y === y));
    setGameState(prev => ({ ...prev, food: { x, y } }));
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, gridWidth, gridHeight);
      ctx.fillStyle = 'red';
      ctx.fillRect(gameState.food.x, gameState.food.y, gridSize, gridSize);
      gameState.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'black' : 'green';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
      });
    }
  }, [gameState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.gameRunning) {
      timer = setInterval(() => {
        moveSnake();
        draw();
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState.gameRunning, moveSnake, draw]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <canvas ref={canvasRef} width={gridWidth} height={gridHeight} className="bg-black border border-green-500" />
      <div className="text-white mt-4">
        <button onClick={() => setGameState(prev => ({ ...prev, gameRunning: !prev.gameRunning }))}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          {gameState.gameRunning ? 'Pause Game' : 'Start Game'}
        </button>
        <button onClick={() => setGameState(prev => ({ ...prev, soundOn: !prev.soundOn }))}
                className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          {gameState.soundOn ? 'Sound: On' : 'Sound: Off'}
        </button>
      </div>
      <p className="mt-2 text-white">{gameState.thoughts}</p>
    </div>
  );
};

export default SnakeGame;