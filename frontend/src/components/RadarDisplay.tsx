import React, { useEffect, useRef } from 'react';
import { EmitterDNA, ReceiverState } from '../types';

interface RadarDisplayProps {
  emitters: EmitterDNA[];
  receivers: ReceiverState[];
  currentScannedBand?: string;
  width?: number;
  height?: number;
}

export const RadarDisplay: React.FC<RadarDisplayProps> = ({
  emitters,
  receivers,
  currentScannedBand,
  width = 340,
  height = 340,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sweepAngleRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) - 20;

      // Clear with dark navy
      ctx.fillStyle = '#070a12';
      ctx.fillRect(0, 0, w, h);

      // Draw concentric radar rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let r = 0.25; r <= 1.0; r += 0.25) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.stroke();

      // Cardinal labels
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('000° N', cx, cy - maxR - 6);
      ctx.fillText('180° S', cx, cy + maxR + 12);
      ctx.textAlign = 'left';
      ctx.fillText('090° E', cx + maxR + 6, cy + 3);
      ctx.textAlign = 'right';
      ctx.fillText('270° W', cx - maxR - 6, cy + 3);

      // Draw Receiver Sectors
      receivers.forEach((rx) => {
        const startRad = ((rx.sector_deg - rx.beam_width_deg / 2) * Math.PI) / 180;
        const endRad = ((rx.sector_deg + rx.beam_width_deg / 2) * Math.PI) / 180;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, startRad, endRad);
        ctx.closePath();
        ctx.fillStyle = rx.receiver_id === 'RX-ALPHA' ? 'rgba(0, 240, 255, 0.04)' : (rx.receiver_id === 'RX-BRAVO' ? 'rgba(16, 185, 129, 0.04)' : 'rgba(168, 85, 247, 0.04)');
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();

        // Receiver icon at periphery
        const rxRad = (rx.sector_deg * Math.PI) / 180;
        const rxX = cx + (maxR * 0.95) * Math.cos(rxRad);
        const rxY = cy + (maxR * 0.95) * Math.sin(rxRad);

        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(rxX, rxY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(rx.receiver_id.replace('RX-', ''), rxX, rxY - 7);
      });

      // Advance sweep angle
      sweepAngleRef.current = (sweepAngleRef.current + 0.035) % (Math.PI * 2);
      const sweepRad = sweepAngleRef.current;

      // Draw sweep gradient beam
      const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      sweepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
      sweepGradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepRad - 0.4, sweepRad);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.fill();
      ctx.restore();

      // Draw sweep main beam line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(sweepRad), cy + maxR * Math.sin(sweepRad));
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Render Emitters
      emitters.forEach((em, idx) => {
        const rad = (em.spatial_sector_deg * Math.PI) / 180;
        const distRatio = 0.45 + (idx * 0.09) % 0.45;
        const emX = cx + maxR * distRatio * Math.cos(rad);
        const emY = cy + maxR * distRatio * Math.sin(rad);

        const isActive = em.observed_bands.includes(currentScannedBand || '');

        // Outer glow ripple if active
        if (isActive) {
          ctx.beginPath();
          ctx.arc(emX, emY, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
          ctx.fill();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Core blip
        ctx.beginPath();
        ctx.arc(emX, emY, 4, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#f43f5e' : (em.behavior_classification === 'Frequency Agile' ? '#f59e0b' : '#10b981');
        ctx.fill();

        // Label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(em.emitter_id.replace('EMT-', ''), emX + 7, emY + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [emitters, receivers, currentScannedBand]);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-ew-card border border-ew-border overflow-hidden">
      <canvas ref={canvasRef} width={width} height={height} className="rounded-lg shadow-inner" />
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 px-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ew-rose" /> Hostile
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ew-amber" /> Agile
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ew-cyan" /> Sensors
          </span>
        </div>
        <span className="text-ew-cyan font-bold">360° SPATIAL MESH</span>
      </div>
    </div>
  );
};
