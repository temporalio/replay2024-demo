import { CELL_SIZE } from './constants';
import type { Direction, Round, Snake, Segment } from './types';

export default class SnakeBody {
	id: string;
	snake: Snake;
	private context: CanvasRenderingContext2D;
	private color: string;

	constructor(canvas: HTMLCanvasElement, round: Round, snake: Snake) {	
		canvas.width = round.config.width * CELL_SIZE;
		canvas.height = round.config.height * CELL_SIZE;
		this.context = canvas.getContext('2d') as CanvasRenderingContext2D;

		this.id = snake.id;
		this.snake = snake;
		this.color = snake.teamName;

		this.context.clearRect(0, 0, canvas.width, canvas.height);
		this.draw();
	}

	direction(): Direction {
		return this.snake.segments[0].direction;
	}

	calculateRect(segment: Segment): { x: number, y: number, width: number, height: number } {
		let { x, y } = segment.head;
		let width = 1, height = 1;

		if (segment.direction === 'up') {
			x -= 1;
			y -= 1;
			height = segment.length;
		} else if (segment.direction === 'down') {
			x -= 1;
			height = -segment.length;
		} else if (segment.direction === 'left') {
			x -= 1;
			y -= 1;
			width = segment.length;
		} else {
			y -= 1;
			width = -segment.length;
		}

		x *= CELL_SIZE;
		y *= CELL_SIZE;
		width *= CELL_SIZE;
		height *= CELL_SIZE;

		return { x, y, width, height };
	}

	redraw(segments: Segment[]) {
		this.snake.segments.forEach((segment, index) => {
			let { x, y, width, height } = this.calculateRect(segment);
			this.context.clearRect(x, y, width, height);
			if (index === 0) {
				this.context.strokeStyle = '#59FDA0';
				this.context.strokeRect(x, y, width, height);
			}
		});

		this.snake.segments = segments;

		this.draw();
	}

	draw() {
		this.context.fillStyle = this.color;
		this.snake.segments.forEach((segment, index) => {
			let { x, y, width, height } = this.calculateRect(segment);
			this.context.fillRect(x, y, width, height);
			if (index === 0) {
				this.context.strokeStyle = this.snake.id.includes('1') ? 'white' : 'black';
				this.context.strokeRect(x, y, width, height);
			}
		});
	}
}
