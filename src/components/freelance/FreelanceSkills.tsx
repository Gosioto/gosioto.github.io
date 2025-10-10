// src/components/freelance/FreelanceSkills.tsx
'use client';

// Убрали неиспользуемые импорты
import LiveCodeSection from './LiveCodeSection';

export default function FreelanceSkills() {
  const skillCategories = [
    {
      title: 'Frontend',
      icon: 'fas fa-code',
      skills: [
        { name: 'React', level: 95, color: '#61dafb', icon: 'fab fa-react', experience: '4+ лет' },
        { name: 'Next.js', level: 90, color: '#000000', icon: 'fas fa-layer-group', experience: '4+ лет' },
        { name: 'TypeScript', level: 88, color: '#3178c6', icon: 'fab fa-js-square', experience: '4+ лет' },
        { name: 'Tailwind CSS', level: 92, color: '#06b6d4', icon: 'fas fa-paint-brush', experience: '2+ лет' },
        { name: 'Vue.js', level: 75, color: '#4fc08d', icon: 'fab fa-vue', experience: '2+ лет' }
      ]
    },
    {
      title: 'Backend',
      icon: 'fas fa-server',
      skills: [
        { name: 'Node.js', level: 90, color: '#339933', icon: 'fab fa-node-js', experience: '2+ лет' },
        { name: 'Python', level: 85, color: '#3776ab', icon: 'fab fa-python', experience: '5+ лет' },
        { name: 'PostgreSQL', level: 88, color: '#336791', icon: 'fas fa-database', experience: '2+ лет' },
        { name: 'MongoDB', level: 82, color: '#47a248', icon: 'fas fa-leaf', experience: '3+ лет' },
        { name: 'Redis', level: 78, color: '#dc382d', icon: 'fas fa-memory', experience: '2+ лет' }
      ]
    },
    {
      title: 'Tools & Others',
      icon: 'fas fa-tools',
      skills: [
        { name: 'Docker', level: 85, color: '#2496ed', icon: 'fab fa-docker', experience: '3+ лет' },
        { name: 'Git', level: 95, color: '#f05032', icon: 'fab fa-git-alt', experience: '4+ лет' },
        { name: 'Figma', level: 88, color: '#f24e1e', icon: 'fab fa-figma', experience: '3+ лет' },
        { name: 'AWS', level: 75, color: '#ff9900', icon: 'fab fa-aws', experience: '2+ лет' },
        { name: 'Linux', level: 80, color: '#fcc624', icon: 'fab fa-linux', experience: '2+ лет' }
      ]
    }
  ];

  // Убрали прогресс-бары, оставили только индикаторы точек

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
              <div className="category-header">
                <div className="category-icon">
                  <i className={category.icon}></i>
                </div>
                <h3 className="category-title">{category.title}</h3>
              </div>
              
              <div className="skills-list">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="skill-item">
                    <div className="skill-header">
                      <div className="skill-info">
                        <div className="skill-icon">
                          <i className={skill.icon}></i>
                        </div>
                        <span className="skill-name">{skill.name}</span>
                      </div>
                      <div className="skill-meta">
                        <span className="skill-experience">{skill.experience}</span>
                        <span className="skill-level">{skill.level}%</span>
                      </div>
                    </div>
                    
                    <div className="skill-indicators">
                      <div className="indicator-dots">
                        {[...Array(10)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`indicator-dot ${i < skill.level / 10 ? 'active' : ''}`}
                            style={{ backgroundColor: skill.color }}
                          ></div>
                        ))}
                      </div>
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
