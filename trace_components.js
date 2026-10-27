const fs = require('fs');
const buf = fs.readFileSync('icon.raw');
const W = 295, H = 277;

// Color clusters:
// 0: background
// 1: Ribbon (#0f3bab, #1543c9, #133eb3)
// 2: Bar 1 (#13b1fc cyan)
// 3: Bar 2 (#1382fe sky blue)
// 4: Bar 3 & 4 (#1543c9, #0f3bab inside the curve)

const mask = Array.from({length: H}, () => new Uint8Array(W));
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = (y * W + x) * 4;
    const a = buf[idx + 3];
    if (a > 120) {
      mask[y][x] = 1;
    }
  }
}

// Find all external & internal contours using topological contour tracing (Suzuki-Abe style or simple Moore-Neighbor)
function traceContour(startX, startY, isHole = false) {
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

    // Search 8-neighbors
    const startDir = (dir + 5) % 8; // backtrack
    for (let i = 0; i < 8; i++) {
      const d = (startDir + i) % 8;
      const nx = currX + directions[d][0];
      const ny = currY + directions[d][1];
      if (nx >= 0 && nx < W && ny >= 0 && ny < H && mask[ny][nx] === 1) {
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
  } while (!(currX === startX && currY === startY) && steps < 5000);

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

// Trace outer boundary
let startX = -1, startY = -1;
outer: for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (mask[y][x] === 1) {
      startX = x;
      startY = y;
      break outer;
    }
  }
}

const outerContour = traceContour(startX, startY);
console.log('Outer contour raw length:', outerContour.length);
const simplifiedOuter = simplify(outerContour, 1.2);
console.log('Outer contour simplified length:', simplifiedOuter.length);

// Also detect the bars and inner hole
// Let's print the bounding box and centroid
const cx = W / 2, cy = H / 2;
// Normalize to -5 to +5 range and flip Y for 3D coordinates
const normOuter = simplifiedOuter.map(([x, y]) => [
  +(((x - cx) / 25).toFixed(3)),
  +(-((y - cy) / 25).toFixed(3))
]);

fs.writeFileSync('logo_poly.json', JSON.stringify({ outer: normOuter }), 'utf8');
console.log('Saved logo_poly.json successfully!');
