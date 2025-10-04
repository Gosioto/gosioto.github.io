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
}

export default function FreelanceParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const scrollYRef = useRef(0);

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

    // Создаем частицы
    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.2,
      life: 0,
      maxLife: Math.random() * 400 + 300
    });

    // Инициализируем частицы
    for (let i = 0; i < 80; i++) {
      particlesRef.current.push(createParticle());
    }

    // Анимация
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Обновляем позицию с учетом скроллинга
        particle.x += particle.vx;
        particle.y += particle.vy - scrollYRef.current * 0.1; // Параллакс эффект
        particle.life++;

        // Проверяем границы с учетом скроллинга
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < -scrollYRef.current * 0.1 || particle.y > canvas.height - scrollYRef.current * 0.1) {
          particle.vy *= -1;
        }

        // Уменьшаем прозрачность со временем
        particle.opacity = Math.max(0, particle.opacity - 0.0008);

        // Если частица "умерла", создаем новую
        if (particle.life > particle.maxLife || particle.opacity <= 0) {
          particlesRef.current[index] = createParticle();
        }

        // Рисуем частицу
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
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
        opacity: 0.5
      }}
    />
  );
}