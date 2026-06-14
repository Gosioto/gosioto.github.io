import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { health } from '../api';
import { useEffect, useState, useRef } from 'react';
import styles from './Landing.module.css';

const FIELD = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    <span className={styles.fieldValue}>{value}</span>
  </div>
);

export default function Landing() {
  const { token, user, loading } = useAuth();
  const [apiStatus, setApiStatus] = useState<'ok' | 'fail' | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    health()
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('fail'));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.target.id) return;
          if (e.isIntersecting) setVisible((v) => new Set(v).add(e.target.id));
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span className={styles.logo}>GOSLOTO.XYZ</span>
        <nav className={styles.nav}>
          {loading ? (
            <span className={styles.muted}>Загрузка…</span>
          ) : token && user ? (
            <Link to="/dashboard" className={styles.cta}>В кабинет</Link>
          ) : (
            <Link to="/login" className={styles.cta}>Вход</Link>
          )}
        </nav>
      </header>

      <main className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.polygon} data-polygon="1" />
          <div className={styles.polygon} data-polygon="2" />
          <div className={styles.polygon} data-polygon="3" />
        </div>
        <h1 className={styles.title}>
          <span className={styles.titleLine}>Иван</span>
          <span className={styles.titleLine}>решаю проблемы</span>
        </h1>
        <p className={styles.subtitle}>
          Анализ, идеи, внедрение. Без лишних слов — по делу.
        </p>
        {apiStatus === 'ok' && <p className={styles.badge}>API</p>}
        {apiStatus === 'fail' && <p className={styles.badgeError}>API offline</p>}
        {!token && (
          <div className={styles.actions}>
            <Link to="/login" className={styles.button}>Войти</Link>
          </div>
        )}
      </main>

      <section
        id="manifest"
        ref={(el) => { sectionRefs.current['manifest'] = el; }}
        className={`${styles.section} ${visible.has('manifest') ? styles.visible : ''}`}
      >
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Принципы интерфейса</h2>
          <div className={styles.manifestGrid}>
            <div className={styles.manifestCard}>
              <span className={styles.manifestLabel}>Только суть</span>
              <p className={styles.manifestValue}>
                На экране — название и значение. Без лишних подсказок и декора. Каждый блок отвечает на один вопрос.
              </p>
            </div>
            <div className={styles.manifestCard}>
              <span className={styles.manifestLabel}>Геометрия и пространство</span>
              <p className={styles.manifestValue}>
                Минимализм: острые углы, пустое пространство, один факт в одном блоке. Удобно сканировать глазами.
              </p>
            </div>
            <div className={styles.manifestCard}>
              <span className={styles.manifestLabel}>Анимация</span>
              <p className={styles.manifestValue}>
                Появление по скроллу, движение линий и форм. Интерфейс реагирует и ведёт взгляд туда, где важно.
              </p>
            </div>
          </div>
          <p className={styles.manifestFootnote}>
            Только необходимое. Ни одного лишнего пикселя.
          </p>
        </div>
      </section>

      <section
        id="about"
        ref={(el) => { sectionRefs.current['about'] = el; }}
        className={`${styles.section} ${styles.sectionDark} ${visible.has('about') ? styles.visible : ''}`}
      >
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Обо мне</h2>
          <div className={styles.fieldsGrid}>
            <FIELD label="Имя" value="Иван" />
            <FIELD label="Чем занимаюсь" value="решаю проблемы: анализ, идеи, внедрение" />
            <FIELD label="Опыт" value="4+ года" />
            <FIELD label="Реализовано проектов" value="8+" />
            <FIELD label="Инструменты" value="код, процессы, автоматизация" />
            <FIELD label="Фокус" value="результат, а не отчётность" />
          </div>
        </div>
      </section>

      <section
        id="skills"
        ref={(el) => { sectionRefs.current['skills'] = el; }}
        className={`${styles.section} ${visible.has('skills') ? styles.visible : ''}`}
      >
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Навыки</h2>
          <div className={styles.skillsGrid}>
            {[
              { label: 'JavaScript', value: '85%' },
              { label: 'TypeScript', value: '80%' },
              { label: 'React', value: '75%' },
              { label: 'Vue.js', value: '55%' },
              { label: 'Angular', value: '55%' },
              { label: 'Rust', value: '55%' },
            ].map((s, i) => (
              <div key={s.label} className={styles.skillPolygon} style={{ animationDelay: `${i * 0.08}s` }}>
                <span className={styles.skillLabel}>{s.label}</span>
                <span className={styles.skillValue}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="projects"
        ref={(el) => { sectionRefs.current['projects'] = el; }}
        className={`${styles.section} ${styles.sectionDark} ${visible.has('projects') ? styles.visible : ''}`}
      >
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Проекты</h2>
          <div className={styles.projectsGrid}>
            <div className={styles.projectCard}>
              <FIELD label="Название" value="SKYT — трекер времени" />
              <FIELD label="Стадия" value="MVP" />
              <FIELD label="Стек" value="Vue.js, Node.js, PostgreSQL" />
            </div>
            <div className={styles.projectCard}>
              <FIELD label="Название" value="Пиксельная Экосистема" />
              <FIELD label="Результат" value="+40% производительности, −70% кода" />
              <FIELD label="Стек" value="TypeScript, React, Canvas API" />
            </div>
            <div className={styles.projectCard}>
              <FIELD label="Название" value="SentinelGuard" />
              <FIELD label="Результат" value="Автоматизация 80% задач" />
              <FIELD label="Стек" value="Python, NMap, Bash" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="auth"
        ref={(el) => { sectionRefs.current['auth'] = el; }}
        className={`${styles.section} ${visible.has('auth') ? styles.visible : ''}`}
      >
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Вход в систему</h2>
          <p className={styles.authDesc}>
            Доступ к панели управления и модулям — только после авторизации.
          </p>
          <div className={styles.authLinks}>
            <Link to="/login" className={styles.authCard}>
              <span className={styles.authCardLabel}>Вход</span>
              <span className={styles.authCardValue}>Войти</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerLogo}>GOSLOTO.XYZ</span>
        <span className={styles.muted}>© 2025. Все права НЕ защищены.</span>
      </footer>
    </div>
  );
}
