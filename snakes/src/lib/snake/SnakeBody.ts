import type SnakeRound from './Round';
import { SLOWEST } from './constants';
import type { Direction, Snake } from './types';

export default class SnakeBody {
	private round: SnakeRound;
	private context: CanvasRenderingContext2D;
	private snake: Snake
	private color: string;
	private direction: Direction;

	private delay = SLOWEST;

	private x = [0];
	private y = [0];

	constructor(round: SnakeRound, cxt: CanvasRenderingContext2D, snake: Snake) {	
		this.round = round;
		this.context = cxt;
		this.snake = snake;
		this.color = snake.team.name;
		this.direction = snake.segments[0].direction;

		if (snake.id === 'blue-1') {
			this.setKeyboardEvents();
		}
		this.placeSnake();
		this.run();
	}

	run() {
		this.checkEatApple();
		this.move();
		this.checkCollision();
		this.draw();

		setTimeout(() => {
			window.requestAnimationFrame(this.run.bind(this));
		}, this.delay);
	}

	placeSnake() {
		this.x = this.snake.segments.map((segment) => segment.start.x);
		this.y = this.snake.segments.map((segment) => segment.start.y);
	}

	draw() {
		this.context.fillStyle = this.color;
		for (var i = 0; i < this.x.length; i++) {
			this.context.fillRect(
				this.x[i] * this.round.cellSize,
				this.y[i] * this.round.cellSize,
				this.round.cellSize,
				this.round.cellSize
			);
		}
	}

	checkForWall() {
		const x = this.x[0];
		const y = this.y[0];
		if (x <= 0) this.x[0] = this.round.cellsWide - 1;
		if (x >= this.round.cellsWide) this.x[0] = 0;
		if (y <= 0) this.y[0] = this.round.cellsTall - 1;
		if (y >= this.round.cellsTall) this.y[0] = 0;
	}

	stop() {
		this.speedX = 0;
		this.speedY = 0;
	}

	checkCollision() {
		this.checkForWall();
		for (var i = 1; i < this.x.length; i++) {
			if (this.x[0] === this.x[i] && this.y[0] === this.y[i]) {
				this.reset();
				break;
			}
		}
	}

	clear() {
		this.x.forEach((x, i) => {
			this.clearTail(x, this.y[i]);
		});
	}

	clearTail(x: number | undefined, y: number | undefined) {
		if (x !== undefined && y !== undefined) {
			const gridX = x * this.round.cellSize;
			const gridY = y * this.round.cellSize;
			this.context.clearRect(gridX, gridY, this.round.cellSize, this.round.cellSize);
		}
	}

	checkEatApple() {
		// if (this.x[0] === this.round.apple.x && this.y[0] === this.round.apple.y) {
		// 	this.round.eatApple();
		// 	this.x.push(this.x[this.x.length - 1]);
		// 	this.y.push(this.y[this.y.length - 1]);
		// 	this.delay = this.delay * 0.9;
		// }
	}

	move() {
		switch (this.direction) {
			case 'up':
				this.y[0] -= 1;
				this.clearTail(this.x[0], this.y[0] + 1)
				break;
			case 'down':
				this.y[0] += 1;
				this.clearTail(this.x[0], this.y[0] - 1)
				break;
			case 'left':
				this.x[0] -= 1;
				this.clearTail(this.x[0] + 1, this.y[0])
				break;
			case 'right':
				this.x[0] += 1;
				this.clearTail(this.x[0] - 1, this.y[0])
				break;
		}
	}

	reset() {
		this.clear();
		this.stop();
		this.placeSnake();
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
