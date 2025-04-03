export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  answers?: Record<string, string>;
  score?: number;
  validWords?: number;
};

export type GameRoom = {
  id: string;
  code: string;
  host: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  settings: GameSettings;
  currentRound?: number;
  currentLetter?: string;
  timeLeft?: number;
  answers?: Record<string, Record<string, string>>;
  seed?: string;
  roundHistory?: RoundHistory[];
};

export type Category = {
  name: string;
  label: string;
};

export type Round = {
  letter: string;
  answers: Record<string, string>;
  score: number;
};

export type RoundHistory = {
  letter: string;
  playerAnswers: Record<string, PlayerRoundAnswers>;
};

export type PlayerRoundAnswers = {
  answers: Record<string, string>;
  validWords: number;
  score: number;
};

export type GameHistory = {
  id: string;
  date: string;
  rounds: Round[];
  totalScore: number;
  settings: GameSettings;
};

export type GameSettings = {
  timeLimit: number;
  maxPlayers: number;
  rounds: number;
  categories: Category[];
  customCategories: Category[];
};