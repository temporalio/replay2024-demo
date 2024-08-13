import type Game from './Game';
import Team from './Team';
import { random } from './utils';

export default class Round {
  private game: Game;
  private interval: NodeJS.Timeout;

  score = 0;
  timeRemaining = 60;
  pause = false;

  apple: [number, number] = [0, 0];
  iceCube: [number, number] = [0, 0];

  constructor (game: Game) {
    this.game = game;
    this.draw();
    this.updateTime();
    this.createTeams();

    this.interval = setInterval(() => {
      this.run();
    }, 1000);
  }

  run() {
    this.updateTime();
    if (this.timeRemaining === 0) {
      this.end();
    }
  }

  draw() {
    this.drawBoard()
    this.drawApple();
    this.drawIceCube();
  }

  updateTime() {
    --this.timeRemaining;
    document.getElementById('time').innerText = this.timeRemaining.toString();
  }

  createTeams() {
    new Team(this.game, this, "red");
    new Team(this.game, this, "blue");
  }

  drawGrid() {
    for (var x = 0; x <= this.game.width; x += this.game.cellSize) {
      this.game.context.moveTo(this.game.gap + x, 0);
      this.game.context.lineTo(this.game.gap + x, this.game.height);
    }

    for (var y = 0; y <= this.game.height; y += this.game.cellSize) {
        this.game.context.moveTo(0, this.game.gap + y);
        this.game.context.lineTo(this.game.width, this.game.gap + y);
    }
    
    this.game.context.strokeStyle = "#59FDA0";
    this.game.context.lineWidth = 1;
    this.game.context.stroke();
  }

  drawBoard() {
    this.game.context.fillStyle = this.game.background;
    this.game.context.fillRect(0, 0, this.game.width, this.game.height);
    this.drawGrid();
  }

  drawApple() {
    const appleSize = this.game.cellSize;
    this.apple = [random(this.game.cellsWide), random(this.game.cellsTall)];
    this.game.context.fillStyle = '#00FF00';
    this.game.context.fillRect(this.apple[0] * appleSize, this.apple[1] * appleSize, appleSize, appleSize);
  }

  drawImage(base: HTMLImageElement, size: number) {
    this.game.context.drawImage(base, this.iceCube[0]*size, this.iceCube[1]*size, size * 2, size * 2)
  }

  drawIceCube() {
    const size = this.game.cellSize;
    this.iceCube = [random(this.game.cellsWide), random(this.game.cellsTall)];

    let base = new Image();
    base.src = '/icecube.png';

    const Round = this;
    base.onload = function(){
      Round.drawImage(base, size);
    }
  }

  eatApple() {
    this.clearApple()
    this.drawApple();
  }

  clearApple() {
    const appleSize = this.game.cellSize;
    this.game.context.fillStyle = this.game.background;
    this.game.context.fillRect(this.apple[0] * appleSize, this.apple[1] * appleSize, appleSize, appleSize);
  }

  end() {
    clearInterval(this.interval);
    this.pause = true;
  }
}