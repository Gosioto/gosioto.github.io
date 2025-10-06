'use client';

import { useState, useEffect } from 'react';

export default function TradedamageTech() {
  const [activeTech, setActiveTech] = useState('frontend');

  const techStack = [
    {
      id: 'frontend',
      title: 'Frontend',
      icon: '⚛️',
      technologies: [
        { name: 'React', level: 95, color: '#61dafb' },
        { name: 'TypeScript', level: 90, color: '#3178c6' },
        { name: 'Next.js', level: 88, color: '#000000' },
        { name: 'Tailwind CSS', level: 85, color: '#06b6d4' },
        { name: 'Framer Motion', level: 80, color: '#ff0055' }
      ]
    },
    {
      id: 'backend',
      title: 'Backend',
      icon: '🖥️',
      technologies: [
        { name: 'Node.js', level: 92, color: '#339933' },
        { name: 'Express', level: 88, color: '#000000' },
        { name: 'Socket.io', level: 85, color: '#010101' },
        { name: 'MongoDB', level: 82, color: '#47a248' },
        { name: 'Redis', level: 78, color: '#dc382d' }
      ]
    },
    {
      id: 'game',
      title: 'Game Engine',
      icon: '🎮',
      technologies: [
        { name: 'WebGL', level: 90, color: '#990000' },
        { name: 'Three.js', level: 85, color: '#000000' },
        { name: 'WebSocket', level: 88, color: '#010101' },
        { name: 'Canvas API', level: 82, color: '#000000' },
        { name: 'Web Audio', level: 75, color: '#ff6b35' }
      ]
    },
    {
      id: 'tools',
      title: 'Tools & DevOps',
      icon: '🔧',
      technologies: [
        { name: 'Docker', level: 85, color: '#2496ed' },
        { name: 'AWS', level: 80, color: '#ff9900' },
        { name: 'Git', level: 90, color: '#f05032' },
        { name: 'Jest', level: 82, color: '#c21325' },
        { name: 'ESLint', level: 88, color: '#4b32c3' }
      ]
    }
  ];

  return (
    <section className="tradedamage-tech" id="tech">
      <div className="tech-container">
        <div className="section-header">
          <h2 className="section-title">Technology Stack</h2>
          <p className="section-subtitle">Built with modern technologies for optimal performance</p>
        </div>

        <div className="tech-content">
          <div className="tech-tabs">
            {techStack.map((tech) => (
              <button
                key={tech.id}
                className={`tech-tab ${activeTech === tech.id ? 'active' : ''}`}
                onClick={() => setActiveTech(tech.id)}
              >
                <span className="tech-icon">{tech.icon}</span>
                <span className="tech-title">{tech.title}</span>
              </button>
            ))}
          </div>

          <div className="tech-panel">
            {techStack.map((tech) => (
              <div
                key={tech.id}
                className={`tech-content-panel ${activeTech === tech.id ? 'active' : ''}`}
              >
                <h3 className="panel-title">{tech.title} Technologies</h3>
                <div className="tech-skills">
                  {tech.technologies.map((skill, index) => (
                    <div key={index} className="tech-skill">
                      <div className="skill-header">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-level">{skill.level}%</span>
                      </div>
                      <div className="skill-bar">
                        <div
                          className="skill-progress"
                          style={{
                            width: `${skill.level}%`,
                            backgroundColor: skill.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tech-highlights">
          <div className="highlight-card">
            <h4>Real-time Performance</h4>
            <p>Optimized for low-latency trading with WebSocket connections and efficient state management.</p>
          </div>
          <div className="highlight-card">
            <h4>Scalable Architecture</h4>
            <p>Built to handle thousands of concurrent players with microservices and load balancing.</p>
          </div>
          <div className="highlight-card">
            <h4>Cross-platform</h4>
            <p>Runs seamlessly on desktop, mobile, and tablet devices with responsive design.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
