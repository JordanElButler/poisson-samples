import {randomInterval, deepClone, sphereAnnulusSampling} from './utils';

export type Point3 = {
  x: number,
  y: number,
  z: number,
}

export type PP = {
  pIndex: number,
  point: Point3,
}
export type Poisson = {
  step: () => void,
  stepUntilDone: () => void,
  getSteps: () => number,
  getPoints: () => Array<Point3>,
  getPP: () => Array<PP>,
  getR: () => number,
  getDone: () => boolean,
  getGrid: () => { gridSize: number, grid: Array<Array<Array<number>>> },
  getActiveList: () => Array<number>,
}
export type PoissonArgs = {
  r: number,
  k: number,
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
  zmin: number,
  zmax: number,
}
export function createPoisson({r, k, xmin, xmax, ymin, ymax, zmin, zmax}: PoissonArgs): Poisson {
  let steps = 0;
  let done = false;
  const gridSize = r / Math.sqrt(3);
  const grid: Array<Array<Array<number>>> = []
  for (let i = zmin; i < zmax; i += gridSize) {
    const square = [];
    for (let j = ymin; j < ymax; j += gridSize) {
      const row = [];
      for (let k = xmin; k < xmax; k += gridSize) {
        row.push(-1);
      }
      square.push(row);
    }
    grid.push(square);
  }
  const points: Array<PP> = [];
  const activeList: Array<number> = [];

  // first point
  const firstPoint: Point3 = {
    x: randomInterval(xmin, xmax), 
    y: randomInterval(ymin, ymax), 
    z: randomInterval(zmin, zmax),
  };
  
  points.push({point: firstPoint, pIndex: -1});
  activeList.push(0);
  const fgx = Math.floor(firstPoint.x / gridSize);
  const fgy = Math.floor(firstPoint.y / gridSize);
  const fgz = Math.floor(firstPoint.z / gridSize);
  grid[fgz][fgy][fgx] = 0;

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
      let {x, y, z} = points[activeIndex].point;
      for (let i = 0; i < k; i++) {
        const cp = sphereAnnulusSampling();
        const cx = x + r * cp.x;
        const cy = y + r * cp.y;
        const cz = z + r * cp.z;
        
        if (cx < xmin || cx >= xmax ||
            cy < ymin || cy >= ymax ||
            cz < zmin || cz >= zmax) continue
        // check
        const gx = Math.floor(cx / gridSize);
        const gy = Math.floor(cy / gridSize);
        const gz = Math.floor(cz / gridSize);

        if (gz < grid.length && 
            gy < grid[gz].length && 
            gx < grid[gz][gy].length && 
            grid[gz][gy][gx] === -1) {
          //check neighbors
          let valid = true;
          for (let ii = -2; ii <= 2; ii += 1) {
            for (let jj = -2; jj <= 2; jj += 1) {
              for (let kk = -2; kk <= 2; kk += 1) {
  
                const nz = gz + ii;
                const ny = gy + jj;
                const nx = gx + kk;
                if (nz >= 0 && ny >= 0 && nx >= 0 &&
                    nz < grid.length && 
                    ny < grid[nz].length && 
                    nx < grid[nz][ny].length && 
                    grid[nz][ny][nx] !== -1) {
                  const neighbor: Point3 = points[grid[nz][ny][nx]].point;
                  // check distance
                  const xx = neighbor.x;
                  const yy = neighbor.y;
                  const zz = neighbor.z;
                  
                  const d = Math.sqrt(
                    (xx - cx) * (xx - cx) + 
                    (yy - cy) * (yy - cy) +
                    (zz - cz) * (zz - cz)
                  );
                  if (d < r) {
                    valid = false;
                  }
                }
              }
            }
          }
          if (valid) {
            const newPoint = { x: cx, y: cy, z: cz } as Point3;
            grid[gz][gy][gx] = points.length;
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