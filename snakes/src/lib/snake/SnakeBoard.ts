import { CELL_SIZE } from './constants';
import type { Round, Apple } from './types';

export default class SnakeBoard {
	context: CanvasRenderingContext2D;

	background = '#000000';

	width: number;
	height: number;
	round: Round;
	apple: Apple;

	constructor(canvas: HTMLCanvasElement, round: Round) {
		this.width = round.config.width * CELL_SIZE;
		this.height = round.config.height * CELL_SIZE;

		canvas.width = this.width;
		canvas.height = this.height;

		this.context = canvas.getContext('2d') as CanvasRenderingContext2D;

		this.round = round;
		this.apple = round.apple;

		this.draw()
	}

	draw() {
		this.drawBoard();
		this.drawApple();
	}

	update(round: Round) {
		this.round = round;
		this.clearApple();
		this.apple = round.apple;
		this.drawApple();
	}

	drawBoard() {
		this.context.fillStyle = this.background;
		this.context.fillRect(0, 0, this.width, this.height);

		this.context.beginPath();
		for (var x = 0; x <= this.width; x += CELL_SIZE) {
			this.context.moveTo(CELL_SIZE + x, 0);
			this.context.lineTo(CELL_SIZE + x, this.height);
		}

		for (var y = 0; y <= this.height; y += CELL_SIZE) {
			this.context.moveTo(0, CELL_SIZE + y);
			this.context.lineTo(this.width, CELL_SIZE + y);
		}

		this.context.strokeStyle = '#59FDA0';
		this.context.lineWidth = 1;
		this.context.stroke();
	}

	drawApple() {
		const appleSize = CELL_SIZE;
		let { x, y } = this.apple;
		x -= 1;
		y -= 1;
		this.context.fillStyle = '#00FF00';
		this.context.fillRect(x * appleSize, y * appleSize, appleSize, appleSize);
	}

	clearApple() {
		const appleSize = CELL_SIZE;
		let { x, y } = this.apple;
		x -= 1;
		y -= 1;
		this.context.fillStyle = this.background;
		this.context.fillRect(x * appleSize, y * appleSize, appleSize, appleSize);
	}
}
