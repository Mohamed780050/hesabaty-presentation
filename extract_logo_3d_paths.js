// extract_logo_3d_paths.js
const fs = require('fs');
const buf = fs.readFileSync('icon.raw');
const W = 295, H = 277;

// 1. Identify connected components
const visited = Array.from({length: H}, () => new Uint8Array(W));
const compMasks = [];

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const a = buf[(y * W + x) * 4 + 3];
    if (a > 120 && !visited[y][x]) {
      const mask = Array.from({length: H}, () => new Uint8Array(W));
      const queue = [[x, y]];
      visited[y][x] = 1;
      mask[y][x] = 1;
      let count = 0;
      let minX = x;

      while (queue.length > 0) {
        const [cx, cy] = queue.pop();
        count++;
        if (cx < minX) minX = cx;

        const nbrs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
        for (const [nx, ny] of nbrs) {
          if (nx >= 0 && nx < W && ny >= 0 && ny < H && !visited[ny][nx]) {
            if (buf[(ny * W + nx) * 4 + 3] > 120) {
              visited[ny][nx] = 1;
              mask[ny][nx] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }

      if (count > 50) {
        compMasks.push({ count, minX, mask });
      }
    }
  }
}

// Sort components: Outer ribbon is the largest (count > 20000).
// The other 4 are sorted by minX (bar1, bar2, bar3, bar4).
const outerRibbon = compMasks.find(c => c.count > 10000);
const bars = compMasks.filter(c => c.count <= 10000).sort((a, b) => a.minX - b.minX);

console.log('Ribbon count:', outerRibbon.count);
console.log('Bars count:', bars.map(b => b.count));

// Moore-Neighbor tracing
function traceBoundary(grid, startX, startY, isClockwise = true) {
  const directions = [
    [0, 1], [1, 1], [1, 0], [1, -1],
    [0, -1], [-1, -1], [-1, 0], [-1, 1]
  ];
  let currX = startX, currY = startY;
  let dir = 7;
  const contour = [];
  let steps = 0;

  do {
    contour.push([currX, currY]);
    let nextX = currX, nextY = currY;
    let found = false;

    const startDir = (dir + 5) % 8;
    for (let i = 0; i < 8; i++) {
      const d = (startDir + i) % 8;
      const nx = currX + directions[d][0];
      const ny = currY + directions[d][1];
      if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] === 1) {
        nextX = nx;
        nextY = ny;
        dir = d;
        found = true;
        break;
      }
    }

    if (!found) break;
    currX = nextX;
    currY = nextY;
    steps++;
  } while (!(currX === startX && currY === startY) && steps < 6000);

  return contour;
}

// Douglas-Peucker simplification
function simplify(points, tol = 1.0) {
  if (points.length <= 2) return points;
  let maxD = 0, index = 0;
  const [x1, y1] = points[0];
  const [x2, y2] = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const num = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1);
    const den = Math.hypot(y2 - y1, x2 - x1);
    const d = den === 0 ? Math.hypot(px - x1, py - y1) : num / den;
    if (d > maxD) {
      maxD = d;
      index = i;
    }
  }

  if (maxD > tol) {
    const left = simplify(points.slice(0, index + 1), tol);
    const right = simplify(points.slice(index), tol);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

// Trace outer ribbon boundary
let rStartX = -1, rStartY = -1;
outerLoop: for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (outerRibbon.mask[y][x] === 1) {
      rStartX = x;
      rStartY = y;
      break outerLoop;
    }
  }
}
const ribbonOuter = traceBoundary(outerRibbon.mask, rStartX, rStartY);

// Trace inner hole of ribbon
// Scan from center outwards inside the ribbon hole
let hStartX = -1, hStartY = -1;
for (let y = 70; y < 140; y++) {
  for (let x = 70; x < 210; x++) {
    if (outerRibbon.mask[y][x] === 0) {
      // Check if neighboring a ribbon pixel
      if (outerRibbon.mask[y][x+1] === 1) {
        hStartX = x + 1;
        hStartY = y;
        break;
      }
    }
  }
  if (hStartX !== -1) break;
}
console.log('Ribbon hole start:', hStartX, hStartY);
const ribbonHole = traceBoundary(outerRibbon.mask, hStartX, hStartY);

// Trace bars 1, 2, 3, 4
const barContours = bars.map(bar => {
  let sx = -1, sy = -1;
  bLoop: for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (bar.mask[y][x] === 1) {
        sx = x;
        sy = y;
        break bLoop;
      }
    }
  }
  return traceBoundary(bar.mask, sx, sy);
});

// Center and normalize coordinates for Three.js (scale ~ 10 units wide)
const cx = 147.5, cy = 138.5, scale = 25.0;
function to3D(pts, tol = 1.0) {
  const simp = simplify(pts, tol);
  return simp.map(([x, y]) => [
    +(((x - cx) / scale).toFixed(3)),
    +(-((y - cy) / scale).toFixed(3))
  ]);
}

const logo3DData = {
  ribbonOuter: to3D(ribbonOuter, 1.2),
  ribbonHole: to3D(ribbonHole, 1.2),
  bar1: to3D(barContours[0], 0.8), // Cyan
  bar2: to3D(barContours[1], 0.8), // Sky Blue
  bar3: to3D(barContours[2], 0.8), // Royal Blue
  bar4: to3D(barContours[3], 0.8)  // Deep Blue with Arrow
};

fs.writeFileSync('hesabaty_3d_logo_paths.json', JSON.stringify(logo3DData, null, 2), 'utf8');
console.log('Saved hesabaty_3d_logo_paths.json successfully!');
console.log('Points counts:', {
  ribbonOuter: logo3DData.ribbonOuter.length,
  ribbonHole: logo3DData.ribbonHole.length,
  bar1: logo3DData.bar1.length,
  bar2: logo3DData.bar2.length,
  bar3: logo3DData.bar3.length,
  bar4: logo3DData.bar4.length
});
