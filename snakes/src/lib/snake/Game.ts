import { CELL_SIZE, SLOWEST } from './constants';
import Round from './Round';

export default class Game {
  score = 0;

  width: number;
  height: number;
  cellSize = CELL_SIZE;
  gap = CELL_SIZE;
  cellsWide: number;
  cellsTall: number;
  paused: boolean = false;

  context: CanvasRenderingContext2D;

  background = '#000000'

  constructor (cxt: CanvasRenderingContext2D, width: number, height: number) {
    this.context = cxt;
    this.width = width;
    this.height = height;
    this.cellsWide = Math.floor(width / CELL_SIZE);
    this.cellsTall = Math.floor(height / CELL_SIZE);
    this.run();
  }

  run() {
    this.createRound()
  }

  createRound() {
    new Round(this);
  }
}