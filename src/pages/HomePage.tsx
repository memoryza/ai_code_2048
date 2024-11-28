import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState, GameHistory } from '../types/game';

interface TouchPoint {
  x: number;
  y: number;
}

const HomePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(4).fill(null).map(() => Array(4).fill(0)),
    score: 0,
    history: []
  });
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);

  // 将 getTileColor 移到最前面
  const getTileColor = useCallback((value: number): string => {
    const colors: { [key: number]: string } = {
      0: '#cdc1b4',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };
    return colors[value] || '#cdc1b4';
  }, []);

  // 简化 drawBoard 函数，移除动画相关代码
  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 获取画布的实际尺寸
    const canvasSize = Math.min(window.innerWidth - 32, 600);
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const tileSize = (canvasSize - 50) / 4;
    const padding = 10;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 绘制棋盘
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x = j * (tileSize + padding) + padding;
        const y = i * (tileSize + padding) + padding;
        const value = gameState.board[i][j];

        ctx.fillStyle = getTileColor(value);
        ctx.fillRect(x, y, tileSize, tileSize);

        if (value !== 0) {
          ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2';
          const fontSize = tileSize * 0.35;
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            value.toString(),
            x + tileSize / 2,
            y + tileSize / 2
          );
        }
      }
    }
  }, [gameState.board, getTileColor]);

  // 添加 useEffect 来监听 gameState 变化并重新渲染画布
  useEffect(() => {
    drawBoard();
  }, [drawBoard, gameState]);

  // 修改 handleKeyPress 函数，移除动画相关代码
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    setGameState(prev => {
      let moved = false;
      const newBoard = prev.board.map(row => [...row]);
      let newScore = prev.score;

      const moveBoard = (direction: 'up' | 'down' | 'left' | 'right') => {
        // 移动和合并函数
        const moveAndMerge = (line: number[]): number[] => {
          // 1. 移除所有的 0
          let numbers = line.filter(x => x !== 0);
          
          // 2. 从左到右合并相邻的相同数字
          for (let i = 0; i < numbers.length - 1; i++) {
            if (numbers[i] === numbers[i + 1]) {
              numbers[i] *= 2;
              newScore += numbers[i];
              numbers.splice(i + 1, 1);
            }
          }
          
          // 3. 补充 0 到原来的长度
          while (numbers.length < 4) {
            numbers.push(0);
          }
          
          return numbers;
        };

        // 处理每一行/列的移动和合并
        if (direction === 'left' || direction === 'right') {
          for (let i = 0; i < 4; i++) {
            const line = [...newBoard[i]];
            const merged = direction === 'left' ? 
              moveAndMerge(line) : 
              moveAndMerge([...line].reverse()).reverse();
            
            if (JSON.stringify(line) !== JSON.stringify(merged)) {
              moved = true;
              newBoard[i] = merged;
            }
          }
        } else {
          for (let j = 0; j < 4; j++) {
            const line = newBoard.map(row => row[j]);
            const merged = direction === 'up' ? 
              moveAndMerge(line) : 
              moveAndMerge([...line].reverse()).reverse();
            
            if (JSON.stringify(line) !== JSON.stringify(merged)) {
              moved = true;
              merged.forEach((val, i) => newBoard[i][j] = val);
            }
          }
        }

        return moved;
      };

      switch (event.key) {
        case 'ArrowUp':
          moved = moveBoard('up');
          break;
        case 'ArrowDown':
          moved = moveBoard('down');
          break;
        case 'ArrowLeft':
          moved = moveBoard('left');
          break;
        case 'ArrowRight':
          moved = moveBoard('right');
          break;
        default:
          return prev;
      }

      // 只有在实际发生移动时才更新状态
      if (!moved) return prev;

      // 立即添加新数字，不需要等待动画
      const emptyCells: [number, number][] = [];
      newBoard.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell === 0) emptyCells.push([i, j]);
        });
      });

      if (emptyCells.length > 0) {
        const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        newBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
      }

      return {
        board: newBoard,
        score: newScore,
        history: [...prev.history, { board: prev.board, score: prev.score }]
      };
    });
  }, []);

  // 修改初始化逻辑
  useEffect(() => {
    // 初始化时添加一个数字
    setGameState(prev => {
      const emptyCells: [number, number][] = [];
      prev.board.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell === 0) emptyCells.push([i, j]);
        });
      });

      if (emptyCells.length === 0) return prev;

      const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newValue = Math.random() < 0.9 ? 2 : 4;

      const newBoard = prev.board.map(row => [...row]);
      newBoard[i][j] = newValue;
      
      return {
        ...prev,
        board: newBoard
      };
    });
    
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyPress);
    
    // 清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 处理撤销操作
  const handleUndo = () => {
    if (gameState.history.length === 0) return;
    
    const previousState = gameState.history[gameState.history.length - 1];
    setGameState(prev => ({
      board: previousState.board,
      score: previousState.score,
      history: prev.history.slice(0, -1)
    }));
  };

  // 修改检查游戏结束的逻辑
  const checkGameOver = useCallback(() => {
    const board = gameState.board;
    
    // 1. 检查是否还有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          return false;
        }
      }
    }

    // 2. 检查水平方向是否有可以合并的相邻数字
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === board[i][j + 1]) {
          return false;
        }
      }
    }

    // 3. 检查垂直方向是否有可以合并的相邻数字
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === board[i + 1][j]) {
          return false;
        }
      }
    }

    // 如果没有空格且没有可以合并的数字，游戏结束
    return true;
  }, [gameState.board]);

  // 修改游戏结束处理逻辑
  useEffect(() => {
    if (checkGameOver()) {
      // 延迟显示游戏结束提示，等待最后一次移动的动画完成
      setTimeout(() => {
        const playerName = prompt('Game Over! Your score: ' + gameState.score + '\nEnter your name:') || 'Anonymous';
        const newScore = {
          playerName,
          score: gameState.score,
          date: new Date().toLocaleDateString()
        };
        
        // 保存分数到本地存储
        const savedScores = JSON.parse(localStorage.getItem('gameScores') || '[]');
        const updatedScores = [...savedScores, newScore].sort((a, b) => b.score - a.score); // 按分数降序排序
        localStorage.setItem('gameScores', JSON.stringify(updatedScores));

        // 询问是否开始新游戏
        if (window.confirm('Start a new game?')) {
          // 重置游戏状态
          setGameState({
            board: Array(4).fill(null).map(() => Array(4).fill(0)),
            score: 0,
            history: []
          });
          // 添加初始数字
          setTimeout(() => {
            setGameState(prev => {
              const emptyCells: [number, number][] = [];
              prev.board.forEach((row, i) => {
                row.forEach((cell, j) => {
                  if (cell === 0) emptyCells.push([i, j]);
                });
              });
              
              const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
              const newBoard = prev.board.map(row => [...row]);
              newBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
              
              return {
                ...prev,
                board: newBoard
              };
            });
          }, 0);
        }
      }, 300); // 等待最后一次移动的动画完成
    }
  }, [gameState.board, gameState.score, checkGameOver]);



  // 添加触摸事件处理函数
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50; // 最小滑动距离

    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          // 向右滑动
          handleKeyPress({ key: 'ArrowRight' } as KeyboardEvent);
        } else {
          // 向左滑动
          handleKeyPress({ key: 'ArrowLeft' } as KeyboardEvent);
        }
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          // 向下滑动
          handleKeyPress({ key: 'ArrowDown' } as KeyboardEvent);
        } else {
          // 向上滑动
          handleKeyPress({ key: 'ArrowUp' } as KeyboardEvent);
        }
      }
    }

    setTouchStart(null);
  }, [touchStart, handleKeyPress]);

  // 添加屏幕尺寸变化监听
  useEffect(() => {
    const handleResize = () => {
      drawBoard();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawBoard]);

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 min-h-screen">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">2048 Game</h1>
      <div className="mb-4">Score: {gameState.score}</div>
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="border-2 border-gray-300 rounded-lg mb-4 touch-none"
      />
      <div className="flex gap-4 flex-col sm:flex-row w-full sm:w-auto">
        <button
          onClick={handleUndo}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Undo
        </button>
        <button
          onClick={() => navigate('/history')}
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          View History
        </button>
      </div>
    </div>
  );
};

export default HomePage; 