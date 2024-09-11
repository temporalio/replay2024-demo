import { CELL_SIZE } from './constants';
import type { Direction, Round, Snake, Segment, Point } from './types';

export default class SnakeBody {
	id: string;
	snake: Snake;
	private context: CanvasRenderingContext2D;
	private color: string;

	constructor(canvas: HTMLCanvasElement, round: Round, snake: Snake) {
		canvas.width = round.config.width * CELL_SIZE;
		canvas.height = round.config.height * CELL_SIZE;
		this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
		this.context.scale(CELL_SIZE, CELL_SIZE);
		this.context.translate(-1, -1);

		this.id = snake.id;
		this.snake = snake;
		this.color = snake.teamName;

		this.context.clearRect(0, 0, round.config.width, round.config.height);
		this.draw();
	}

	direction(): Direction {
		return this.snake.segments[0].direction;
	}

	calculateRect(segment: Segment): { x: number, y: number, w: number, h: number } {
		let { x, y } = segment.head;
		let w = 1, h = 1;

		let length = segment.length;

		if (segment.direction === 'up') {
			h = length;
		} else if (segment.direction === 'down') {
			h = length;
			y -= (length - 1);
		} else if (segment.direction === 'left') {
			w = length;
		} else {
			w = length;
			x -= (length - 1);
		}

		return { x, y, w, h };
	}

	redraw(segments: Segment[]) {
		this.snake.segments.forEach((segment) => {
			let { x, y, w, h } = this.calculateRect(segment);
			this.context.clearRect(x, y, w, h);
		});
		this.snake.segments = segments;

		this.draw();
	}

	drawEyes(segment: Segment) {
		const locations: Record<Direction, [[number, number], [number, number]]> = {
			"up": [[0.25, 0.25],[0.75, 0.25]],
			"down": [[0.25, 0.75],[0.75, 0.75]],
			"left": [[0.25, 0.25],[0.25, 0.75]],
			"right": [[0.75, 0.25],[0.75, 0.75]],
		};
		const location = locations[segment.direction];
		this.context.lineWidth = 0.05;
		this.context.save();
		this.context.strokeStyle = this.snake.id.includes('1') ? 'white' : 'black';
		this.context.translate(segment.head.x, segment.head.y);
		this.context.beginPath();
		this.context.arc(location[0][0], location[0][1], 0.04, 0, 2 * Math.PI);
		this.context.stroke();
		this.context.beginPath();
		this.context.arc(location[1][0], location[1][1], 0.04, 0, 2 * Math.PI);
		this.context.stroke();
		this.context.restore();
	}

	draw() {
		this.context.fillStyle = this.color;
		this.snake.segments.forEach((segment, index) => {
			let { x, y, w, h } = this.calculateRect(segment);
			this.context.fillRect(x, y, w, h);
		});

		const headSegment = this.snake.segments[0];
		try {
			this.drawEyes(headSegment);
		} catch (err) {
			console.log('Error drawing eyes', err);
			console.log('head', headSegment);
		}
	}
}
