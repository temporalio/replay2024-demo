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
};

export type Point = {
	x: number;
	y: number;
};

export type Apple = Point;

export type Segment = {
	start: Point;
	direction: Direction;
	length: number;
};

export type Snake = {
	team: Team;
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
