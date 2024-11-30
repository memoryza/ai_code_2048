import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState } from './types';
import './style.css';

interface TouchPoint {
  x: number;
  y: number;
}

const Game2048 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(4).fill(null).map(() => Array(4).fill(0)),
    score: 0,
    history: []
  });
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [canvasSize, setCanvasSize] = useState(400);

  // 更新画布大小
  const updateCanvasSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const maxSize = Math.min(containerWidth - 32, 600); // 32px for padding
      setCanvasSize(maxSize);
    }
  }, []);

  // 监听窗口大小变化
  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  const getTileColor = useCallback((value: number): string => {
    const colors: { [key: number]: string } = {
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

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const tileSize = (canvasSize - 50) / 4;
    const padding = 10;

    // 清空画布
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 绘制方块
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x = j * (tileSize + padding) + padding;
        const y = i * (tileSize + padding) + padding;
        const value = gameState.board[i][j];

        // 绘制方块背景
        ctx.fillStyle = getTileColor(value);
        ctx.fillRect(x, y, tileSize, tileSize);

        if (value !== 0) {
          // 绘制数字
          ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2';
          const fontSize = value >= 1024 ? tileSize * 0.3 : tileSize * 0.4;
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
  }, [gameState.board, getTileColor, canvasSize]);

  // 初始化游戏
  const initializeGame = useCallback(() => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setGameState({
      board: newBoard,
      score: 0,
      history: []
    });
  }, []);

  // 添加随机方块
  const addRandomTile = (board: number[][]) => {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ x: i, y: j });
        }
      }
    }
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  // 移动逻辑
  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const newBoard = JSON.parse(JSON.stringify(gameState.board));
    let moved = false;
    let newScore = gameState.score;

    const moveLeft = (board: number[][]) => {
      for (let i = 0; i < 4; i++) {
        // 1. 移除所有的0，将非0数字集中到一起
        let row = board[i].filter(x => x !== 0);
        
        // 2. 合并相邻的相同数字
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            newScore += row[j];
            row.splice(j + 1, 1);
          }
        }
        
        // 3. 补充0到长度为4
        while (row.length < 4) {
          row.push(0);
        }
        
        // 4. 检查是否发生了移动
        if (JSON.stringify(board[i]) !== JSON.stringify(row)) {
          moved = true;
        }
        
        // 5. 更新行
        board[i] = row;
      }
    };

    const rotate = (board: number[][], times: number) => {
      const size = board.length;
      for (let t = 0; t < times; t++) {
        // 转置矩阵
        for (let i = 0; i < size; i++) {
          for (let j = i + 1; j < size; j++) {
            [board[i][j], board[j][i]] = [board[j][i], board[i][j]];
          }
        }
        // 反转每一行
        for (let i = 0; i < size; i++) {
          board[i].reverse();
        }
      }
    };

    // 通过旋转矩阵来实现四个方向的移动
    switch (direction) {
      case 'left':
        moveLeft(newBoard);
        break;
      case 'right':
        rotate(newBoard, 2);
        moveLeft(newBoard);
        rotate(newBoard, 2);
        break;
      case 'down':
        rotate(newBoard, 1);
        moveLeft(newBoard);
        rotate(newBoard, 3);
        break;
      case 'up':
        rotate(newBoard, 3);
        moveLeft(newBoard);
        rotate(newBoard, 1);
        break;
    }

    if (moved) {
      addRandomTile(newBoard);
      setGameState(prev => ({
        board: newBoard,
        score: newScore,
        history: [...prev.history, { board: prev.board, score: prev.score }]
      }));
    }
  }, [gameState]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        switch (e.key) {
          case 'ArrowUp':
            move('up');
            break;
          case 'ArrowDown':
            move('down');
            break;
          case 'ArrowLeft':
            move('left');
            break;
          case 'ArrowRight':
            move('right');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        move(deltaY > 0 ? 'down' : 'up');
      }
    }
    
    setTouchStart(null);
  };

  // 游戏结束检查
  const checkGameOver = useCallback(() => {
    const board = gameState.board;
    
    // 检查是否还有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // 检查是否有可合并的相邻数字
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === board[i][j + 1]) return false;
        if (board[j][i] === board[j + 1][i]) return false;
      }
    }

    return true;
  }, [gameState.board]);

  // 游戏结束处理
  useEffect(() => {
    if (checkGameOver()) {
      const playerName = prompt('Game Over! Your score: ' + gameState.score + '\nEnter your name:') || 'Anonymous';
      const newScore = {
        playerName,
        score: gameState.score,
        date: new Date().toLocaleDateString()
      };
      
      const savedScores = JSON.parse(localStorage.getItem('gameScores') || '[]');
      localStorage.setItem('gameScores', JSON.stringify([...savedScores, newScore]));

      if (window.confirm('Start a new game?')) {
        initializeGame();
      }
    }
  }, [gameState.score, checkGameOver, initializeGame]);

  // 初始化和更新游戏界面
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    drawBoard();
  }, [drawBoard]);

  return (
    <div className="game-container" ref={containerRef}>
      <div className="game-header">
        <h1>2048</h1>
        <div className="score-container">
          <div>Score</div>
          <div>{gameState.score}</div>
        </div>
      </div>
      <div className="game-controls">
        <button onClick={initializeGame}>New Game</button>
        <button onClick={() => navigate('/2048/history')}>History</button>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="game-canvas"
      />
    </div>
  );
};

export default Game2048;
