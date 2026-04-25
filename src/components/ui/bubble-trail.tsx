'use client';

import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
}

export default function BubbleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbles = useRef<Bubble[]>([]);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleClick = (e: MouseEvent) => {
      const burstCount = Math.floor(Math.random() * 5) + 5; // 5 to 10 bubbles per click
      
      for (let i = 0; i < burstCount; i++) {
        const size = Math.random() * 10 + 4; // 4px to 14px
        // Frutiger Aero / Crystal blueish-white colors
        const colors = [
          'rgba(255, 255, 255, 0.9)',
          'rgba(180, 230, 255, 0.7)',
          'rgba(200, 240, 255, 0.8)',
          'rgba(100, 200, 255, 0.6)',
        ];
        
        // Spread bubbles out in a circle
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;

        bubbles.current.push({
          x: e.clientX + (Math.random() * 10 - 5),
          y: e.clientY + (Math.random() * 10 - 5),
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
          velocity: {
            x: Math.cos(angle) * speed * 0.5,
            y: Math.sin(angle) * speed * 0.5 - (Math.random() * 2 + 1) // Force mostly upward trajectory
          },
          life: 0,
          maxLife: Math.random() * 40 + 40 // 40 to 80 frames
        });
      }
    };

    window.addEventListener('mousedown', handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bubbles.current.length; i++) {
        const p = bubbles.current[i];
        p.life++;

        // Update position
        p.x += p.velocity.x;
        p.y += p.velocity.y;

        // Draw bubble (glassy style)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Inner fill (translucent)
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/g, `${1 - (p.life / p.maxLife)})`);
        ctx.fill();

        // White border for glass effect
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - p.life / p.maxLife)})`;
        ctx.stroke();
        
        // Specular highlight (mini dot inside)
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - p.life / p.maxLife)})`;
        ctx.fill();

        // Remove dead bubbles
        if (p.life >= p.maxLife || p.size <= 0) {
          bubbles.current.splice(i, 1);
          i--;
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousedown', handleClick);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}