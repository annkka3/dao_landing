import { useEffect, useRef } from "react";
import "./HoloCube.css";

export interface HoloCubeProps {
  size?: number;
}

const UNIT_VERTS: [number, number, number][] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
];
const EDGES: [number, number][] = [
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7],
];
const FACES: number[][] = [
  [0,1,2,3],[4,7,6,5],[0,3,7,4],[1,5,6,2],[0,4,5,1],[3,2,6,7],
];

type Vec3 = [number, number, number];

function rotY([x, y, z]: Vec3, a: number): Vec3 {
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
}
function rotX([x, y, z]: Vec3, a: number): Vec3 {
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
}

export function HoloCube({ size = 260 }: HoloCubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = size, H = size;
    const cx = W / 2, cy = H / 2;
    const FOV = FOV_FOR(size);
    const AX = 22 * (Math.PI / 180);

    let ayOuter = 0;
    let ayInner = 0;
    let rafId: number;

    function project([x, y, z]: Vec3, cubeSize: number): [number, number] {
      const s = FOV / (FOV - z * cubeSize);
      return [cx + x * cubeSize * s, cy + y * cubeSize * s];
    }

    const drawCube = (ay: number, cubeSize: number, rgb: string, glowAlpha: number, dotR: number) => {
      const t = UNIT_VERTS.map(v => rotX(rotY(v, ay), AX));
      const p = t.map(v => project(v, cubeSize));

      FACES
        .map(f => ({ f, z: f.reduce((s, i) => s + t[i][2], 0) }))
        .sort((a, b) => a.z - b.z)
        .forEach(({ f }) => {
          ctx.beginPath();
          ctx.moveTo(p[f[0]][0], p[f[0]][1]);
          for (let i = 1; i < f.length; i++) ctx.lineTo(p[f[i]][0], p[f[i]][1]);
          ctx.closePath();
          ctx.fillStyle = `rgba(${rgb},0.04)`;
          ctx.fill();
        });

      ctx.shadowColor = `rgba(${rgb},${glowAlpha})`;
      ctx.shadowBlur = 8;
      EDGES.forEach(([a, b]) => {
        const depth = (t[a][2] + t[b][2]) / 2;
        const alpha = (0.4 + (depth + 1) * 0.28).toFixed(2);
        ctx.beginPath();
        ctx.moveTo(p[a][0], p[a][1]);
        ctx.lineTo(p[b][0], p[b][1]);
        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      ctx.shadowBlur = 12;
      t.forEach(([,, z], i) => {
        if (z > 0) {
          ctx.beginPath();
          ctx.arc(p[i][0], p[i][1], dotR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},0.95)`;
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;
    };

    const drawConnectors = (ao: number, ai: number, outerSize: number, innerSize: number) => {
      const to = UNIT_VERTS.map(v => rotX(rotY(v, ao), AX));
      const ti = UNIT_VERTS.map(v => rotX(rotY(v, ai), AX));
      const po = to.map(v => project(v, outerSize));
      const pi = ti.map(v => project(v, innerSize));

      ctx.shadowColor = "rgba(160,100,255,0.5)";
      ctx.shadowBlur = 4;
      ctx.setLineDash([3, 4]);
      UNIT_VERTS.forEach((_, i) => {
        ctx.beginPath();
        ctx.moveTo(po[i][0], po[i][1]);
        ctx.lineTo(pi[i][0], pi[i][1]);
        ctx.strokeStyle = "rgba(160,100,255,0.18)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    };

    const outerSize = size * 0.277;
    const innerSize = size * 0.138;

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      drawCube(ayOuter, outerSize, "0,229,255", 0.9, 2.5);
      drawConnectors(ayOuter, ayInner, outerSize, innerSize);
      drawCube(ayInner, innerSize, "180,120,255", 0.8, 2);
      ayOuter += 0.007;
      ayInner -= 0.013;
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [size]);

  return (
    <div className="holo-cube" style={{ width: size, height: size }}>
      <div className="holo-cube__glow" />
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
}

function FOV_FOR(size: number) {
  return size * 1.46;
}
