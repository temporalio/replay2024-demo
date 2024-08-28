import { CELL_SIZE } from './constants';
import type { GameConfig, Point, Round, Team } from './types';
import { Socket } from 'socket.io-client';
import { random } from './utils';

export default class SnakeRound {
	private interval: NodeJS.Timeout;

	context: CanvasRenderingContext2D;

	score = 0;
	duration = 60;
	paused = false;
	background = '#000000';
	finished = false;

	width: number;
	height: number;
	cellSize = CELL_SIZE;
	gap = CELL_SIZE;
	cellsWide: number;
	cellsTall: number;

	apple: Point = { x: 0, y: 0 };
	iceCube: Point = { x: 0, y: 0 };
	teams: Team[]
	socket: Socket;

	constructor(
		boardCxt: CanvasRenderingContext2D,
		round: Round,
		config: GameConfig,
		socket: Socket,
	) {
		const { width, height } = config;
		this.context = boardCxt;
		this.width = width * CELL_SIZE;
		this.height = height * CELL_SIZE;
		this.cellSize = CELL_SIZE;
		this.cellsWide = width;
		this.cellsTall = height;
		this.duration = round.finished ? 0 : round.duration;
		this.apple = round.apple;
		this.teams = round.teams;
		this.socket = socket;
		this.finished = round.finished;

		document.getElementById('time').innerText = this.duration.toString();

		this.draw();

		this.interval = setInterval(() => {
			this.run();
		}, 1000);

		socket.on('roundUpdate', (update) => {
			this.clearApple();
			this.apple = update.apple;
			this.drawApple();
			this.teams = update.teams;
		});
	}

	run() {
		if (this.duration === 0 || this.finished) {
			this.end();
		} else {
			this.updateTime();
		}
	}

	draw() {
		this.drawBoard();
		this.drawApple();
	}

	updateTime() {
		--this.duration;
		document.getElementById('time').innerText = this.duration.toString();
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
		let { x, y } = this.apple;
		x -= 1;
		y -= 1;
		this.context.fillRect(x * appleSize, y * appleSize, appleSize, appleSize);
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

	clearApple() {
		const appleSize = this.cellSize;
		this.context.fillStyle = this.background;
		let { x, y } = this.apple;
		x -= 1;
		y -= 1;
		this.context.fillRect(x * appleSize, y * appleSize, appleSize, appleSize);
	}

	end() {
		clearInterval(this.interval);
	}
}
