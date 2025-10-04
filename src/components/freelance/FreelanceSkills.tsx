// src/components/freelance/FreelanceSkills.tsx
'use client';

import { useEffect, useRef } from 'react';
import LiveCodeSection from './LiveCodeSection';

export default function FreelanceSkills() {
  const skillCategories = [
    {
      title: 'Frontend',
      skills: [
        { name: 'React', level: 95, color: '#61dafb' },
        { name: 'Next.js', level: 90, color: '#000000' },
        { name: 'TypeScript', level: 88, color: '#3178c6' },
        { name: 'Tailwind CSS', level: 92, color: '#06b6d4' },
        { name: 'Vue.js', level: 75, color: '#4fc08d' }
      ]
    },
    {
      title: 'Backend',
      skills: [
        { name: 'Node.js', level: 90, color: '#339933' },
        { name: 'Python', level: 85, color: '#3776ab' },
        { name: 'PostgreSQL', level: 88, color: '#336791' },
        { name: 'MongoDB', level: 82, color: '#47a248' },
        { name: 'Redis', level: 78, color: '#dc382d' }
      ]
    },
    {
      title: 'Tools & Others',
      skills: [
        { name: 'Docker', level: 85, color: '#2496ed' },
        { name: 'Git', level: 95, color: '#f05032' },
        { name: 'Figma', level: 88, color: '#f24e1e' },
        { name: 'AWS', level: 75, color: '#ff9900' },
        { name: 'Linux', level: 80, color: '#fcc624' }
      ]
    }
  ];

  const skillBarsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Анимация шкал навыков при появлении в viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const skillBar = entry.target as HTMLDivElement;
            const level = skillBar.dataset.level;
            if (level) {
              setTimeout(() => {
                skillBar.style.width = `${level}%`;
              }, 200);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    skillBarsRef.current.forEach((bar) => {
      if (bar) observer.observe(bar);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="freelance-skills" id="skills">
      <div className="freelance-skills-content">
        
        <div className="section-header">
          <h2 className="section-title">Технические навыки</h2>
          <p className="section-subtitle">Технологии, с которыми я работаю</p>
        </div>

        <div className="skills-container">
          {skillCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="skill-category">
              <h3 className="category-title">{category.title}</h3>
              
              <div className="skills-list">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}%</span>
                    </div>
                    
                    <div className="skill-bar">
                      <div 
                        ref={(el) => (skillBarsRef.current[skillIndex] = el)}
                        className="skill-progress"
                        data-level={skill.level}
                        style={{ 
                          width: '0%',
                          backgroundColor: skill.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="code-section-wrapper">
          <LiveCodeSection />
        </div>

      </div>
    </section>
  );
}
