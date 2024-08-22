import { CELL_SIZE } from './constants';
import SnakeBody from './SnakeBody';
import type { GameConfig, Point, Round, Team, Snake } from './types';
import { random } from './utils';

export default class SnakeRound {
	private interval: NodeJS.Timeout;

	context: CanvasRenderingContext2D;
	snakeContexts: CanvasRenderingContext2D[];

	score = 0;
	duration = 60;
	paused = false;
	background = '#000000';

	width: number;
	height: number;
	cellSize = CELL_SIZE;
	gap = CELL_SIZE;
	cellsWide: number;
	cellsTall: number;
	snakesPerTeam = 2;

	apple: Point = { x: 0, y: 0 };
	iceCube: Point = { x: 0, y: 0 };
	teams: Team[]
	snakes: Snake[];

	constructor(
		boardCxt: CanvasRenderingContext2D,
		snakeCxts: CanvasRenderingContext2D[],
		round: Round,
		config: GameConfig,
	) {
		const { width, height, snakesPerTeam } = config;
		this.context = boardCxt;
		this.snakeContexts = snakeCxts;
		this.width = width * CELL_SIZE;
		this.height = height * CELL_SIZE;
		this.cellsWide = width;
		this.cellsTall = height;
		this.snakesPerTeam = snakesPerTeam;
		this.duration = round.duration;
		this.apple = round.apple;
		this.teams = round.teams;
		this.snakes = round.snakes;

		this.draw();
		this.updateTime();
		this.addPlayers();

		this.interval = setInterval(() => {
			this.run();
		}, 1000);
	}

	run() {
		this.updateTime();
		if (this.duration === 0) {
			this.end();
		}
	}

	draw() {
		this.drawBoard();
		this.drawApple();
		// this.drawIceCube();
	}

	updateTime() {
		--this.duration;
		document.getElementById('time').innerText = this.duration.toString();
	}

	addPlayers() {
		this.snakes.forEach((snake, i) => {
			new SnakeBody(this, this.snakeContexts[i], snake);
		});
	}

	drawGrid() {
		for (var x = 0; x <= this.width; x += this.cellSize) {
			this.context.moveTo(this.cellSize + x, 0);
			this.context.lineTo(this.cellSize + x, this.height);
		}

		for (var y = 0; y <= this.height; y += this.cellSize) {
			this.context.moveTo(0, this.cellSize + y);
			this.context.lineTo(this.width, this.cellSize + y);
		}

		this.context.strokeStyle = '#59FDA0';
		this.context.lineWidth = 1;
		this.context.stroke();
	}

	drawBoard() {
		this.context.fillStyle = this.background;
		this.context.fillRect(0, 0, this.width, this.height);
		this.drawGrid();
	}

	drawApple() {
		const appleSize = this.cellSize;
		this.context.fillStyle = '#00FF00';
		this.context.fillRect(this.apple.x * appleSize, this.apple.y * appleSize, appleSize, appleSize);
	}

	drawImage(base: HTMLImageElement, size: number) {
		this.context.drawImage(base, this.iceCube.x * size, this.iceCube.y * size, size * 2, size * 2);
	}

	drawIceCube() {
		const size = this.cellSize;
		this.iceCube = { x: random(this.cellsWide), y: random(this.cellsTall) };

		let base = new Image();
		base.src = '/icecube.png';

		const Round = this;
		base.onload = function () {
			Round.drawImage(base, size);
		};
	}

	// eatApple() {
	// 	this.clearApple();
	// 	this.drawApple();
	// }

	clearApple() {
		const appleSize = this.cellSize;
		this.context.fillStyle = this.background;
		this.context.fillRect(this.apple.x * appleSize, this.apple.y * appleSize, appleSize, appleSize);
	}

	end() {
		clearInterval(this.interval);
		this.paused = true;
	}
}
