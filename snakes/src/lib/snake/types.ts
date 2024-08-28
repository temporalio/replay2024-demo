export type GameConfig = {
  width: number;
  height: number;
  teams: string[];
  snakesPerTeam: number;
};

export type Game = {
  config: GameConfig;
	teams: Team[];
	round?: Round;
};

export type Team = {
	name: string;
	score?: number;
};

export type Round = {
	apple: Apple;
	teams: Team[];
	snakes: Snake[];
	duration: number;
	finished: boolean;
};

export type Point = {
	x: number;
	y: number;
};

export type Apple = Point;

export type Segment = {
	start: Point;
	length: number;
	direction: Direction;
};

export type Snake = {
	team: string;
	id: string;
	segments: Segment[];
};

export type Direction = 'up' | 'down' | 'left' | 'right';

export type RoundStartResponse = {
	result: {
		outcome: {
			success: Round[];
		};
	};
};
