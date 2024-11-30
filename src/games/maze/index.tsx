import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

interface Position {
  x: number;
  y: number;
}

interface GameState {
  board: string[][];
  player: Position;
  exit: Position;
  gameWon: boolean;
}

const CELL_SIZE = 30;
const BOARD_WIDTH = 30;  // 增加迷宫宽度
const BOARD_HEIGHT = 20; // 增加迷宫高度

const MazeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    player: { x: 1, y: 1 },
    exit: { x: BOARD_WIDTH - 2, y: BOARD_HEIGHT - 2 },
    gameWon: false
  });
  const [touchStart, setTouchStart] = useState<Position | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 计算单元格大小以适应屏幕
  const calculateCellSize = useCallback(() => {
    if (!containerRef.current) return CELL_SIZE;
    
    const container = containerRef.current;
    const maxWidth = container.clientWidth * 0.9; // 留出一些边距
    const maxHeight = (window.innerHeight - 200) * 0.9; // 减去头部和按钮的空间
    
    const cellWidth = Math.floor(maxWidth / BOARD_WIDTH);
    const cellHeight = Math.floor(maxHeight / BOARD_HEIGHT);
    
    return Math.min(cellWidth, cellHeight);
  }, []);

  const [cellSize, setCellSize] = useState(CELL_SIZE);
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制迷宫
    gameState.board.forEach((row, y) => {
      row.forEach((cell, x) => {
        ctx.fillStyle = cell === 'wall' ? '#333' : 
                       cell === 'exit' ? '#4CAF50' : '#fff';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });
    });

    // 绘制玩家
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(
      gameState.player.x * cellSize + cellSize / 2,
      gameState.player.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [gameState, cellSize]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const newCellSize = calculateCellSize();
      setCellSize(newCellSize);
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = BOARD_WIDTH * newCellSize;
        canvas.height = BOARD_HEIGHT * newCellSize;
        draw();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCellSize, draw]);

  const generateMaze = () => {
    // 初始化迷宫，所有格子都是墙
    const maze: string[][] = Array(BOARD_HEIGHT).fill(0).map(() =>
      Array(BOARD_WIDTH).fill('wall')
    );

    const stack: Position[] = [];
    const start: Position = { x: 1, y: 1 };
    maze[start.y][start.x] = 'path';
    stack.push(start);

    // 深度优先搜索生成迷宫
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [
        { x: current.x + 2, y: current.y, between: { x: current.x + 1, y: current.y } },
        { x: current.x - 2, y: current.y, between: { x: current.x - 1, y: current.y } },
        { x: current.x, y: current.y + 2, between: { x: current.x, y: current.y + 1 } },
        { x: current.x, y: current.y - 2, between: { x: current.x, y: current.y - 1 } }
      ].filter(pos => 
        pos.x > 0 && pos.x < BOARD_WIDTH - 1 && 
        pos.y > 0 && pos.y < BOARD_HEIGHT - 1 && 
        maze[pos.y][pos.x] === 'wall'
      );

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        maze[next.y][next.x] = 'path';
        maze[next.between.y][next.between.x] = 'path';
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // 设置出口
    maze[BOARD_HEIGHT - 2][BOARD_WIDTH - 2] = 'exit';

    return maze;
  };

  const initializeGame = useCallback(() => {
    const newBoard = generateMaze();
    setGameState({
      board: newBoard,
      player: { x: 1, y: 1 },
      exit: { x: BOARD_WIDTH - 2, y: BOARD_HEIGHT - 2 },
      gameWon: false
    });
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      const newX = prev.player.x + dx;
      const newY = prev.player.y + dy;

      // 检查是否可以移动到新位置
      if (newX < 0 || newX >= BOARD_WIDTH || 
          newY < 0 || newY >= BOARD_HEIGHT || 
          prev.board[newY][newX] === 'wall') {
        return prev;
      }

      // 检查是否到达出口
      const gameWon = newX === prev.exit.x && newY === prev.exit.y;

      return {
        ...prev,
        player: { x: newX, y: newY },
        gameWon
      };
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.gameWon) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        movePlayer(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        movePlayer(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        movePlayer(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        movePlayer(1, 0);
        break;
    }
  }, [gameState.gameWon, movePlayer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState.gameWon) return;
    
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || gameState.gameWon) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // 检测移动距离是否足够触发移动（防止微小移动）
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      // 判断主要移动方向
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平移动
        movePlayer(deltaX > 0 ? 1 : -1, 0);
      } else {
        // 垂直移动
        movePlayer(0, deltaY > 0 ? 1 : -1);
      }
      // 重置触摸起点，允许连续滑动
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY
      });
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };


  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = BOARD_WIDTH * cellSize;
    canvas.height = BOARD_HEIGHT * cellSize;

    draw();
  }, [draw]);

  return (
    <div className="maze-container" ref={containerRef}>
      <h1>小迷宫</h1>
      <div className="game-area">
        <canvas 
          ref={canvasRef} 
          className="game-canvas"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {gameState.gameWon && (
          <div className="game-won">
            <h2>恭喜!</h2>
            <p>你找到出口了！</p>
          </div>
        )}
      </div>
      <div className="game-controls">
        <button onClick={initializeGame}>重新开始</button>
        <button onClick={() => navigate('/')}>返回首页</button>
      </div>
      <div className="game-instructions">
        <p>使用方向键、WASD或滑动屏幕来移动</p>
      </div>
    </div>
  );
};

export default MazeGame;
