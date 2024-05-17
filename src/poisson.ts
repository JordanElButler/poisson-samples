import {randomInterval, deepClone, circleAnnulusSampling} from './utils';

export type Point = {
  x: number,
  y: number,
}

export type PP = {
  pIndex: number,
  point: Point,
}
export type Poisson = {
  step: () => void,
  stepUntilDone: () => void,
  getSteps: () => number,
  getPoints: () => Array<Point>,
  getPP: () => Array<PP>,
  getR: () => number,
  getDone: () => boolean,
  getGrid: () => {gridSize: number, grid: Array<Array<number>>},
  getActiveList: () => Array<number>,
}
export type PoissonArgs = {
  r: number,
  k: number,
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
}
export function createPoisson({r, k, xmin, xmax, ymin, ymax}: PoissonArgs): Poisson {
  let steps = 0;
  let done = false;
  const gridSize = r / Math.sqrt(2);
  const grid: Array<Array<number>> = []
  for (let i = ymin; i < ymax; i += gridSize) {
    const row = [];
    for (let j = xmin; j < xmax; j += gridSize) {
      row.push(-1);
    }
    grid.push(row);
  }
  const points: Array<PP> = [];
  const activeList: Array<number> = [];
  
  // first point
  const firstPoint: Point = {x: randomInterval(xmin, xmax), y: randomInterval(ymin, ymax)};
  points.push({point: firstPoint, pIndex: -1});
  activeList.push(0);
  const fgx = Math.floor(firstPoint.x / gridSize);
  const fgy = Math.floor(firstPoint.y / gridSize);
  grid[fgy][fgx] = 0;
  
  function getR() {
    return r;
  }
  function getSteps() {
    return steps;
  }
  function step() {
    if (done) return;
    steps += 1;
    while (activeList.length > 0) {
      let activeIndex: number = activeList.pop()!;
      let {x, y} = points[activeIndex].point;
      for (let i = 0; i < k; i++) {
        const cp = circleAnnulusSampling();
        
        const cx = x + r * cp.x;
        const cy = y + r * cp.y;

        if (cx < xmin || cx >= xmax || cy < ymin || cy >= ymax) continue;
        // check
        const gx = Math.floor(cx / gridSize);
        const gy = Math.floor(cy / gridSize);
        
        if (gy < grid.length && gx < grid[gy].length && grid[gy][gx] === -1) {
          //check neighbors
          let valid = true;
          for (let ii = -2; ii <= 2; ii += 1) {
            for (let jj = -2; jj <= 2; jj += 1) {
              const ny = gy + ii;
              const nx = gx + jj;
              if (ny >= 0 && nx >= 0 && ny < grid.length && nx < grid[ny].length && grid[ny][nx] !== -1) {
                const neighbor: Point = points[grid[ny][nx]].point;
                // check distance
                const xx = neighbor.x;
                const yy = neighbor.y;
  
                const d = Math.sqrt((xx - cx) * (xx - cx) + (yy - cy) * (yy - cy))
                if (d < r) {
                  valid = false;
                }
              }
            }
          }
          if (valid) {
            const newPoint = { x: cx, y: cy } as Point;
            grid[gy][gx] = points.length;
            points.push({point: newPoint, pIndex: activeIndex});
  
            activeList.push(points.length-1);
            activeList.push(activeIndex);
            return;
          }
        }
      }
      return;
    }
    done = true;
  }

  function stepUntilDone() {
    while(!done) {
      step();
    }
  }
  function getPoints() {
    return points.map((p) => {
      return p.point;
    });
  }
  function getGrid() {
    return {
      grid: deepClone(grid),
      gridSize: gridSize,
    }
  }
  function getPP() {
    return deepClone(points);
  }
  function getDone() {
    return done;
  }
  function getActiveList() {
    return deepClone(activeList);
  }
  return {
    step,
    stepUntilDone,
    getSteps,
    getPoints,
    getPP,
    getGrid,
    getR,
    getDone,
    getActiveList,
  }
}