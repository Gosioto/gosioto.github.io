'use client';

import { useState, useEffect, useRef } from 'react';

interface FileState {
  displayedLines: string[];
  currentLineIndex: number;
  currentCharIndex: number;
}

export default function LiveCodeSection() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentCodeBlock, setCurrentCodeBlock] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isChangingFile, setIsChangingFile] = useState(false);
  
  const maxLines = 12; // Статичное количество строк
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const fileStatesRef = useRef<FileState[]>([]);

  const codeBlocks = [
    [
      "const developer = {",
      "  name: 'Gosloto',",
      "  skills: ['React', 'TypeScript', 'Node.js'],",
      "  passion: 'Creating amazing web experiences',",
      "  motto: 'Code with purpose, design with heart'",
      "};",
      "",
      "// Let's build something incredible together!",
      "const project = await developer.createProject({",
      "  requirements: 'your-ideas',",
      "  timeline: 'flexible',",
      "  quality: 'premium'",
      "});"
    ],
    [
      "// React Component Example",
      "const ProjectCard = ({ title, description, tech }) => {",
      "  const [isHovered, setIsHovered] = useState(false);",
      "",
      "  return (",
      "    <div className={`card ${isHovered ? 'hovered' : ''}`}>",
      "      <h3>{title}</h3>",
      "      <p>{description}</p>",
      "      <div className=\"tech-stack\">",
      "        {tech.map(t => <span key={t}>{t}</span>)}",
      "      </div>",
      "    </div>",
      "  );",
      "};"
    ],
    [
      "// API Endpoint Example",
      "app.post('/api/projects', async (req, res) => {",
      "  try {",
      "    const { name, description, budget } = req.body;",
      "",
      "    const project = await Project.create({",
      "      name,",
      "      description,",
      "      budget,",
      "      status: 'pending'",
      "    });",
      "",
      "    res.status(201).json({",
      "      success: true,",
      "      project",
      "    });",
      "  } catch (error) {",
      "    res.status(500).json({ error: error.message });",
      "  }",
      "});"
    ],
    [
      "// CSS Animation Example",
      "@keyframes fadeInUp {",
      "  from {",
      "    opacity: 0;",
      "    transform: translateY(30px);",
      "  }",
      "  to {",
      "    opacity: 1;",
      "    transform: translateY(0);",
      "  }",
      "}",
      "",
      ".animated-element {",
      "  animation: fadeInUp 0.6s ease-out;",
      "  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);",
      "}"
    ]
  ];

  // Инициализируем состояния файлов
  useEffect(() => {
    fileStatesRef.current = codeBlocks.map(() => ({
      displayedLines: [],
      currentLineIndex: 0,
      currentCharIndex: 0
    }));
  }, []);

  useEffect(() => {
    const typeCode = async () => {
      const currentLines = codeBlocks[currentCodeBlock];
      const currentFileState = fileStatesRef.current[currentCodeBlock];
      
      // Восстанавливаем состояние файла
      setDisplayedLines(currentFileState.displayedLines);
      setCurrentLineIndex(currentFileState.currentLineIndex);
      setCurrentCharIndex(currentFileState.currentCharIndex);
      
      // Продолжаем печать с того места, где остановились
      for (let lineIndex = currentFileState.currentLineIndex; lineIndex < currentLines.length; lineIndex++) {
        const line = currentLines[lineIndex];
        
        // Печатаем только одну строку за раз
        for (let charIndex = currentFileState.currentCharIndex; charIndex <= line.length; charIndex++) {
          const currentLine = line.slice(0, charIndex);
          
          setDisplayedLines(prev => {
            const newLines = [...prev];
            
            // Обновляем только текущую строку
            if (lineIndex < newLines.length) {
              newLines[lineIndex] = currentLine;
            } else {
              newLines.push(currentLine);
            }
            
            // Если строк больше максимума, убираем первую
            if (newLines.length > maxLines) {
              return newLines.slice(1);
            }
            
            return newLines;
          });
          
          // Добавляем небольшую задержку между словами
          const char = line[charIndex - 1];
          const delay = char === ' ' ? 100 : 30;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Сброс charIndex для следующей строки
        currentFileState.currentCharIndex = 0;
        
        // Обновляем состояние файла после завершения строки
        setDisplayedLines(prev => {
          const newLines = [...prev];
          
          // Сохраняем обновленное состояние
          currentFileState.displayedLines = [...newLines];
          currentFileState.currentLineIndex = lineIndex + 1;
          
          return newLines;
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Пауза перед следующим блоком
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Анимация смены файла
      setIsChangingFile(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Переходим к следующему блоку
      setCurrentCodeBlock((prev) => (prev + 1) % codeBlocks.length);
      setIsChangingFile(false);
    };

    const interval = setInterval(typeCode, 8000);
    typeCode(); // Запускаем сразу

    return () => clearInterval(interval);
  }, [currentCodeBlock]);

  const getFileName = () => {
    const files = ['developer.js', 'component.tsx', 'api.js', 'styles.css'];
    return files[currentCodeBlock];
  };

  const getFileIcon = () => {
    const icons = ['📄', '⚛️', '🔧', '🎨'];
    return icons[currentCodeBlock];
  };

  const getCurrentLineNumber = (index: number) => {
    // Вычисляем номер строки с учетом прокрутки
    const startLine = Math.max(1, displayedLines.length - maxLines + 1);
    return startLine + index;
  };

  return (
    <section className="live-code-section">
      <div className={`live-code-container ${isChangingFile ? 'changing-file' : ''}`}>
        <div className="code-header">
          <div className="code-dots">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <span className={`code-title ${isChangingFile ? 'changing' : ''}`}>
            {getFileIcon()} {getFileName()}
          </span>
        </div>
        
        <div className="code-content" ref={codeContainerRef}>
          <pre className="code-text">
            {displayedLines.map((line, index) => (
              <div key={index} className="code-line">
                <span className="line-number">{String(getCurrentLineNumber(index)).padStart(2, ' ')}</span>
                <code>{line}</code>
                {index === displayedLines.length - 1 && <span className="cursor">|</span>}
              </div>
            ))}
            {displayedLines.length === 0 && (
              <div className="code-line">
                <span className="line-number"> 1</span>
                <code></code>
                <span className="cursor">|</span>
              </div>
            )}
          </pre>
        </div>
      </div>
    </section>
  );
}
