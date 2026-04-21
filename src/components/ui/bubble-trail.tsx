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
  const mouse = useRef({ x: -100, y: -100 });
  const isMoving = useRef(false);
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

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      isMoving.current = true;

      // Create a new bubble on mouse move (limit creation rate by adding random chance or distance check)
      if (Math.random() > 0.3) {
        const size = Math.random() * 8 + 4; // 4px to 12px
        // Frutiger Aero / Crystal blueish-white colors
        const colors = [
          'rgba(255, 255, 255, 0.8)',
          'rgba(180, 230, 255, 0.6)',
          'rgba(200, 240, 255, 0.7)',
        ];
        
        bubbles.current.push({
          x: mouse.current.x + (Math.random() * 20 - 10),
          y: mouse.current.y + (Math.random() * 20 - 10),
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
          velocity: {
            x: (Math.random() - 0.5) * 1.5,
            y: (Math.random() - 0.5) * 1.5 - 1 // slight upward drift like bubbles
          },
          life: 0,
          maxLife: Math.random() * 30 + 30 // 30 to 60 frames
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

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
      window.removeEventListener('mousemove', handleMouseMove);
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