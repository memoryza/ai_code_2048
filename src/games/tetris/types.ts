export type TetrisBlock = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface GameState {
  board: TetrisBlock[][];
  currentPiece: {
    shape: number[][];
    x: number;
    y: number;
    type: TetrisBlock;
  } | null;
  nextPiece: {
    shape: number[][];
    type: TetrisBlock;
  };
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
}

export interface GameHistory {
  playerName: string;
  score: number;
  lines: number;
  level: number;
  date: string;
}
