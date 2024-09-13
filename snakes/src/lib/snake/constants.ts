import type { GameConfig } from './types';

export const CELL_SIZE = 32;
export const CELL_GAP = 4;
export const LENGTH = 6;
export const MARGIN = 60;
export const SLOWEST = 120;
export const FASTEST = 30;
export const GAME_CONFIG: GameConfig = {
  width: 25,
  height: 25,
  roundDuration: 60,
  snakesPerTeam: 1,
  teamNames: ['blue'], // 'red', 'blue',  
  nomsPerMove: 1,
  nomDuration: 200,
  killWorkers: true,
};
export const SNAKE_NUMBERS = [...Array(GAME_CONFIG.snakesPerTeam).keys()];