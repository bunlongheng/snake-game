import { useEffect, useRef, useState } from 'react';

const gridSize = 20;
const gridWidth = 400;
const gridHeight = 400;

type Point = {
  x: number;
  y: number;
};

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 160, y: 160 }, { x: 140, y: 160 }]);
  const [food, setFood] = useState<Point>({ x: 300, y: 300 });
  const [direction, setDirection] = useState<Point>({ x: 20, y: 0 });

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };
    newSnake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      placeFood();
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  const placeFood = () => {
    const x = Math.floor(Math.random() * (gridWidth / gridSize)) * gridSize;
    const y = Math.floor(Math.random() * (gridHeight / gridSize)) * gridSize;
    setFood({ x, y });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, gridWidth, gridHeight);
      
      // Draw food
      ctx.fillStyle = 'red';
      ctx.fillRect(food.x, food.y, gridSize, gridSize);

      // Draw snake
      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'black' : 'green';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      moveSnake();
      draw();
    }, 100);
    return () => clearInterval(timer);
  }, [snake, food, direction]);

  return <canvas ref={canvasRef} width={gridWidth} height={gridHeight} className="bg-white border" />;
};

export default SnakeGame;