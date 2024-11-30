import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState, TetrisBlock } from './types';
import './style.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BASE_BLOCK_SIZE = 25;

const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f0f0',
    type: 1 as TetrisBlock,
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#0000f0',
    type: 2 as TetrisBlock,
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#f0a000',
    type: 3 as TetrisBlock,
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000',
    type: 4 as TetrisBlock,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#00f000',
    type: 5 as TetrisBlock,
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#a000f0',
    type: 6 as TetrisBlock,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#f00000',
    type: 7 as TetrisBlock,
  },
};

const Tetris: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
    currentPiece: null,
    nextPiece: getRandomPiece(),
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
  });
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const dropCounter = useRef<number>(0);
  const dropInterval = useRef<number>(1000);
  const [blockSize, setBlockSize] = useState(BASE_BLOCK_SIZE);

  function getRandomPiece() {
    const pieces = Object.values(TETROMINOS);
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      shape: piece.shape,
      type: piece.type,
    };
  }

  const initializeGame = useCallback(() => {
    setGameState({
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
      currentPiece: {
        shape: getRandomPiece().shape,
        x: Math.floor(BOARD_WIDTH / 2) - 1,
        y: 0,
        type: getRandomPiece().type,
      },
      nextPiece: getRandomPiece(),
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
    });
    setIsPaused(false);
    dropInterval.current = 1000;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    gameState.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const piece = Object.values(TETROMINOS).find(p => p.type === value);
          if (piece) {
            ctx.fillStyle = piece.color;
            ctx.fillRect(
              x * blockSize,
              y * blockSize,
              blockSize - 1,
              blockSize - 1
            );
          }
        }
      });
    });

    // Draw current piece
    if (gameState.currentPiece) {
      const piece = Object.values(TETROMINOS).find(
        p => p.type === gameState.currentPiece?.type
      );
      if (piece) {
        ctx.fillStyle = piece.color;
        gameState.currentPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              ctx.fillRect(
                (gameState.currentPiece!.x + x) * blockSize,
                (gameState.currentPiece!.y + y) * blockSize,
                blockSize - 1,
                blockSize - 1
              );
            }
          });
        });
      }
    }
  }, [gameState, blockSize]);

  const collide = useCallback(
    (piece: NonNullable<GameState['currentPiece']>) => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x] !== 0) {
            const boardX = piece.x + x;
            const boardY = piece.y + y;

            if (
              boardX < 0 ||
              boardX >= BOARD_WIDTH ||
              boardY >= BOARD_HEIGHT ||
              (boardY >= 0 && gameState.board[boardY][boardX] !== 0)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [gameState.board]
  );

  const rotatePiece = useCallback(
    (piece: NonNullable<GameState['currentPiece']>) => {
      const rotated = piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
      );
      const newPiece = { ...piece, shape: rotated };

      if (!collide(newPiece)) {
        setGameState(prev => ({
          ...prev,
          currentPiece: newPiece,
        }));
      }
    },
    [collide]
  );

  const movePiece = useCallback(
    (direction: 'left' | 'right' | 'down') => {
      if (!gameState.currentPiece || gameState.gameOver || isPaused) return;

      const newPiece = { ...gameState.currentPiece };
      if (direction === 'left') newPiece.x -= 1;
      if (direction === 'right') newPiece.x += 1;
      if (direction === 'down') newPiece.y += 1;

      if (!collide(newPiece)) {
        setGameState(prev => ({ ...prev, currentPiece: newPiece }));
      } else if (direction === 'down') {
        // Merge piece with board
        const newBoard = [...gameState.board];
        gameState.currentPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              const boardY = gameState.currentPiece!.y + y;
              if (boardY >= 0) {
                newBoard[boardY][gameState.currentPiece!.x + x] =
                  gameState.currentPiece!.type;
              }
            }
          });
        });

        // Check for completed lines
        let linesCleared = 0;
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
          if (newBoard[y].every(value => value !== 0)) {
            newBoard.splice(y, 1);
            newBoard.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
          }
        }

        // Update score and level
        const newScore = gameState.score + linesCleared * 100 * gameState.level;
        const newLines = gameState.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;

        // Check game over
        const isGameOver = newBoard[0].some(cell => cell !== 0);

        if (isGameOver) {
          const history = JSON.parse(
            localStorage.getItem('tetrisHistory') || '[]'
          );
          history.push({
            score: newScore,
            lines: newLines,
            level: newLevel,
            date: new Date().toLocaleString(),
          });
          localStorage.setItem('tetrisHistory', JSON.stringify(history));
        }

        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPiece: isGameOver
            ? null
            : {
                ...prev.nextPiece,
                x: Math.floor(BOARD_WIDTH / 2) - 1,
                y: 0,
              },
          nextPiece: getRandomPiece(),
          score: newScore,
          lines: newLines,
          level: newLevel,
          gameOver: isGameOver,
        }));

        dropInterval.current = Math.max(100, 1000 - (newLevel - 1) * 100);
      }
    },
    [gameState, collide, isPaused]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (event.code) {
        case 'ArrowLeft':
          movePiece('left');
          break;
        case 'ArrowRight':
          movePiece('right');
          break;
        case 'ArrowDown':
          movePiece('down');
          break;
        case 'ArrowUp':
          if (gameState.currentPiece) {
            rotatePiece(gameState.currentPiece);
          }
          break;
        case 'Space':
          setIsPaused(prev => !prev);
          break;
      }
    },
    [gameState.gameOver, gameState.currentPiece, movePiece, rotatePiece]
  );

  const update = useCallback(
    (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPaused && !gameState.gameOver) {
        dropCounter.current += deltaTime;
        if (dropCounter.current > dropInterval.current) {
          movePiece('down');
          dropCounter.current = 0;
        }
      }

      draw();
      requestRef.current = requestAnimationFrame(update);
    },
    [draw, gameState.gameOver, isPaused, movePiece]
  );

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 计算合适的方块大小
      const maxWidth = Math.min(window.innerWidth * 0.9, 500);
      const maxHeight = window.innerHeight * 0.7;

      const widthBasedSize = Math.floor(maxWidth / BOARD_WIDTH);
      const heightBasedSize = Math.floor(maxHeight / BOARD_HEIGHT);

      // 使用较小的值来确保完全适应屏幕
      const newBlockSize = Math.min(widthBasedSize, heightBasedSize);

      setBlockSize(newBlockSize);
      canvas.width = newBlockSize * BOARD_WIDTH;
      canvas.height = newBlockSize * BOARD_HEIGHT;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = blockSize * BOARD_WIDTH;
      canvas.height = blockSize * BOARD_HEIGHT;
    }
    initializeGame();
  }, [initializeGame, blockSize]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [handleKeyDown, update]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Tetris</h1>
        <div className="score-container">
          <div className="score-box">Score: {gameState.score}</div>
          <div className="score-box">Level: {gameState.level}</div>
          <div className="score-box">Lines: {gameState.lines}</div>
        </div>
      </div>

      <div className="game-controls">
        <button onClick={initializeGame}>New Game</button>
        <button onClick={() => navigate('/tetris/history')}>History</button>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>

      <canvas ref={canvasRef} className="game-canvas" />

      {gameState.gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Score: {gameState.score}</p>
          <button onClick={initializeGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default Tetris;
