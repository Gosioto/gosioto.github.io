// src/components/SkillsSection.tsx
import { useMemo } from 'react';
import { skillsData } from '@/data/skillsData';
import SkillCategoryComponent from './SkillCategory';

const CATEGORY_ORDER: Record<string, number> = {
  frontend: 1, backend: 2, tools: 3, testing: 4, devops: 5, additional: 6, soft: 7
};

const SkillsSection = () => {
  const sortedCategories = useMemo(() => {
    return [...skillsData].sort((a, b) => {
      const orderA = a.order ?? CATEGORY_ORDER[a.id] ?? 999;
      const orderB = b.order ?? CATEGORY_ORDER[b.id] ?? 999;
      return orderA - orderB;
    });
  }, []);

  return (
    <>
      <section className="intro-skills">
        <div className="container">
          <h1>Мои навыки и компетенции</h1>
          <p>
            Ниже — ключевые технические и поведенческие навыки, сгруппированные по категориям и подкатегориям.  
            Процент — самооценка уровня владения; при наведении на карточку — краткое описание.  
            Данные обновляются по мере роста опыта.
          </p>
          <div className="intro-actions intro-actions--grouped">
            <div className="intro-actions-row">
              <span className="intro-actions-label">Технические:</span>
              <a href="#frontend" className="btn btn-primary">Фронтенд</a>
              <a href="#backend" className="btn btn-primary">Бэкенд</a>
              <a href="#tools" className="btn btn-primary">Инструменты</a>
              <a href="#testing" className="btn btn-primary">Тестирование</a>
              <a href="#devops" className="btn btn-primary">DevOps</a>
              <a href="#additional" className="btn btn-primary">Доп. технологии</a>
            </div>
            <div className="intro-actions-row">
              <span className="intro-actions-label">Гибкие:</span>
              <a href="#soft" className="btn btn-secondary">Soft Skills</a>
            </div>
          </div>
        </div>
      </section>

      {sortedCategories.map(category => (
        <SkillCategoryComponent key={category.id} category={category} />
      ))}
    </>
  );
};

export default SkillsSection;