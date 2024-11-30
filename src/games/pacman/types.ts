export type Direction = 'up' | 'down' | 'left' | 'right';

export type CellType = 'empty' | 'wall' | 'dot' | 'power' | 'pacman' | 'ghost';

export interface Position {
  x: number;
  y: number;
}

export interface Ghost {
  position: Position;
  direction: Direction;
  color: string;
}

export interface GameState {
  board: CellType[][];
  pacman: {
    position: Position;
    direction: Direction;
  };
  ghosts: Ghost[];
  score: number;
  lives: number;
  gameOver: boolean;
}

export interface GameHistory {
  date: string;
  score: number;
}
