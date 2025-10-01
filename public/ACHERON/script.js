// ACHERON Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Запрет копирования и выделения текста
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Запрет горячих клавиш для копирования
    document.addEventListener('keydown', function(e) {
        // Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, Ctrl+S, F12, Ctrl+Shift+I
        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 65 || e.keyCode === 86 || e.keyCode === 88 || e.keyCode === 83)) {
            e.preventDefault();
            return false;
        }
        if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
            e.preventDefault();
            return false;
        }
    });

    // Плавная прокрутка к секциям
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Мобильное меню
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Плавная прокрутка для навигационных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });

    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами для анимации
    document.querySelectorAll('.feature-card, .pricing-card, .about-text, .contact-form').forEach(el => {
        observer.observe(el);
    });

    // Параллакс эффект для hero секции
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-background');
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Анимация счетчиков в hero stats
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = counter.textContent;
            if (target === '0%') {
                animateCounter(counter, 0, 0, 1000);
            } else if (target === '∞') {
                // Для бесконечности просто добавляем класс анимации
                counter.style.animation = 'pulse 2s infinite';
            }
        });
    }

    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * progress;
            
            element.textContent = Math.floor(current) + '%';
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    // Запускаем анимацию счетчиков при загрузке
    setTimeout(animateCounters, 1000);

    // Система уведомлений
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        // Цвета в зависимости от типа
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #f87171, #ef4444)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #4a9eff, #3b82f6)';
        }
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    // Эффект печатания для заголовка
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Применяем эффект печатания к подзаголовку
    const subtitle = document.querySelector('.title-subtitle');
    if (subtitle) {
        const originalText = subtitle.textContent;
        setTimeout(() => {
            typeWriter(subtitle, originalText, 80);
        }, 2000);
    }

    // Интерактивные частицы при клике
    document.addEventListener('click', function(e) {
        createParticle(e.clientX, e.clientY);
    });

    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: #4a9eff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: particleFloat 1s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            document.body.removeChild(particle);
        }, 1000);
    }

    // Добавляем CSS для анимации частиц
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
                opacity: 0;
            }
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }
        
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-top: 1px solid rgba(74, 158, 255, 0.1);
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    `;
    document.head.appendChild(style);

    // Эффект свечения для кнопок при наведении
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 30px rgba(74, 158, 255, 0.5)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });

    // Плавное появление элементов при загрузке
    const elements = document.querySelectorAll('.hero-content, .feature-card, .pricing-card');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });

    console.log('🌊 ACHERON Landing Page loaded successfully!');
});
