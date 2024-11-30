export interface GameHistory {
  board: number[][];
  score: number;
}

export interface GameState {
  board: number[][];
  score: number;
  history: GameHistory[];
}

export interface ScoreRecord {
  playerName: string;
  score: number;
  date: string;
}
