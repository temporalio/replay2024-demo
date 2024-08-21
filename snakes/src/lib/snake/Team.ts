import type SnakeRound from './Round';
import Snake from './Snake';

export default class Team {
	score: number = 0;

	private round: SnakeRound;
	color: string;

	constructor(round: SnakeRound, color: string) {
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
		[...Array(this.round.snakesPerTeam).keys()].forEach((_) => {
			new Snake(this.round, this);
		});
	}
}
