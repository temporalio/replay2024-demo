import { CELL_SIZE } from './constants';
import type { Round, Apple } from './types';

const APPLE_COLOR = '#00FF00';
const GRID_COLOR = '#59FDA0';

export default class SnakeBoard {
	context: CanvasRenderingContext2D;
	appleContext: CanvasRenderingContext2D;

	width: number;
	height: number;
	round: Round;
	apple: Apple;

	constructor(canvas: HTMLCanvasElement, appleCanvas: HTMLCanvasElement, round: Round) {
		this.width = round.config.width * CELL_SIZE;
		this.height = round.config.height * CELL_SIZE;

		canvas.width = this.width;
		canvas.height = this.height;
		appleCanvas.width = this.width;
		appleCanvas.height = this.height;

		this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
		this.appleContext = appleCanvas.getContext('2d') as CanvasRenderingContext2D;
		this.appleContext.scale(CELL_SIZE, CELL_SIZE);
		this.appleContext.translate(-1, -1);

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
		this.context.clearRect(0, 0, this.width, this.height);

		this.context.beginPath();
		for (var x = 0; x <= this.width; x += CELL_SIZE) {
			this.context.moveTo(CELL_SIZE + x, 0);
			this.context.lineTo(CELL_SIZE + x, this.height);
		}

		for (var y = 0; y <= this.height; y += CELL_SIZE) {
			this.context.moveTo(0, CELL_SIZE + y);
			this.context.lineTo(this.width, CELL_SIZE + y);
		}

		this.context.strokeStyle = GRID_COLOR;
		this.context.lineWidth = 1.2;
		this.context.stroke();
	}

	drawApple() {
		this.appleContext.fillStyle = APPLE_COLOR;
		this.appleContext.fillRect(this.apple.x, this.apple.y, 1, 1);
	}

	clearApple() {
		this.appleContext.clearRect(this.apple.x, this.apple.y, 1, 1);
	}
}
