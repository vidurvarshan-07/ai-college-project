import { CELL_TYPES } from '../constants/gridConfig.js';

export function generateRandomObstacles(rows, cols, density = 0.25, start, goal) {
  const walls = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === start.r && c === start.c) || (r === goal.r && c === goal.c)) {
        continue;
      }
      if (Math.random() < density) {
        walls.push({ r, c });
      }
    }
  }
  return walls;
}

export function generateRecursiveDivision(rows, cols, start, goal) {
  const walls = [];

  function divide(r1, r2, c1, c2, horizontal) {
    if (r2 - r1 < 2 || c2 - c1 < 2) return;

    if (horizontal) {
      const wallR = Math.floor(Math.random() * (r2 - r1 - 1)) + r1 + 1;
      const passageC = Math.floor(Math.random() * (c2 - c1 + 1)) + c1;

      for (let c = c1; c <= c2; c++) {
        if (c !== passageC) {
          if (!(wallR === start.r && c === start.c) && !(wallR === goal.r && c === goal.c)) {
            walls.push({ r: wallR, c });
          }
        }
      }

      divide(r1, wallR - 1, c1, c2, !horizontal);
      divide(wallR + 1, r2, c1, c2, !horizontal);
    } else {
      const wallC = Math.floor(Math.random() * (c2 - c1 - 1)) + c1 + 1;
      const passageR = Math.floor(Math.random() * (r2 - r1 + 1)) + r1;

      for (let r = r1; r <= r2; r++) {
        if (r !== passageR) {
          if (!(r === start.r && wallC === start.c) && !(r === goal.r && wallC === goal.c)) {
            walls.push({ r, c: wallC });
          }
        }
      }

      divide(r1, r2, c1, wallC - 1, !horizontal);
      divide(r1, r2, wallC + 1, c2, !horizontal);
    }
  }

  divide(0, rows - 1, 0, cols - 1, rows > cols);
  return walls;
}
