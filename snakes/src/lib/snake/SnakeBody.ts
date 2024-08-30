import type SnakeRound from './SnakeRound';
import type { Direction, Snake, Segment } from './types';
import { Socket } from 'socket.io-client';

export default class SnakeBody {
	id: string;
	snake: Snake
	private socket: Socket;
	private round: SnakeRound;
	private context: CanvasRenderingContext2D;
	private color: string;

	constructor(round: SnakeRound, cxt: CanvasRenderingContext2D, snake: Snake, socket: Socket) {	
		this.round = round;
		this.context = cxt;
		this.id = snake.id;
		this.snake = snake;
		this.socket = socket;
		this.color = snake.teamName;

		this.context.reset();
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

		x *= this.round.cellSize;
		y *= this.round.cellSize;
		width *= this.round.cellSize;
		height *= this.round.cellSize;

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

	changeDirection(direction: Direction) {
		if (direction !== this.direction()) {
			this.socket.emit('snakeChangeDirection', this.snake.id, direction);
		}
	}
}
