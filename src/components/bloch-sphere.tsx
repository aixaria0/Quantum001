import { useEffect, useRef } from "react";

type Point = { x: number; y: number; z: number };

function project(x: number, y: number, z: number, r: number, rotY: number, rotX: number) {
  const cy = Math.cos(rotY);
  const sy = Math.sin(rotY);
  const cx = Math.cos(rotX);
  const sx = Math.sin(rotX);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const y2 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  return { px: x1 * r, py: -y2 * r, depth: z2 };
}

export function BlochSphere({
  x,
  y,
  z,
  trail = [],
  className,
}: {
  x: number;
  y: number;
  z: number;
  trail?: Point[];
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 4;
    const r = Math.min(w, h) * 0.36;
    const rotY = 0.55;
    const rotX = 0.35;
    const fg = "rgba(240,240,242,0.88)";
    const mute = "rgba(138,138,146,0.55)";
    const faint = "rgba(138,138,146,0.22)";
    const accent = "rgba(200,204,212,0.95)";

    ctx.translate(cx, cy);

    ctx.strokeStyle = faint;
    ctx.lineWidth = 1;
    for (const lat of [-0.6, 0, 0.6]) {
      ctx.beginPath();
      for (let t = 0; t <= 64; t++) {
        const phi = (t / 64) * Math.PI * 2;
        const yy = lat;
        const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
        const p = project(rr * Math.cos(phi), yy, rr * Math.sin(phi), r, rotY, rotX);
        if (t === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      }
      ctx.stroke();
    }
    ctx.beginPath();
    for (let t = 0; t <= 64; t++) {
      const th = (t / 64) * Math.PI;
      const p = project(Math.sin(th), Math.cos(th), 0, r, rotY, rotX);
      if (t === 0) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();

    const axes: { v: Point; label: string }[] = [
      { v: { x: 1.2, y: 0, z: 0 }, label: "X" },
      { v: { x: 0, y: 1.2, z: 0 }, label: "Z" },
      { v: { x: 0, y: 0, z: 1.2 }, label: "Y" },
    ];
    ctx.font = "500 11px Figtree, sans-serif";
    ctx.fillStyle = mute;
    for (const a of axes) {
      const p = project(a.v.x, a.v.y, a.v.z, r, rotY, rotX);
      const o = project(0, 0, 0, r, rotY, rotX);
      ctx.beginPath();
      ctx.strokeStyle = faint;
      ctx.moveTo(o.px, o.py);
      ctx.lineTo(p.px, p.py);
      ctx.stroke();
      ctx.fillText(a.label, p.px + 4, p.py - 4);
    }
    const zUp = project(0, 1.35, 0, r, rotY, rotX);
    const zDn = project(0, -1.35, 0, r, rotY, rotX);
    ctx.fillStyle = mute;
    ctx.fillText("|0⟩", zUp.px - 8, zUp.py - 6);
    ctx.fillText("|1⟩", zDn.px - 8, zDn.py + 14);

    if (trail.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(200,204,212,0.35)";
      ctx.lineWidth = 1.5;
      trail.forEach((pt, i) => {
        const p = project(pt.x, pt.z, pt.y, r, rotY, rotX);
        if (i === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      });
      ctx.stroke();
    }

    const tip = project(x, z, y, r, rotY, rotX);
    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(tip.px, tip.py);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = fg;
    ctx.arc(tip.px, tip.py, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [x, y, z, trail]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: "100%", height: "100%" }}
      aria-label="Bloch sphere"
    />
  );
}
