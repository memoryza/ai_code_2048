import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState, Direction, Position, Ghost } from './types';
import './style.css';

const CELL_SIZE = 20;
const BOARD_WIDTH = 28;
const BOARD_HEIGHT = 21;
const MOVEMENT_SPEED = 150; // 移动速度（毫秒）

// 优化后的地图模板，确保所有路径都是连通的
const MAP_TEMPLATES = [
  [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "W............WW............W",
    "W.WWWW.WWWW.WW.WWWW.WWWW.W",
    "W.WWWW.WWWW.WW.WWWW.WWWW.W",
    "W.........................W",
    "W.WWWW.WW.WWWWWW.WW.WWWW.W",
    "W......WW....WW....WW.....W",
    "WWWWWW.WWWWW.WW.WWWWW.WWWW",
    "W......WW.........WW......W",
    "W.WWWW.WW.WW--WW.WW.WWWW.W",
    "W.WWWW....W    W....WWWW.W",
    "W.WWWW.WW.WWWWWW.WW.WWWW.W",
    "W......WW........WW......W",
    "WWWWWW.WW.WWWWWW.WW.WWWWW",
    "     W....W    W....W     ",
    "WWWWWW.WW.W    W.WW.WWWWW",
    "W............WW...........W",
    "W.WWWW.WWWW.WW.WWWW.WWWW.W",
    "W...WW................WW..W",
    "WWW.WW.WW.WWWWWW.WW.WW.WWW",
    "W......WW....WW....WW.....W",
    "W.WWWWWWWWWW.WW.WWWWWWWW.W",
    "W.........................W",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWW"
  ],
  [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "W.........................W",
    "W.WWWW.WWWWW.WW.WWWWW.WW.W",
    "W.WWWW.WWWWW.WW.WWWWW.WW.W",
    "W......WW.....WW.........W",
    "WWWWWW.WW.WWW.WW.WWW.WWWWW",
    "W......WW.WWW.WW.WWW.....W",
    "W.WWWW.WW.WWW.WW.WWW.WWWW",
    "W.WWWW...................W",
    "W......WW.WWWWWW.WW.....W",
    "WWWWWW.WW....WW....WWWWWW",
    "W......WW.WW.WW.WW......W",
    "W.WWWW.WW.WW.WW.WW.WWWW.W",
    "W.WWWW....WW.WW....WWWW.W",
    "W......WW.WW.WW.WW......W",
    "WWWWWW.WW....WW....WWWWWW",
    "W......WW.WWWWWW.WW.....W",
    "W.WWWW...................W",
    "W.WWWW.WW.WWW.WW.WWW.WWWW",
    "W......WW.WWW.WW.WWW.....W",
    "WWWWWW.WW.WWW.WW.WWW.WWWWW",
    "W......WW.....WW.........W",
    "W.........................W",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWW"
  ]
];

