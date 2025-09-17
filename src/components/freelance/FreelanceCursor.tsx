// src/components/freelance/FreelanceCursor.tsx
'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';

export default function FreelanceCursor() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Refs для throttling
  const lastUpdateTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  // Мемоизируем проверку интерактивности
  const isInteractiveElement = useCallback((target: HTMLElement) => {
    const interactiveClasses = [
      'action-btn', 'nav-link', 'contact-item', 'footer-link', 
      'cta-button', 'form-submit', 'project-link', 'service-card', 
      'project-card', 'stat-item', 'form-input', 'form-textarea'
    ];
    
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA'];
    
    // Проверяем тег
    if (interactiveTags.includes(target.tagName)) {
      return true;
    }
    
    // Проверяем классы
    if (interactiveClasses.some(cls => target.classList.contains(cls))) {
      return true;
    }
    
    // Проверяем родительские элементы
    return interactiveClasses.some(cls => target.closest(`.${cls}`)) ||
           interactiveTags.some(tag => target.closest(tag.toLowerCase()));
  }, []);

  // Асинхронный обработчик движения мыши с throttling
  const updateCursorPosition = useCallback((e: MouseEvent) => {
    const now = performance.now();
    
    // Throttling: обновляем максимум 60 раз в секунду
    if (now - lastUpdateTime.current >= 16) {
      lastUpdateTime.current = now;
      
      // Отменяем предыдущий кадр если он еще не выполнился
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      // Используем requestAnimationFrame для асинхронного обновления
      animationFrameId.current = requestAnimationFrame(() => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
        animationFrameId.current = null;
      });
    }
  }, []);

  // Асинхронный обработчик наведения
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = isInteractiveElement(target);
    
    // Используем requestAnimationFrame для асинхронного обновления
    requestAnimationFrame(() => {
      setIsHovering(isInteractive);
    });
  }, [isInteractiveElement]);

  // Асинхронные обработчики клика
  const handleMouseDown = useCallback(() => {
    requestAnimationFrame(() => {
      setIsClicking(true);
    });
  }, []);
  
  const handleMouseUp = useCallback(() => {
    requestAnimationFrame(() => {
      setIsClicking(false);
    });
  }, []);
  
  const handleMouseOut = useCallback(() => {
    requestAnimationFrame(() => {
      setIsHovering(false);
    });
  }, []);

  // Используем useLayoutEffect для синхронизации с браузерным рендерингом
  useLayoutEffect(() => {
    // Добавляем обработчики событий
    document.addEventListener('mousemove', updateCursorPosition, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      // Очищаем animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [updateCursorPosition, handleMouseDown, handleMouseUp, handleMouseOver, handleMouseOut]);

  // Мемоизируем стили курсора с использованием transform для лучшей производительности
  const cursorStyles = useMemo(() => ({
    transform: `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0)`,
  }), [cursorPosition.x, cursorPosition.y]);

  // Мемоизируем классы курсора
  const cursorClasses = useMemo(() => 
    `freelance-cursor ${isHovering ? 'hover' : ''} ${isClicking ? 'click' : ''}`,
    [isHovering, isClicking]
  );

  return (
    <div
      className={cursorClasses}
      style={cursorStyles}
    />
  );
}
