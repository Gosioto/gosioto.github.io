'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

const CLICKABLE_CLASSES = [
  'nav-link', 'project-link', 'form-input', 'form-textarea',
  'freelance-header-logo', 'mobile-nav-link', 'profile-avatar',
  'service-card', 'project-overlay', 'contact-item', 'contact-icon',
];
const BUTTON_SELECTOR = '.action-btn, .cta-button, .form-submit, .freelance-header-menu-btn, .footer-link, .nav-link, .project-card, button';

function updateHoverFromTarget(
  target: HTMLElement,
  setStates: { setIsAvatar: (v: boolean) => void; setIsButton: (v: boolean) => void; setIsHovering: (v: boolean) => void; setIsAnimatingToButton: (v: boolean) => void },
  wasButtonRef: React.MutableRefObject<boolean>,
) {
  const clickableTags = ['INPUT', 'TEXTAREA', 'SELECT'];
  const hasClickableTag = clickableTags.includes(target.tagName);
  const hasClickableClass = CLICKABLE_CLASSES.some((c) => target.classList.contains(c));
  const hasClickableParent = CLICKABLE_CLASSES.some((c) => target.closest(`.${c}`)) || clickableTags.some((tag) => target.closest(tag.toLowerCase()));
  const isInsideProjectCard = target.closest('.project-card');
  const isInsideButton = target.closest(BUTTON_SELECTOR);
  const isButtonElement =
    target.tagName === 'BUTTON' ||
    target.classList.contains('action-btn') ||
    target.classList.contains('cta-button') ||
    target.classList.contains('form-submit') ||
    target.classList.contains('freelance-header-menu-btn') ||
    target.classList.contains('footer-link') ||
    target.classList.contains('nav-link') ||
    target.classList.contains('project-card') ||
    !!isInsideProjectCard ||
    target.getAttribute('role') === 'button' ||
    !!isInsideButton;
  const isOverButton = isButtonElement || !!isInsideButton;
  const isAvatarElement = target.classList.contains('profile-avatar') || !!target.closest('.profile-avatar');
  const isFormElement = (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') && !isButtonElement;
  const isClickable =
    hasClickableTag ||
    hasClickableClass ||
    hasClickableParent ||
    window.getComputedStyle(target).cursor === 'pointer' ||
    target.onclick !== null ||
    target.getAttribute('role') === 'button' ||
    target.getAttribute('tabindex') != null ||
    isFormElement;

  const { setIsAvatar, setIsButton, setIsHovering, setIsAnimatingToButton } = setStates;
  if (isAvatarElement) {
    setIsAvatar(true);
    setIsButton(false);
    setIsHovering(false);
  } else if (isOverButton) {
    const needAnim = !wasButtonRef.current;
    wasButtonRef.current = true;
    setIsAvatar(false);
    setIsButton(true);
    setIsHovering(false);
    if (needAnim) {
      setIsAnimatingToButton(true);
      setTimeout(() => setIsAnimatingToButton(false), 200);
    }
  } else {
    wasButtonRef.current = false;
    setIsAvatar(false);
    setIsButton(false);
    setIsHovering(!!isClickable);
  }
}

const INIT_POS = { x: 100, y: 100 };

export default function FreelanceCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isButton, setIsButton] = useState(false);
  const [isAvatar, setIsAvatar] = useState(false);
  const [isAnimatingToButton, setIsAnimatingToButton] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const pendingPosition = useRef({ ...INIT_POS });
  const wasButtonRef = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const setStates = {
      setIsAvatar,
      setIsButton,
      setIsHovering,
      setIsAnimatingToButton,
    };

    const onPointerMove = (e: PointerEvent) => {
      pendingPosition.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerOver = (e: PointerEvent) => {
      updateHoverFromTarget(e.target as HTMLElement, setStates, wasButtonRef);
    };

    const onPointerOut = () => {
      wasButtonRef.current = false;
      setIsHovering(false);
      setIsButton(false);
      setIsAvatar(false);
    };

    const onPointerDown = () => setIsClicking(true);
    const onPointerUp = () => setIsClicking(false);

    const tick = () => {
      const el = cursorRef.current;
      const { x: px, y: py } = pendingPosition.current;
      if (el) {
        el.style.left = `${px}px`;
        el.style.top = `${py}px`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    const el = cursorRef.current;
    if (el) {
      el.style.left = `${pendingPosition.current.x}px`;
      el.style.top = `${pendingPosition.current.y}px`;
    }
    rafId.current = requestAnimationFrame(tick);

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);

    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  // Стили: размеры и форма. left/top задаются только в rAF через ref — React их не трогает, отставания нет.
  const cursorStyles = useMemo(() => {
    const base = { pointerEvents: 'none' as const };
    if (isButton) {
      return {
        ...base,
        width: '80px',
        height: '30px',
        borderRadius: '0px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        transition: 'width 0.1s ease-out, height 0.1s ease-out 0.1s',
      };
    }
    if (isAvatar) {
      return {
        ...base,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        fontSize: '24px',
        fontWeight: 'normal',
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'none' as const,
        letterSpacing: 'normal',
        transition: 'all 0.2s ease-out',
      };
    }
    const size = isHovering ? 40 : 20;
    const borderRadius = isHovering ? 50 : 0;
    return {
      ...base,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${borderRadius}%`,
      fontSize: 'inherit',
      fontWeight: 'inherit',
      display: 'block' as const,
      alignItems: 'inherit',
      justifyContent: 'inherit',
      textTransform: 'inherit' as const,
      letterSpacing: 'inherit',
      transition: 'width 0.2s ease-out, height 0.2s ease-out, border-radius 0.2s ease-out',
    };
  }, [isHovering, isButton, isAvatar]);

  const cursorClasses = useMemo(
    () =>
      `freelance-cursor ${isHovering && !isButton ? 'hover' : ''} ${isClicking ? 'click' : ''} ${isButton ? 'button' : ''} ${isAvatar ? 'avatar' : ''} ${isAnimatingToButton ? 'animating-to-button' : ''}`,
    [isHovering, isClicking, isButton, isAvatar, isAnimatingToButton]
  );

  return (
    <div ref={cursorRef} className={cursorClasses} style={cursorStyles}>
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