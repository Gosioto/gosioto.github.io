'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  baseX: number;
  baseY: number;
  color: string;
  connectionRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const COLOR_PALETTE = [
  '#ff6b35', '#ff8e53', '#ffb174', '#ffd495',
  '#4ecdc4', '#6ae3db', '#8ef0e8', '#b1fff5',
  '#45b7d1', '#67c9e0', '#89dbef', '#abedff'
];

/** Частиц по вертикальным зонам: hero, затем остальные секции */
const ZONE_COUNTS_DESKTOP = [7, 6, 6, 6];
const ZONE_COUNTS_MOBILE = [5, 3, 3, 3];

function getZoneCounts(isMobile: boolean): number[] {
  return isMobile ? ZONE_COUNTS_MOBILE : ZONE_COUNTS_DESKTOP;
}

export default function FreelanceParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const scrollYRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const frameRef = useRef(0);
  const isMobileRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updatePrefs = () => {
      isMobileRef.current = mobileQuery.matches;
      reducedMotionRef.current = motionQuery.matches;
    };

    updatePrefs();

    const createParticle = (baseX: number, baseY: number): Particle => ({
      x: baseX,
      y: baseY,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.3,
      life: 0,
      maxLife: Math.random() * 500 + 400,
      baseX,
      baseY,
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      connectionRadius: Math.random() * 50 + 40,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01
    });

    const createFixedParticles = (): Particle[] => {
      const particles: Particle[] = [];
      const zoneCounts = getZoneCounts(isMobileRef.current);
      const sectionHeight = canvas.height / zoneCounts.length;

      zoneCounts.forEach((count, section) => {
        for (let i = 0; i < count; i++) {
          const baseX = Math.random() * canvas.width;
          const baseY = section * sectionHeight + Math.random() * sectionHeight;
          particles.push(createParticle(baseX, baseY));
        }
      });

      return particles;
    };

    const rebuildParticles = () => {
      particlesRef.current = createFixedParticles();
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      rebuildParticles();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleMediaChange = () => {
      updatePrefs();
      rebuildParticles();
    };

    mobileQuery.addEventListener('change', handleMediaChange);
    motionQuery.addEventListener('change', handleMediaChange);

    const handleVisibility = () => {
      pausedRef.current = document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibility);

    const drawConnections = (context: CanvasRenderingContext2D, particles: Particle[]) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distanceSq = dx * dx + dy * dy;
          const maxDistance = Math.min(p1.connectionRadius, p2.connectionRadius);

          if (distanceSq >= maxDistance * maxDistance) continue;

          const distance = Math.sqrt(distanceSq);
          const opacity = (1 - distance / maxDistance) * 0.2;

          context.save();
          context.globalAlpha = opacity;
          context.strokeStyle = p1.color;
          context.lineWidth = 0.5;
          context.beginPath();
          context.moveTo(p1.x, p1.y);
          context.lineTo(p2.x, p2.y);
          context.stroke();
          context.restore();
        }
      }
    };

    const handleMouseInteraction = (particle: Particle) => {
      if (!mouseRef.current.active || reducedMotionRef.current) return;

      const dx = particle.x - mouseRef.current.x;
      const dy = particle.y - mouseRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const repulsionRadius = 100;

      if (distance < repulsionRadius) {
        const force = (repulsionRadius - distance) / repulsionRadius;
        const angle = Math.atan2(dy, dx);

        particle.vx += Math.cos(angle) * force * 0.1;
        particle.vy += Math.sin(angle) * force * 0.1;
      }
    };

    const drawParticles = (animateMotion: boolean) => {
      const buffer = 50;
      const useGlow = !isMobileRef.current && !reducedMotionRef.current;
      const connectionInterval = isMobileRef.current ? 5 : 4;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (animateMotion && frameRef.current % connectionInterval === 0) {
        drawConnections(ctx, particlesRef.current);
      } else if (!animateMotion) {
        drawConnections(ctx, particlesRef.current);
      }

      particlesRef.current.forEach((particle, index) => {
        if (animateMotion) {
          handleMouseInteraction(particle);

          particle.x = particle.baseX + particle.vx * particle.life;
          particle.y = particle.baseY - scrollYRef.current + particle.vy * particle.life;
          particle.life++;

          particle.vx += (Math.random() - 0.5) * 0.01;
          particle.vy += (Math.random() - 0.5) * 0.01;

          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          if (speed > 0.5) {
            particle.vx = (particle.vx / speed) * 0.5;
            particle.vy = (particle.vy / speed) * 0.5;
          }

          if (particle.x < -buffer || particle.x > canvas.width + buffer) particle.vx *= -1;
          if (
            particle.y < -scrollYRef.current - buffer ||
            particle.y > canvas.height - scrollYRef.current + buffer
          ) {
            particle.vy *= -1;
          }

          particle.opacity = 0.3 + Math.sin(particle.life * 0.02) * 0.3;

          if (particle.life > particle.maxLife) {
            particlesRef.current[index] = createParticle(particle.baseX, particle.baseY);
          }
        } else {
          particle.x = particle.baseX;
          particle.y = particle.baseY - scrollYRef.current;
        }

        const pulse = animateMotion
          ? Math.sin(particle.life * particle.pulseSpeed + particle.pulsePhase) * 0.3 + 1
          : 1;
        const currentSize = particle.size * pulse;

        if (
          particle.y >= -scrollYRef.current - buffer &&
          particle.y <= canvas.height - scrollYRef.current + buffer
        ) {
          ctx.save();
          if (useGlow) {
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 15;
          }
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    };

    const animate = () => {
      if (pausedRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      frameRef.current += 1;
      drawParticles(!reducedMotionRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    if (reducedMotionRef.current) {
      drawParticles(false);
    } else {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      mobileQuery.removeEventListener('change', handleMediaChange);
      motionQuery.removeEventListener('change', handleMediaChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="freelance-particles"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.7,
        background: 'transparent'
      }}
    />
  );
}
