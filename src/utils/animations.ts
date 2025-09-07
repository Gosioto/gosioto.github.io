// src/utils/animations.ts

export class AnimationUtils {
  private static observers: IntersectionObserver[] = [];
  private static animationElements: Set<Element> = new Set();

  static initAll() {
    this.initScrollReveal();
    this.initCounterAnimations();
    this.initParallaxEffects();
    this.initHoverEffects();
  }

  static initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.animationElements.add(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    this.observers.push(observer);
  }

  static initCounterAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
            this.animateCounter(entry.target as HTMLElement);
            entry.target.setAttribute('data-animated', 'true');
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('.counter, .counter-percent, .counter-plus').forEach((el) => {
      observer.observe(el);
    });

    this.observers.push(observer);
  }

  static initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-parallax') || '0.5');
        const yPos = -(scrolled * speed);
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Store cleanup function
    this.cleanupFunctions.push(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  }

  static initHoverEffects() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.stat-card, .top-card, .current-game-card, .steam-item');
    
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hover-lift');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover-lift');
      });
    });
  }

  private static animateCounter(element: HTMLElement) {
    const target = parseInt(element.getAttribute('data-target') || '0');
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = parseInt(element.getAttribute('data-duration') || '2000');
    
    let startTime: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(easeOut * target);
      
      if (element.classList.contains('counter-percent')) {
        element.textContent = value + '%';
      } else if (element.classList.contains('counter-plus')) {
        element.textContent = value.toLocaleString() + '+';
      } else {
        element.textContent = value.toLocaleString() + suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }

  private static cleanupFunctions: (() => void)[] = [];

  static cleanup() {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Run cleanup functions
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    
    // Clear animation elements
    this.animationElements.clear();
  }

  // Utility methods for specific animations
  static fadeIn(element: Element, duration = 300) {
    element.setAttribute('style', 'opacity: 0; transition: opacity ' + duration + 'ms ease-in-out;');
    
    requestAnimationFrame(() => {
      (element as HTMLElement).style.opacity = '1';
    });
  }

  static slideUp(element: Element, duration = 300) {
    element.setAttribute('style', 'transform: translateY(20px); opacity: 0; transition: all ' + duration + 'ms ease-out;');
    
    requestAnimationFrame(() => {
      (element as HTMLElement).style.transform = 'translateY(0)';
      (element as HTMLElement).style.opacity = '1';
    });
  }

  static scaleIn(element: Element, duration = 300) {
    element.setAttribute('style', 'transform: scale(0.8); opacity: 0; transition: all ' + duration + 'ms ease-out;');
    
    requestAnimationFrame(() => {
      (element as HTMLElement).style.transform = 'scale(1)';
      (element as HTMLElement).style.opacity = '1';
    });
  }

  // Stagger animation for multiple elements
  static staggerAnimation(elements: Element[], animation: (el: Element) => void, delay = 100) {
    elements.forEach((element, index) => {
      setTimeout(() => {
        animation(element);
      }, index * delay);
    });
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AnimationUtils.initAll();
    });
  } else {
    AnimationUtils.initAll();
  }
}
