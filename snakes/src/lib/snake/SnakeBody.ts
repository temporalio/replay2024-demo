import type SnakeRound from './Round';
import type { Direction, Snake, Segment } from './types';

export default class SnakeBody {
	snake: Snake
	private round: SnakeRound;
	private context: CanvasRenderingContext2D;
	private color: string;

	constructor(round: SnakeRound, cxt: CanvasRenderingContext2D, snake: Snake) {	
		this.round = round;
		this.context = cxt;
		this.snake = snake;
		this.color = snake.team.name;

		if (snake.id === 'blue-1') {
			this.setKeyboardEvents();
		}
		this.draw();
	}

	direction(): Direction {
		return this.snake.segments[0].direction;
	}

	calculateRect(segment: Segment): { x: number, y: number, width: number, height: number } {
		let { x, y } = segment.start;
		let width = 1, height = 1;


		if (segment.direction === 'up' || segment.direction === 'down') {
			height = segment.length * (segment.direction === 'up' ? 1 : -1)
		} else {
			width = segment.length * (segment.direction === 'left' ? -1 : 1)
		}
		
		x *= this.round.cellSize;
		y *= this.round.cellSize;
		width *= this.round.cellSize;
		height *= this.round.cellSize;

		return { x, y, width, height };
	}

	redraw(snake: Snake) {
		this.snake.segments.forEach((segment, index) => {
			let { x, y, width, height } = this.calculateRect(segment);
			this.context.clearRect(x, y, width, height);
			if (index === 0) {
				this.context.strokeStyle = '#59FDA0';
				this.context.strokeRect(x, y, width, height);
			}
		});
		
		this.snake = snake;

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

	setKeyboardEvents() {
		const Snake = this;
		document.addEventListener('keydown', function (event) {
			switch (event.key) {
				case 'ArrowLeft': // left arrow
					if (Snake.direction() !== 'left') {
						moveSnake(Snake.snake.id, 'left')
					}
					break;
				case 'ArrowUp': // up arrow
					if (Snake.direction() !== 'up') {
						moveSnake(Snake.snake.id, 'up')
					}
					break;
				case 'ArrowRight': // right arrow
					if (Snake.direction() !== 'right') {
						moveSnake(Snake.snake.id, 'right')
					}
					break;
				case 'ArrowDown': // down arrow
					if (Snake.direction() !== 'down') {
						moveSnake(Snake.snake.id, 'down')
					}
					break;
			}
		});
	}
}

const moveSnake = async (workflowId: string, direction: Direction) => {
	fetch('/api/game', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ action: 'moveSnake', workflowId, direction })
	});
};
