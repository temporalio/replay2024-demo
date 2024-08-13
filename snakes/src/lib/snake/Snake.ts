import type Game from './Game';
import type Round from './Round';
import type Team from './Team';
import { SLOWEST } from './constants';
import { random } from './utils';

export default class Snake {
  private game: Game;
  private round: Round;
  private team: Team;

  private delay = SLOWEST;
  private speedX = 0;
  private speedY = 0;

  private x = [0]
  private y = [0]

  constructor (game: Game, round: Round, team: Team) {
    this.game = game;
    this.round = round;
    this.team = team;

    this.setKeyboardEvents();
    this.placeSnake();
    this.run();
  }

  run() {
    this.checkEatApple()
    this.move();
    this.checkCollision();
    this.draw();

    setTimeout(() => {
      window.requestAnimationFrame(this.run.bind(this));
    }, this.delay);
  }
      
  placeSnake() {
    this.x = [random(this.game.cellsWide)];
    this.y = [random(this.game.cellsTall)];
  }

  draw() {
    this.game.context.fillStyle = this.team.color;
    for (var i = 0; i < this.x.length; i++) {
      this.game.context.fillRect(
        this.x[i] * this.game.cellSize,
        this.y[i] * this.game.cellSize,
        this.game.cellSize,
        this.game.cellSize
      );
    }
  }

  hitWall() {
    const x = this.x[0];
    const y = this.y[0];
    return (x <= 0 || x >= this.game.cellsWide || y <= 0 || y >= this.game.cellsTall);
  }

  stop() {
    this.speedX = 0;
    this.speedY = 0;
  }

  checkCollision() {
    if (this.hitWall()) {
      this.stop();
      return;
    }

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
    })
  }

  clearTail(x: number | undefined, y: number | undefined) {
    if (x !== undefined && y !== undefined) {
      const gridX = x * this.game.cellSize;
      const gridY = y * this.game.cellSize;
      this.game.context.fillStyle = this.game.background;
      this.game.context.fillRect(gridX, gridY, this.game.cellSize, this.game.cellSize)

      this.game.context.moveTo(gridX, gridY);
      this.game.context.lineTo(gridX + this.game.cellSize, gridY);
      this.game.context.moveTo(gridX + this.game.cellSize, gridY);
      this.game.context.lineTo(gridX + this.game.cellSize, gridY + this.game.cellSize);
      this.game.context.moveTo(gridX + this.game.cellSize, gridY + this.game.cellSize)
      this.game.context.lineTo(gridX, gridY + this.game.cellSize);
      this.game.context.moveTo(gridX + this.game.cellSize, gridY + this.game.cellSize)

      this.game.context.stroke();
    }
  }

  checkEatApple() {
    if (this.x[0] === (this.round.apple[0]) && this.y[0] === this.round.apple[1]) {
      this.team.updateScore();
      this.round.eatApple();
      this.x.push(this.x[this.x.length - 1]);
      this.y.push(this.y[this.y.length - 1]);
      this.delay = this.delay * 0.9;
    }
  }

  move() {
    const nextX = this.x[0] + this.speedX;
    const nextY = this.y[0] + this.speedY;
    const xIsIn = nextX <= this.game.cellsWide && nextX >= 0;
    const yIsIn = nextY <= this.game.cellsTall && nextY >= 0;
    if (xIsIn && yIsIn) {
      this.x.unshift(nextX);
      this.y.unshift(nextY);
      const oldX = this.x.pop();
      const oldY = this.y.pop();
      this.clearTail(oldX, oldY);  
    }
  }

  reset() {
    this.clear()
    this.stop();
    this.placeSnake();
  }

  setKeyboardEvents() {
    const Snake = this;
    document.addEventListener("keydown", function (event) {
      switch (event.key) {
        case 'ArrowLeft': // left arrow
          if (Snake.speedX !== 1) {
            Snake.speedX = -1;
            Snake.speedY = 0;
            Snake.moving = true
          }
          break;
        case 'ArrowUp': // up arrow
          if (Snake.speedY !== 1) {
            Snake.speedX = 0;
            Snake.speedY = -1;
            Snake.moving = true
          }
          break;
        case 'ArrowRight': // right arrow
          if (Snake.speedX !== -1) {
            Snake.speedX = 1;
            Snake.speedY = 0;
            Snake.moving = true
          }
          break;
        case 'ArrowDown': // down arrow
          if (Snake.speedY !== -1) {
            Snake.speedX = 0;
            Snake.speedY = 1;
            Snake.moving = true
          }
          break;
      }
    });
  }
}