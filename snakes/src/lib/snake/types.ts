export type GameConfig = {
	width: number;
	height: number;
	teamNames: string[];
	snakesPerTeam: number;
};

export type Game = {
	config: GameConfig;
	teams: Team[];
};

export type Player = {
	id: string;
	name: string;
	score: number;
};

export type Team = {
	name: string;
	players: Player[];
	score: number;
};

export type Teams = Record<string, Team>;

export type TeamSummary = {
	name: string;
	players: number;
	score: number;
};

type TeamSummaries = Record<string, TeamSummary>;

export type Lobby = {
	teams: TeamSummaries;
};

export type Round = {
	config: GameConfig;
	apple: Apple;
	teams: Teams;
	snakes: Snakes;
	duration: number;
	startedAt?: number;
	finished?: boolean;
};
  
export type Point = {
	x: number;
	y: number;
};

export type Apple = Point;

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
	ateApple?: boolean;
};

export type Snakes = Record<string, Snake>;

export type Direction = 'up' | 'down' | 'left' | 'right';

export type RoundStartResponse = {
	result: {
		outcome: {
			success: Round[];
		};
	};
};
