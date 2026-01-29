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

export default function FreelanceParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const scrollYRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const frameRef = useRef(0);

  // Цветовая палитра для частиц
  const colorPalette = [
    '#ff6b35', '#ff8e53', '#ffb174', '#ffd495',
    '#4ecdc4', '#6ae3db', '#8ef0e8', '#b1fff5',
    '#45b7d1', '#67c9e0', '#89dbef', '#abedff'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размеры canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Обработчик скроллинга
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    // Обработчики мыши
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

    // Создаем частицы в фиксированных позициях
    const createParticle = (baseX: number, baseY: number): Particle => ({
      x: baseX,
      y: baseY,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.3,
      life: 0,
      maxLife: Math.random() * 500 + 400,
      baseX: baseX,
      baseY: baseY,
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      connectionRadius: Math.random() * 50 + 40,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01
    });

    const createFixedParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 45;
      const sectionHeight = canvas.height / 4;
      for (let i = 0; i < particleCount; i++) {
        const section = i % 4;
        const baseX = Math.random() * canvas.width;
        const baseY = section * sectionHeight + Math.random() * sectionHeight;
        particles.push(createParticle(baseX, baseY));
      }
      return particles;
    };

    // Инициализируем частицы
    particlesRef.current = createFixedParticles();

    // Функция для рисования соединений между частицами
    const drawConnections = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const maxDistance = Math.min(p1.connectionRadius, p2.connectionRadius);
          
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.2;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = p1.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };

    // Функция для обработки взаимодействия с мышью
    const handleMouseInteraction = (particle: Particle) => {
      if (!mouseRef.current.active) return;

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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameRef.current += 1;
      if (frameRef.current % 2 === 0) {
        drawConnections(ctx, particlesRef.current);
      }

      particlesRef.current.forEach((particle, index) => {
        // Пульсация размера
        const pulse = Math.sin(particle.life * particle.pulseSpeed + particle.pulsePhase) * 0.3 + 1;
        const currentSize = particle.size * pulse;

        // Взаимодействие с мышью
        handleMouseInteraction(particle);

        // Обновляем позицию с учетом скроллинга
        particle.x = particle.baseX + particle.vx * particle.life;
        particle.y = particle.baseY - scrollYRef.current + particle.vy * particle.life;
        particle.life++;

        // Плавное изменение скорости
        particle.vx += (Math.random() - 0.5) * 0.01;
        particle.vy += (Math.random() - 0.5) * 0.01;

        // Ограничение скорости
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > 0.5) {
          particle.vx = (particle.vx / speed) * 0.5;
          particle.vy = (particle.vy / speed) * 0.5;
        }

        // Проверяем границы с учетом скроллинга
        const buffer = 50;
        if (particle.x < -buffer || particle.x > canvas.width + buffer) particle.vx *= -1;
        if (particle.y < -scrollYRef.current - buffer || particle.y > canvas.height - scrollYRef.current + buffer) {
          particle.vy *= -1;
        }

        // Циклическое изменение прозрачности
        particle.opacity = 0.3 + Math.sin(particle.life * 0.02) * 0.3;

        // Если частица "умерла", создаем новую в том же месте
        if (particle.life > particle.maxLife) {
          particlesRef.current[index] = createParticle(particle.baseX, particle.baseY);
        }

        // Рисуем частицу только если она в видимой области
        if (particle.y >= -scrollYRef.current - buffer && particle.y <= canvas.height - scrollYRef.current + buffer) {
          // Свечение
          ctx.save();
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 15;
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
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