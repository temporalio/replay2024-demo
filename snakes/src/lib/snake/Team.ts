import type Game from './Game';
import type Round from './Round';
import Snake from './Snake';

export default class Team {
  score: number = 0;

  private game: Game;
  private round: Round;
  private playersPerTeam = 2;
  color: string;

  constructor (game: Game, round: Round, color: string) {
    this.game = game;
    this.round = round;
    this.color = color;
    this.drawScore();
    this.addPlayers();
  }

  drawScore() {
    document.getElementById(this.color).innerText = this.score.toString();
  }
  updateScore() {
    this.score += 10;
    this.drawScore();
  }

  addPlayers() {
    [...Array(this.playersPerTeam).keys()].forEach(_ => {
      new Snake(this.game, this.round, this);
    })
  }
}