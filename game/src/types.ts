export type GameConfig = {
  width: number;
  height: number;
  teamNames: string[];
  snakesPerTeam: number;
  nomsPerMove: number;
  nomActivity: boolean;
  nomDuration: number;
  killWorkers: boolean;
  roundDuration: number;
};

export type Game = {
  config: GameConfig;
  teams: Teams;
};

type Team = {
  name: string;
  score: number;
};
export type Teams = Record<string, Team>;

export type Round = {
  config: GameConfig;
  apples: Apples;
  teams: Teams;
  snakes: Snakes;
  duration: number;
  workerIds: string[];
  startedAt?: number;
  finished?: boolean;
};

export type Point = {
  x: number;
  y: number;
};

export type Apple = Point;
export type Apples = Record<string, Apple>;

export type Segment = {
  head: Point;
  direction: Direction;
  length: number;
};

export type Snake = {
  id: string;
  playerId: string;
  teamName: string;
  segments: Segment[];
  ateAppleId?: string;
};
export type Snakes = Record<string, Snake>;

export type Direction = 'up' | 'down' | 'left' | 'right';
