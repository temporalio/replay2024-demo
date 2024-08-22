import type SnakeRound from './Round';
import type { Direction, Snake, Segment } from './types';

export default class SnakeBody {
	private round: SnakeRound;
	private context: CanvasRenderingContext2D;
	private snake: Snake
	private color: string;
	private direction: Direction;

	constructor(round: SnakeRound, cxt: CanvasRenderingContext2D, snake: Snake) {	
		this.round = round;
		this.context = cxt;
		this.snake = snake;
		this.color = snake.team.name;
		this.direction = snake.segments[0].direction;

		if (snake.id === 'blue-1') {
			this.setKeyboardEvents();
		}
		this.draw();
	}

	calculateRect(segment: Segment): { x: number, y: number, width: number, height: number } {
		let { x, y } = segment.start;
		let width = 1, height = 1;

		if (segment.direction === 'up' || segment.direction === 'down') {
			height = segment.length * (segment.direction === 'up' ? -1 : 1)
		} else {
			width = segment.length * (segment.direction === 'left' ? -1 : 1)
		}
		
		x *= this.round.cellSize;
		y *= this.round.cellSize;
		width *= this.round.cellSize;
		height *= this.round.cellSize;

		return { x, y, width, height };
	}

	draw() {
		this.context.fillStyle = this.color;
		this.snake.segments.forEach((segment) => {
			let { x, y, width, height } = this.calculateRect(segment);
			this.context.fillRect(x, y, width, height);
		});
	}

	setKeyboardEvents() {
		const Snake = this;
		document.addEventListener('keydown', function (event) {
			switch (event.key) {
				case 'ArrowLeft': // left arrow
					if (Snake.direction !== 'left') {
						Snake.direction = 'left';
					}
					break;
				case 'ArrowUp': // up arrow
					if (Snake.direction !== 'up') {
						Snake.direction = 'up';
					}
					break;
				case 'ArrowRight': // right arrow
					if (Snake.direction !== 'right') {
						Snake.direction = 'right';
					}
					break;
				case 'ArrowDown': // down arrow
					if (Snake.direction !== 'down') {
						Snake.direction = 'down';
					}
					break;
			}
		});
	}
}
