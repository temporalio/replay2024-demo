import { CELL_SIZE } from './constants';
import type { Round } from './types';
import { Socket } from 'socket.io-client';

export default class SnakeRound {
	private interval: NodeJS.Timeout;

	context: CanvasRenderingContext2D;

	paused = false;
	background = '#000000';
	finished = false;

	duration: number;
	width: number;
	height: number;
	cellSize = CELL_SIZE;
	gap = CELL_SIZE;
	cellsWide: number;
	cellsTall: number;

	round: Round;
	socket: Socket;

	constructor(
		boardCxt: CanvasRenderingContext2D,
		round: Round,
		socket: Socket,
	) {
		const { width, height } = round.config;
		this.context = boardCxt;
		this.width = width * CELL_SIZE;
		this.height = height * CELL_SIZE;
		this.cellSize = CELL_SIZE;
		this.cellsWide = width;
		this.cellsTall = height;
		this.round = round;
		// TODO: Calculate time remaining based on round.startedAt
		this.duration = round.finished ? 0 : round.duration;
		this.finished = !!round.finished;
		this.socket = socket;

		document.getElementById('time').innerText = this.duration.toString();

		this.context.reset();
		this.draw();

		this.interval = setInterval(() => {
			this.run();
		}, 1000);

		socket.on('roundUpdate', ({ round: updatedRound }: { round: Round} ) => {
			this.clearApple();
			this.round = updatedRound;
			this.drawApple();
		});
		
		socket.on('roundFinished', () => {
			this.finished = true;
		});
	}

	run() {
		if (this.finished) {
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
		document.getElementById('time')!.innerText = this.duration.toString();
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
		let { x, y } = this.round.apple;
		x -= 1;
		y -= 1;
		this.context.fillRect(x * appleSize, y * appleSize, appleSize, appleSize);
	}

	clearApple() {
		const appleSize = this.cellSize;
		this.context.fillStyle = this.background;
		let { x, y } = this.round.apple;
		x -= 1;
		y -= 1;
		this.context.fillRect(x * appleSize, y * appleSize, appleSize, appleSize);
	}

	end() {
		clearInterval(this.interval);
	}
}
