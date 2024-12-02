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

// 动态设置迷宫大小
const BOARD_WIDTH = 15;  // 减小迷宫宽度，更适合手机屏幕
const BOARD_HEIGHT = 20; // 保持高度，但确保不会太大
const MIN_CELL_SIZE = 20; // 最小单元格大小
const MAX_CELL_SIZE = 40; // 最大单元格大小

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
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const navigate = useNavigate();

  // 计算最佳单元格大小
  const calculateCellSize = useCallback(() => {
    if (!containerRef.current) return MIN_CELL_SIZE;
    
    const container = containerRef.current;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 计算可用空间（减去边距和其他UI元素的空间）
    const availableWidth = Math.min(screenWidth - 40, container.clientWidth - 40); // 40px for padding
    const availableHeight = screenHeight - 200; // 减去头部和按钮的空间
    
    // 根据屏幕方向计算单元格大小
    const cellWidth = Math.floor(availableWidth / BOARD_WIDTH);
    const cellHeight = Math.floor(availableHeight / BOARD_HEIGHT);
    
    // 确保单元格大小在合理范围内
    const calculatedSize = Math.min(cellWidth, cellHeight, MAX_CELL_SIZE);
    return Math.max(calculatedSize, MIN_CELL_SIZE);
  }, []);

  const [cellSize, setCellSize] = useState(MIN_CELL_SIZE);

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

  // 处理屏幕方向变化
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const newCellSize = calculateCellSize();
      setCellSize(newCellSize);
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = BOARD_WIDTH * newCellSize;
        canvas.height = BOARD_HEIGHT * newCellSize;
        requestAnimationFrame(draw); // 使用 requestAnimationFrame 优化性能
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCellSize, draw]);

  // 检查是否存在从起点到终点的路径
  const hasValidPath = (maze: string[][], start: Position, end: Position): boolean => {
    const visited = Array(BOARD_HEIGHT).fill(0).map(() =>
      Array(BOARD_WIDTH).fill(false)
    );
    const queue: Position[] = [start];
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.x === end.x && current.y === end.y) {
        return true;
      }

      // 检查四个方向
      const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }  // 左
      ];

      for (const dir of directions) {
        const newX = current.x + dir.dx;
        const newY = current.y + dir.dy;

        if (newX >= 0 && newX < BOARD_WIDTH &&
            newY >= 0 && newY < BOARD_HEIGHT &&
            !visited[newY][newX] &&
            maze[newY][newX] !== 'wall') {
          queue.push({ x: newX, y: newY });
          visited[newY][newX] = true;
        }
      }
    }

    return false;
  };

  const generateMaze = () => {
    let maze: string[][];
    let isValidMaze = false;
    
    // 不断生成迷宫直到有有效路径
    while (!isValidMaze) {
      // 初始化迷宫，所有格子都是墙
      maze = Array(BOARD_HEIGHT).fill(0).map(() =>
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
          // 改进的路径生成权重
          neighbors.sort(() => {
            const random = Math.random();
            const distanceToExit = Math.abs(BOARD_WIDTH - 2 - current.x) + Math.abs(BOARD_HEIGHT - 2 - current.y);
            const exitWeight = 1 - (distanceToExit / (BOARD_WIDTH + BOARD_HEIGHT));
            
            // 在靠近出口时增加向出口方向移动的概率
            const directionBias = exitWeight * 0.3;
            
            // 添加一些随机性以创建多条路径
            const randomFactor = random * 0.7;
            
            return (directionBias + randomFactor) - 0.5;
          });
          
          // 有概率创建额外的路径
          const createExtraPath = Math.random() < 0.2; // 20%的概率创建额外路径
          if (createExtraPath && neighbors.length > 1) {
            const extraNext = neighbors[1];
            maze[extraNext.y][extraNext.x] = 'path';
            maze[extraNext.between.y][extraNext.between.x] = 'path';
          }
          
          const next = neighbors[0];
          maze[next.y][next.x] = 'path';
          maze[next.between.y][next.between.x] = 'path';
          stack.push(next);
        } else {
          stack.pop();
        }
      }

      // 设置出口
      const exit: Position = { x: BOARD_WIDTH - 2, y: BOARD_HEIGHT - 2 };
      maze[exit.y][exit.x] = 'exit';

      // 验证是否存在有效路径
      isValidMaze = hasValidPath(maze, { x: 1, y: 1 }, exit);
      
      // 如果没有有效路径，确保连接到出口
      if (!isValidMaze) {
        // 使用更自然的路径连接
        let current = { x: exit.x - 1, y: exit.y };
        while (current.x > 1 || current.y > 1) {
          maze[current.y][current.x] = 'path';
          
          // 随机选择是先移动x还是y，使路径更自然
          if (Math.random() < 0.5) {
            if (current.x > 1) {
              current.x--;
              // 有时候添加一个支路
              if (Math.random() < 0.3 && current.y > 2) {
                maze[current.y - 1][current.x] = 'path';
              }
            } else if (current.y > 1) {
              current.y--;
            }
          } else {
            if (current.y > 1) {
              current.y--;
              // 有时候添加一个支路
              if (Math.random() < 0.3 && current.x > 2) {
                maze[current.y][current.x - 1] = 'path';
              }
            } else if (current.x > 1) {
              current.x--;
            }
          }
        }
        
        // 确保起点和终点附近有足够的空间
        maze[1][2] = 'path';
        maze[2][1] = 'path';
        maze[exit.y - 1][exit.x] = 'path';
        maze[exit.y][exit.x - 1] = 'path';
        
        // 再次验证
        isValidMaze = hasValidPath(maze, { x: 1, y: 1 }, exit);
      }
    }

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
      <div className={`game-area ${isPortrait ? 'portrait' : 'landscape'}`}>
        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={BOARD_WIDTH * cellSize}
          height={BOARD_HEIGHT * cellSize}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {gameState.gameWon && (
          <div className="game-won">
            <h2>恭喜你赢了！</h2>
            <button onClick={initializeGame}>再玩一次</button>
          </div>
        )}
      </div>
      <div className="game-controls">
        <button onClick={initializeGame}>重新开始</button>
        <button onClick={() => navigate('/')}>返回首页</button>
      </div>
    </div>
  );
};

export default MazeGame;
