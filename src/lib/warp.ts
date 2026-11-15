// Thin Plate Spline (薄板スプライン): 基準点ペアから「歪んだ座標変換」を作る。
// 強くデフォルメされたイラストでも、基準点を通るように滑らかに変形できる。
// 基準点は最低3点（一直線上でない）、実用的には10〜20点を推奨。

export type Pt = [number, number];

/** ガウス消去法（部分ピボット選択）。A: n×n, B: n×m */
function solve(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const M = A.map((row, i) => [...row, ...B[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) throw new Error("基準点が足りないか、一直線上に並んでいます");
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      if (f !== 0) for (let k = c; k < M[r].length; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row.slice(n).map((v) => v / row[i]));
}

const U = (r2: number) => (r2 === 0 ? 0 : 0.5 * r2 * Math.log(r2)); // r² ln r

function normalizer(pts: Pt[]) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const scale = Math.max(...pts.map((p) => Math.hypot(p[0] - cx, p[1] - cy))) || 1;
  return {
    to: (p: Pt): Pt => [(p[0] - cx) / scale, (p[1] - cy) / scale],
    from: (p: Pt): Pt => [p[0] * scale + cx, p[1] * scale + cy],
  };
}

export function fitTPS(src: Pt[], dst: Pt[], lambda = 1e-9): (p: Pt) => Pt {
  if (src.length !== dst.length || src.length < 3) throw new Error("基準点は3点以上必要です");
  const ns = normalizer(src);
  const nd = normalizer(dst);
  const q = src.map(ns.to);
  const t = dst.map(nd.to);
  const n = q.length;

  const L: number[][] = Array.from({ length: n + 3 }, () => new Array(n + 3).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      L[i][j] = U((q[i][0] - q[j][0]) ** 2 + (q[i][1] - q[j][1]) ** 2) + (i === j ? lambda : 0);
    }
    L[i][n] = L[n][i] = 1;
    L[i][n + 1] = L[n + 1][i] = q[i][0];
    L[i][n + 2] = L[n + 2][i] = q[i][1];
  }
  const rhs = [...t.map((p) => [p[0], p[1]]), [0, 0], [0, 0], [0, 0]];
  const W = solve(L, rhs); // (n+3)×2

  return (p: Pt): Pt => {
    const x = ns.to(p);
    let ox = W[n][0] + W[n + 1][0] * x[0] + W[n + 2][0] * x[1];
    let oy = W[n][1] + W[n + 1][1] * x[0] + W[n + 2][1] * x[1];
    for (let i = 0; i < n; i++) {
      const u = U((x[0] - q[i][0]) ** 2 + (x[1] - q[i][1]) ** 2);
      ox += W[i][0] * u;
      oy += W[i][1] * u;
    }
    return nd.from([ox, oy]);
  };
}