const Pacman: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    pacman: {
      position: { x: 14, y: 23 },
      direction: 'right'
    },
    ghosts: [
      { position: { x: 13, y: 14 }, direction: 'right', color: '#ff0000' },
      { position: { x: 16, y: 14 }, direction: 'left', color: '#00ffff' }
    ],
    score: 0,
    gameOver: false
  });

  const navigate = useNavigate();
  const requestRef = useRef<number>();
  const lastMoveTime = useRef<number>(0);
  const [currentDirection, setCurrentDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction>('right');
  const [gameStarted, setGameStarted] = useState(false);

  const validateMap = (board: string[][]): boolean => {
    // 检查是否有豆子
    let hasDots = false;
    // 检查每个豆子是否可达
    const visited = Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(false));
    const queue: Position[] = [];
    let startPos: Position | null = null;

    // 找到起始位置（第一个不是墙的位置）
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x] === 'dot') {
          hasDots = true;
        }
        if (board[y][x] !== 'wall' && !startPos) {
          startPos = { x, y };
          queue.push({ x, y });
          visited[y][x] = true;
        }
      }
    }

    if (!hasDots || !startPos) return false;

    // BFS遍历所有可达的位置
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      for (const [dx, dy] of directions) {
        const newX = current.x + dx;
        const newY = current.y + dy;
        
        if (newX >= 0 && newX < BOARD_WIDTH && 
            newY >= 0 && newY < BOARD_HEIGHT && 
            !visited[newY][newX] && 
            board[newY][newX] !== 'wall') {
          queue.push({ x: newX, y: newY });
          visited[newY][newX] = true;
        }
      }
    }

    // 检查所有豆子是否都可达
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x] === 'dot' && !visited[y][x]) {
          return false;
        }
      }
    }

    return true;
  };

  const initializeGame = useCallback(() => {
    let validMap = false;
    let board: string[][] = [];
    let selectedMap: string[] = [];

    // 尝试生成有效的地图
    while (!validMap) {
      selectedMap = MAP_TEMPLATES[Math.floor(Math.random() * MAP_TEMPLATES.length)];
      board = selectedMap.map(row => 
        row.split('').map(cell => {
          if (cell === '.') return 'dot';
          if (cell === 'W') return 'wall';
          return 'empty';
        })
      );

      validMap = validateMap(board);
    }

    // 找到一个有效的初始位置（不在墙上且靠近底部）
    let initialPacmanPos = { x: 14, y: BOARD_HEIGHT - 2 };
    while (board[initialPacmanPos.y][initialPacmanPos.x] === 'wall') {
      initialPacmanPos.y--;
      if (initialPacmanPos.y < 0) {
        initialPacmanPos = { x: Math.floor(BOARD_WIDTH / 2), y: BOARD_HEIGHT - 2 };
      }
    }

    // 为幽灵找到有效的初始位置
    const getValidGhostPosition = (): Position => {
      let pos = { 
        x: Math.floor(BOARD_WIDTH / 2), 
        y: Math.floor(BOARD_HEIGHT / 2) 
      };
      
      while (board[pos.y][pos.x] === 'wall') {
        pos.x = Math.floor(Math.random() * (BOARD_WIDTH - 2)) + 1;
        pos.y = Math.floor(BOARD_HEIGHT / 2);
      }
      return pos;
    };

    const ghost1Pos = getValidGhostPosition();
    const ghost2Pos = getValidGhostPosition();

    setGameState({
      board,
      pacman: {
        position: initialPacmanPos,
        direction: 'right'
      },
      ghosts: [
        { position: ghost1Pos, direction: 'right', color: '#ff0000' },
        { position: ghost2Pos, direction: 'left', color: '#00ffff' }
      ],
      score: 0,
      gameOver: false
    });
    
    setCurrentDirection('right');
    setNextDirection('right');
    lastMoveTime.current = Date.now();
  }, []);

  const canMove = useCallback((position: Position, direction: Direction): boolean => {
    const nextPos = { ...position };
    switch (direction) {
      case 'up':
        nextPos.y -= 1;
        break;
      case 'down':
        nextPos.y += 1;
        break;
      case 'left':
        nextPos.x -= 1;
        break;
      case 'right':
        nextPos.x += 1;
        break;
    }
    
    // 检查是否超出边界
    if (nextPos.x < 0 || nextPos.x >= BOARD_WIDTH || 
        nextPos.y < 0 || nextPos.y >= BOARD_HEIGHT) {
      return false;
    }
    
    // 检查下一个位置是否是墙
    return gameState.board[nextPos.y][nextPos.x] !== 'wall';
  }, [gameState.board]);

  const moveCharacter = useCallback((position: Position, direction: Direction): Position => {
    let newPosition = { ...position };
    
    switch (direction) {
      case 'up':
        newPosition.y = (newPosition.y - 1 + BOARD_HEIGHT) % BOARD_HEIGHT;
        break;
      case 'down':
        newPosition.y = (newPosition.y + 1) % BOARD_HEIGHT;
        break;
      case 'left':
        newPosition.x = (newPosition.x - 1 + BOARD_WIDTH) % BOARD_WIDTH;
        break;
      case 'right':
        newPosition.x = (newPosition.x + 1) % BOARD_WIDTH;
        break;
    }

    // Check if the new position is a wall
    if (gameState.board[newPosition.y][newPosition.x] === 'wall') {
      return position;
    }

    return newPosition;
  }, [gameState.board]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameState.gameOver) {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setNextDirection('up');
          if (!gameStarted) setGameStarted(true);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setNextDirection('down');
          if (!gameStarted) setGameStarted(true);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setNextDirection('left');
          if (!gameStarted) setGameStarted(true);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setNextDirection('right');
          if (!gameStarted) setGameStarted(true);
          break;
      }
    }
  }, [gameState.gameOver, gameStarted]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (gameState.gameOver) return;
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const deltaX = x - centerX;
    const deltaY = y - centerY;

    let newDirection: Direction;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      newDirection = deltaX > 0 ? 'right' : 'left';
    } else {
      newDirection = deltaY > 0 ? 'down' : 'up';
    }

    setNextDirection(newDirection);
    if (!gameStarted) setGameStarted(true);
  }, [gameState.gameOver, gameStarted]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart || gameState.gameOver) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setNextDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setNextDirection(deltaY > 0 ? 'down' : 'up');
      }
      if (!gameStarted) setGameStarted(true);
      setTouchStart(null);
    }
  }, [gameState.gameOver, gameStarted]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);

  const updateGame = useCallback(() => {
    if (!gameState.gameOver && gameStarted) {
      const currentTime = Date.now();
      const timeSinceLastMove = currentTime - lastMoveTime.current;

      if (timeSinceLastMove >= MOVEMENT_SPEED) {
        setGameState(prev => {
          if (!prev.pacman) return prev; // 防止pacman未定义

          // 检查是否可以向预期方向移动
          const canMoveNext = canMove(prev.pacman.position, nextDirection);
          // 检查是否可以继续当前方向
          const canMoveCurrent = canMove(prev.pacman.position, currentDirection);

          // 决定实际移动方向
          const actualDirection = canMoveNext ? nextDirection : 
                                canMoveCurrent ? currentDirection : 
                                prev.pacman.direction;

          // 计算新位置
          const newPacmanPos = moveCharacter(prev.pacman.position, actualDirection);
          
          let newScore = prev.score;
          const newBoard = [...prev.board];
          if (newBoard[newPacmanPos.y][newPacmanPos.x] === 'dot') {
            newBoard[newPacmanPos.y][newPacmanPos.x] = 'empty';
            newScore += 10;
          }

          // 移动幽灵
          const newGhosts = prev.ghosts.map(ghost => {
            const newPos = moveCharacter(ghost.position, ghost.direction);
            if (Math.random() < 0.1) {
              const availableDirections = ['up', 'down', 'left', 'right'].filter(dir => 
                canMove(ghost.position, dir as Direction)
              );
              if (availableDirections.length > 0) {
                ghost.direction = availableDirections[Math.floor(Math.random() * availableDirections.length)] as Direction;
              }
            }
            return { ...ghost, position: newPos };
          });

          // 检查碰撞
          const collision = newGhosts.some(ghost => 
            ghost.position.x === newPacmanPos.x && ghost.position.y === newPacmanPos.y
          );

          if (collision) {
            const history = JSON.parse(localStorage.getItem('pacmanHistory') || '[]');
            history.push({
              score: newScore,
              date: new Date().toLocaleString()
            });
            localStorage.setItem('pacmanHistory', JSON.stringify(history));
            return { ...prev, gameOver: true };
          }

          lastMoveTime.current = currentTime;
          setCurrentDirection(actualDirection);

          return {
            ...prev,
            board: newBoard,
            score: newScore,
            pacman: {
              position: newPacmanPos,
              direction: actualDirection
            },
            ghosts: newGhosts
          };
        });
      }
    }
  }, [gameState.gameOver, nextDirection, currentDirection, canMove, moveCharacter, gameStarted]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制游戏板
    gameState.board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'wall') {
          ctx.fillStyle = '#2121DE';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (cell === 'dot') {
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 8,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });
    });

    // 绘制吃豆人
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    const pacmanX = gameState.pacman.position.x * CELL_SIZE + CELL_SIZE / 2;
    const pacmanY = gameState.pacman.position.y * CELL_SIZE + CELL_SIZE / 2;
    const mouthAngle = 0.2 * Math.PI;
    let startAngle = 0;
    let endAngle = 2 * Math.PI;

    // 根据方向调整吃豆人的朝向
    switch (gameState.pacman.direction) {
      case 'right':
        startAngle = mouthAngle;
        endAngle = 2 * Math.PI - mouthAngle;
        break;
      case 'left':
        startAngle = Math.PI + mouthAngle;
        endAngle = Math.PI - mouthAngle;
        break;
      case 'up':
        startAngle = Math.PI * 1.5 + mouthAngle;
        endAngle = Math.PI * 1.5 - mouthAngle;
        break;
      case 'down':
        startAngle = Math.PI * 0.5 + mouthAngle;
        endAngle = Math.PI * 0.5 - mouthAngle;
        break;
    }

    ctx.arc(pacmanX, pacmanY, CELL_SIZE / 2, startAngle, endAngle);
    ctx.lineTo(pacmanX, pacmanY);
    ctx.fill();

    // 绘制幽灵
    gameState.ghosts.forEach(ghost => {
      ctx.fillStyle = ghost.color;
      ctx.beginPath();
      const ghostX = ghost.position.x * CELL_SIZE + CELL_SIZE / 2;
      const ghostY = ghost.position.y * CELL_SIZE + CELL_SIZE / 2;
      
      // 绘制幽灵身体
      ctx.arc(ghostX, ghostY - CELL_SIZE / 4, CELL_SIZE / 2, Math.PI, 0, false);
      ctx.lineTo(ghostX + CELL_SIZE / 2, ghostY + CELL_SIZE / 4);
      
      // 绘制波浪形底部
      for (let i = 0; i < 3; i++) {
        const curve = CELL_SIZE / 6;
        ctx.quadraticCurveTo(
          ghostX + CELL_SIZE / 2 - curve * (2 - i),
          ghostY + CELL_SIZE / 4 + curve,
          ghostX + CELL_SIZE / 2 - curve * (3 - i),
          ghostY + CELL_SIZE / 4
        );
      }
      
      ctx.lineTo(ghostX - CELL_SIZE / 2, ghostY + CELL_SIZE / 4);
      ctx.fill();

      // 绘制眼睛
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(ghostX - CELL_SIZE / 4, ghostY - CELL_SIZE / 4, CELL_SIZE / 6, 0, Math.PI * 2);
      ctx.arc(ghostX + CELL_SIZE / 4, ghostY - CELL_SIZE / 4, CELL_SIZE / 6, 0, Math.PI * 2);
      ctx.fill();

      // 绘制瞳孔
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(ghostX - CELL_SIZE / 4, ghostY - CELL_SIZE / 4, CELL_SIZE / 10, 0, Math.PI * 2);
      ctx.arc(ghostX + CELL_SIZE / 4, ghostY - CELL_SIZE / 4, CELL_SIZE / 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // 如果游戏结束，显示游戏结束文字
    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = '48px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 30);
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameOver) {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            setNextDirection('up');
            if (!gameStarted) setGameStarted(true);
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            setNextDirection('down');
            if (!gameStarted) setGameStarted(true);
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            setNextDirection('left');
            if (!gameStarted) setGameStarted(true);
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            setNextDirection('right');
            if (!gameStarted) setGameStarted(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameOver, gameStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = BOARD_WIDTH * CELL_SIZE;
      canvas.height = BOARD_HEIGHT * CELL_SIZE;
    }
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      if (!gameState.gameOver && gameStarted) {
        const now = Date.now();
        if (now - lastMoveTime.current >= MOVEMENT_SPEED) {
          updateGame();
          lastMoveTime.current = now;
        }
      }
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [updateGame, draw, gameState, gameStarted]);

  return (
    <div className="pacman-container">
      <div className="game-header">
        <h1>Pacman</h1>
        <div className="score-container">
          <div className="score-box">Score: {gameState.score}</div>
        </div>
      </div>

      <div className="game-area">
        <canvas 
          ref={canvasRef} 
          className="game-canvas" 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {gameState.gameOver && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>Score: {gameState.score}</p>
          </div>
        )}
      </div>

      <div className="game-controls">
        <button onClick={() => { initializeGame(); setGameStarted(false); }}>New Game</button>
        <button onClick={() => navigate('/pacman/history')}>History</button>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
};

export default Pacman;
