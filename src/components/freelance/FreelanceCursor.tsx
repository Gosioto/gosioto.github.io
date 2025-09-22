'use client';

import { useState, useLayoutEffect, useMemo, useRef } from 'react';

export default function FreelanceCursor() {
  const [cursorPosition, setCursorPosition] = useState({ x: 100, y: 100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isButton, setIsButton] = useState(false);
  const [isButtonText, setIsButtonText] = useState(false);
  const [isAvatar, setIsAvatar] = useState(false);
  const [isAnimatingToButton, setIsAnimatingToButton] = useState(false);
  
  // Refs для оптимизации
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef(0);
  const pendingPosition = useRef({ x: 100, y: 100 });
  const lastElementCheckTime = useRef(0);
  const lastTouchElementCheckTime = useRef(0);

  // Инициализация курсора
  useLayoutEffect(() => {
    
    // Оптимизированный обработчик движения мыши с throttling
    const handleMouseMove = (e: MouseEvent) => {
      // Сохраняем позицию для следующего обновления
      pendingPosition.current = { x: e.clientX, y: e.clientY };
      
      // Оптимизированная проверка элементов - максимум 30 раз в секунду (33ms)
      const now = performance.now();
      if (now - lastElementCheckTime.current >= 33) {
        lastElementCheckTime.current = now;
        
        // Проверяем элемент под курсором
        const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
        if (target) {
          // Используем ту же логику, что и для mouseover
          handleMouseOver({ target } as unknown as MouseEvent);
        }
      }
      
      // Throttling для позиции: обновляем максимум 60 раз в секунду (16ms)
      if (now - lastUpdateTime.current >= 16) {
        lastUpdateTime.current = now;
        
        // Отменяем предыдущий кадр если он еще не выполнился
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        
        // Используем requestAnimationFrame для плавного обновления
        animationFrameId.current = requestAnimationFrame(() => {
          setCursorPosition(pendingPosition.current);
          animationFrameId.current = null;
        });
      }
    };

    // Обработчик касаний для мобильных устройств
    const handleTouchMove = (e: TouchEvent) => {
      // НЕ предотвращаем скролл - позволяем пользователю скроллить
      
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        // Сохраняем позицию для следующего обновления
        pendingPosition.current = { x: touch.clientX, y: touch.clientY };
        
        // Оптимизированная проверка элементов для touch - максимум 60 раз в секунду (16ms)
        const now = performance.now();
        if (now - lastTouchElementCheckTime.current >= 16) {
          lastTouchElementCheckTime.current = now;
          
          // Проверяем элемент под пальцем
          const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
          if (target) {
            // Используем ту же логику, что и для mouseover
            handleMouseOver({ target } as unknown as MouseEvent);
          }
        }
        
        // Throttling для позиции: обновляем максимум 60 раз в секунду (16ms)
        if (now - lastUpdateTime.current >= 16) {
          lastUpdateTime.current = now;
          
          // Отменяем предыдущий кадр если он еще не выполнился
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
          }
          
          // Используем requestAnimationFrame для плавного обновления
          animationFrameId.current = requestAnimationFrame(() => {
            setCursorPosition(pendingPosition.current);
            animationFrameId.current = null;
          });
        }
      }
    };
    

      // Оптимизированный обработчик hover (без throttling для мгновенного отклика)
      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
      
      // Список только кликабельных элементов (инпуты, но не кнопки и ссылки)
      const clickableTags = ['INPUT', 'TEXTAREA', 'SELECT'];
      const clickableClasses = [
        // Основные кликабельные элементы (без кнопок)
        'nav-link', 'project-link',
        'form-input', 'form-textarea',
        
        // Header кликабельные элементы (без кнопок)
        'freelance-header-logo', 'mobile-nav-link',
        
        // Profile кликабельные элементы
        'profile-avatar',
        
        // Service кликабельные элементы (только если они кликабельные)
        'service-card', // только если карточка кликабельная
        
        // Project кликабельные элементы
        'project-overlay',
        
        // Contact кликабельные элементы
        'contact-item', 'contact-icon'
      ];
      
      // Проверяем тег (только кликабельные теги)
      const hasClickableTag = clickableTags.includes(target.tagName);
      
      // Проверяем классы элемента (только кликабельные классы)
      const hasClickableClass = clickableClasses.some(cls => 
        target.classList.contains(cls)
      );
      
      // Проверяем родительские элементы (только кликабельные)
      const hasClickableParent = clickableClasses.some(cls => 
        target.closest(`.${cls}`)
      ) || clickableTags.some(tag => 
        target.closest(tag.toLowerCase())
      );
      
      // Проверяем, находится ли элемент внутри project-card
      const isInsideProjectCard = target.closest('.project-card');
      
      // Проверяем, является ли элемент действительно кликабельным
      const computedStyle = window.getComputedStyle(target);
      const hasPointerCursor = computedStyle.cursor === 'pointer';
      const hasClickHandler = target.onclick !== null;
      const hasRoleButton = target.getAttribute('role') === 'button';
      const hasTabIndex = target.getAttribute('tabindex') !== null;
      const hasHref = target.getAttribute('href') !== null;
      
      // Проверяем, является ли элемент кнопкой (включая элементы внутри кнопок)
      const isInsideButton = target.closest('.action-btn, .cta-button, .form-submit, .freelance-header-menu-btn, .footer-link, .nav-link, .project-card, button');
      const isButtonElement = target.tagName === 'BUTTON' || 
                             target.classList.contains('action-btn') ||
                             target.classList.contains('cta-button') ||
                             target.classList.contains('form-submit') ||
                             target.classList.contains('freelance-header-menu-btn') ||
                             target.classList.contains('footer-link') ||
                             target.classList.contains('nav-link') ||
                             target.classList.contains('project-card') ||
                             isInsideProjectCard || // Элементы внутри project-card
                             target.getAttribute('role') === 'button' ||
                             !!isInsideButton; // Если элемент внутри кнопки - считаем его кнопкой
      
      // Проверяем, находится ли курсор над кнопкой (по всей площади)
      const isOverButton = isButtonElement || isInsideButton;
      
      // Проверяем, является ли элемент текстом внутри кнопки
      // Текст внутри кнопки - это когда элемент внутри кнопки, но сам элемент не является кнопкой
      // И это именно текстовые элементы (не иконки, не изображения)
      const isButtonTextElement = isInsideButton && !isButtonElement && (
        target.tagName === 'SPAN' || 
        target.tagName === 'P' || 
        target.nodeType === Node.TEXT_NODE ||
        (target.tagName === 'DIV' && target.textContent && target.textContent.trim().length > 0)
      );
      
      // Проверяем, является ли элемент аватаром
      const isAvatarElement = target.classList.contains('profile-avatar') || 
                             target.closest('.profile-avatar');
      
      // Проверяем, является ли элемент формой или инпутом (но не кнопкой)
      const isFormElement = (target.tagName === 'INPUT' || 
                            target.tagName === 'TEXTAREA' || 
                            target.tagName === 'SELECT') && !isButtonElement;
      
      const isClickable = hasClickableTag || hasClickableClass || hasClickableParent || 
                         hasPointerCursor || hasClickHandler || hasRoleButton || 
                         hasTabIndex || isFormElement;
      
      // Приоритет состояний: аватар > кнопка (включая текст внутри) > обычный hover
      if (isAvatarElement) {
        setIsAvatar(true);
        setIsButton(false);
        setIsButtonText(false);
        setIsHovering(false);
      } else if (isOverButton) {
        // Если курсор над кнопкой (по всей площади) - показываем кнопку CLICK
        setIsAvatar(false);
        setIsButton(true);
        setIsButtonText(false);
        setIsHovering(false);
        
        // Запускаем анимацию трансформации в кнопку
        if (!isButton) {
          setIsAnimatingToButton(true);
          // Через 200ms завершаем анимацию
          setTimeout(() => {
            setIsAnimatingToButton(false);
          }, 200);
        }
      } else {
        setIsAvatar(false);
        setIsButton(false);
        setIsButtonText(false);
        setIsHovering(isClickable);
      }
    };
    
    const handleMouseOut = () => {
      setIsHovering(false);
      setIsButton(false);
      setIsButtonText(false);
      setIsAvatar(false);
    };
    
    // Обработчик касаний для определения элементов
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        // Обновляем позицию курсора сразу при касании
        pendingPosition.current = { x: touch.clientX, y: touch.clientY };
        setCursorPosition(pendingPosition.current);
        
        const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
        
        if (target) {
          // Используем ту же логику, что и для mouseover
          handleMouseOver({ target } as unknown as MouseEvent);
        }
      }
    };

    // Обработчик окончания касания
    const handleTouchEnd = () => {
      // Сбрасываем все состояния при окончании касания
      setIsHovering(false);
      setIsButton(false);
      setIsButtonText(false);
      setIsAvatar(false);
    };

    // Обработчик скролла для обновления позиции курсора
    const handleScroll = () => {
      // При скролле обновляем позицию курсора без throttling
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      animationFrameId.current = requestAnimationFrame(() => {
        setCursorPosition(pendingPosition.current);
        animationFrameId.current = null;
      });
    };

    // Обработчик колесика мыши для обновления позиции курсора
    const handleWheel = () => {
      // При прокрутке колесиком также обновляем позицию курсора
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      animationFrameId.current = requestAnimationFrame(() => {
        setCursorPosition(pendingPosition.current);
        animationFrameId.current = null;
      });
    };

    // Добавляем обработчики событий
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('wheel', handleWheel, { passive: true });
    
    // Добавляем touch события для мобильных устройств
    document.addEventListener('touchmove', handleTouchMove, { passive: true }); // Разрешаем скролл
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      // Отменяем pending animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('wheel', handleWheel);
      
      // Удаляем touch события
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []); // Empty dependency array to ensure handlers are added once

  // Оптимизированные стили курсора с единым центрированием
  const cursorStyles = useMemo(() => {
    // Единая точка центрирования - центр невидимого системного курсора
    // cursorPosition.x и cursorPosition.y уже представляют центр курсора
    const centerX = cursorPosition.x;
    const centerY = cursorPosition.y;
    
    if (isButton) {
      // Стили для кнопки CLICK - центрируем относительно центра невидимого курсора
      const buttonWidth = 80;
      const buttonHeight = 30;
      
      return {
        width: `${buttonWidth}px`,
        height: `${buttonHeight}px`,
        borderRadius: '0px',
        left: `${centerX}px`, // Позиционируем по центру курсора
        top: `${centerY}px`,   // Позиционируем по центру курсора
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        // transform управляется CSS
        transition: 'width 0.1s ease-out, height 0.1s ease-out 0.1s',
        pointerEvents: 'none' as const,
      };
    } else if (isButtonText) {
      // Стили для текста внутри кнопки - показываем круг, центрируем относительно центра курсора
      const size = 40;
      
      return {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        left: `${centerX}px`, // Позиционируем по центру курсора
        top: `${centerY}px`,   // Позиционируем по центру курсора
        fontSize: 'inherit',
        fontWeight: 'inherit',
        display: 'block' as const,
        alignItems: 'inherit',
        justifyContent: 'inherit',
        textTransform: 'inherit' as const,
        letterSpacing: 'inherit',
        // transform управляется CSS
        transition: 'width 0.2s ease-out, height 0.2s ease-out, border-radius 0.2s ease-out',
        pointerEvents: 'none' as const,
      };
    } else if (isAvatar) {
      // Стили для аватара - показываем усы и бороду с моноклем, центрируем относительно центра курсора
      const size = 60;
      
      return {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        left: `${centerX}px`, // Позиционируем по центру курсора
        top: `${centerY}px`,   // Позиционируем по центру курсора
        fontSize: '24px',
        fontWeight: 'normal',
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'none' as const,
        letterSpacing: 'normal',
        // transform управляется CSS
        transition: 'all 0.2s ease-out',
        pointerEvents: 'none' as const,
      };
    } else {
      // Обычные стили для квадрата/круга - центрируем относительно центра невидимого курсора
      const size = isHovering ? 40 : 20;
      const borderRadius = isHovering ? 50 : 0;
      
      return {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${borderRadius}%`,
        left: `${centerX}px`, // Позиционируем по центру курсора
        top: `${centerY}px`,  // Позиционируем по центру курсора
        fontSize: 'inherit',
        fontWeight: 'inherit',
        display: 'block' as const,
        alignItems: 'inherit',
        justifyContent: 'inherit',
        textTransform: 'inherit' as const,
        letterSpacing: 'inherit',
        // transform управляется CSS
        transition: 'width 0.2s ease-out, height 0.2s ease-out, border-radius 0.2s ease-out',
        pointerEvents: 'none' as const,
      };
    }
  }, [cursorPosition.x, cursorPosition.y, isHovering, isButton, isButtonText, isAvatar]);

  // Оптимизированные классы курсора
  const cursorClasses = useMemo(() => 
    `freelance-cursor ${isHovering && !isButton && !isButtonText ? 'hover' : ''} ${isClicking ? 'click' : ''} ${isButton ? 'button' : ''} ${isButtonText ? 'button-text' : ''} ${isAvatar ? 'avatar' : ''} ${isAnimatingToButton ? 'animating-to-button' : ''}`,
    [isHovering, isClicking, isButton, isButtonText, isAvatar, isAnimatingToButton]
  );
  
  return (
    <div
      className={cursorClasses}
      style={cursorStyles}
      data-debug="cursor-element"
      data-states={`button:${isButton},text:${isButtonText},avatar:${isAvatar},hover:${isHovering}`}
    >
      {isButton && 'CLICK'}
             {isAvatar && (
               <img 
                 src="/img/ysi.png" 
                 alt="Усы" 
                 style={{ 
                   width: '93%', // Уменьшаем на 7% (100% - 7% = 93%)
                   height: '93%', // Уменьшаем на 7% (100% - 7% = 93%)
                   objectFit: 'contain'
                 }} 
               />
             )}
    </div>
  );
}