'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface FileState {
  displayedLines: string[];
  currentLineIndex: number;
  currentCharIndex: number;
  completed: boolean;
}

interface CodeFile {
  name: string;
  icon: string;
  language: string;
  content: string[];
  dependencies?: string[]; // Связи с другими файлами
}

export default function LiveCodeSection() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isChangingFile, setIsChangingFile] = useState(false);
  const [completedFiles, setCompletedFiles] = useState<Set<number>>(new Set());
  
  const maxLines = 15;
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const fileStatesRef = useRef<FileState[]>([]);
  const typingIntervalRef = useRef<NodeJS.Timeout>();

  // Расширенная система файлов с зависимостями
  const codeFiles: CodeFile[] = [
    {
      name: 'developer.js',
      icon: '👨‍💻',
      language: 'javascript',
      content: [
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
      ]
    },
    {
      name: 'ProjectCard.tsx',
      icon: '⚛️',
      language: 'typescript',
      content: [
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
      dependencies: ['types.ts']
    },
    {
      name: 'types.ts',
      icon: '📘',
      language: 'typescript',
      content: [
        "// TypeScript Interface",
        "interface User {",
        "  id: string;",
        "  name: string;",
        "  email: string;",
        "  avatar?: string;",
        "  createdAt: Date;",
        "  updatedAt: Date;",
        "}",
        "",
        "interface Project extends User {",
        "  title: string;",
        "  description: string;",
        "  technologies: string[];",
        "  status: 'active' | 'completed' | 'pending';",
        "}"
      ]
    },
    {
      name: 'api.js',
      icon: '🔧',
      language: 'javascript',
      content: [
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
      dependencies: ['schema.js']
    },
    {
      name: 'schema.js',
      icon: '🗄️',
      language: 'javascript',
      content: [
        "// Database Schema",
        "const mongoose = require('mongoose');",
        "",
        "const projectSchema = new mongoose.Schema({",
        "  title: { type: String, required: true },",
        "  description: { type: String, required: true },",
        "  technologies: [{ type: String }],",
        "  status: {",
        "    type: String,",
        "    enum: ['active', 'completed', 'pending'],",
        "    default: 'pending'",
        "  },",
        "  createdAt: { type: Date, default: Date.now },",
        "  updatedAt: { type: Date, default: Date.now }",
        "});",
        "",
        "module.exports = mongoose.model('Project', projectSchema);"
      ]
    },
    {
      name: 'styles.css',
      icon: '🎨',
      language: 'css',
      content: [
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
    },
    {
      name: 'hook.ts',
      icon: '🪝',
      language: 'typescript',
      content: [
        "// Custom Hook",
        "import { useState, useEffect } from 'react';",
        "",
        "export const useLocalStorage = (key: string, initialValue: any) => {",
        "  const [storedValue, setStoredValue] = useState(() => {",
        "    try {",
        "      const item = window.localStorage.getItem(key);",
        "      return item ? JSON.parse(item) : initialValue;",
        "    } catch (error) {",
        "      return initialValue;",
        "    }",
        "  });",
        "",
        "  const setValue = (value: any) => {",
        "    try {",
        "      setStoredValue(value);",
        "      window.localStorage.setItem(key, JSON.stringify(value));",
        "    } catch (error) {",
        "      console.error(error);",
        "    }",
        "  };",
        "",
        "  return [storedValue, setValue];",
        "};"
      ]
    },
    {
      name: 'tailwind.config.js',
      icon: '🎨',
      language: 'javascript',
      content: [
        "// Tailwind CSS Configuration",
        "module.exports = {",
        "  content: [",
        "    './pages/**/*.{js,ts,jsx,tsx}',",
        "    './components/**/*.{js,ts,jsx,tsx}',",
        "  ],",
        "  theme: {",
        "    extend: {",
        "      colors: {",
        "        primary: '#ff6b35',",
        "        secondary: '#4ecdc4',",
        "        accent: '#45b7d1'",
        "      },",
        "      fontFamily: {",
        "        sans: ['Inter', 'sans-serif'],",
        "        mono: ['Fira Code', 'monospace']",
        "      }",
        "    },",
        "  },",
        "  plugins: [],",
        "}"
      ]
    },
    {
      name: 'Dockerfile',
      icon: '🐳',
      language: 'dockerfile',
      content: [
        "// Docker Configuration",
        "FROM node:18-alpine",
        "",
        "WORKDIR /app",
        "",
        "COPY package*.json ./",
        "RUN npm ci --only=production",
        "",
        "COPY . .",
        "RUN npm run build",
        "",
        "EXPOSE 3000",
        "",
        "CMD [\"npm\", \"start\"]"
      ]
    },
    {
      name: 'package.json',
      icon: '📦',
      language: 'json',
      content: [
        "// Package.json Scripts",
        "{",
        "  \"scripts\": {",
        "    \"dev\": \"next dev\",",
        "    \"build\": \"next build\",",
        "    \"start\": \"next start\",",
        "    \"lint\": \"next lint\",",
        "    \"test\": \"jest\",",
        "    \"test:watch\": \"jest --watch\",",
        "    \"test:coverage\": \"jest --coverage\",",
        "    \"type-check\": \"tsc --noEmit\",",
        "    \"format\": \"prettier --write .\",",
        "    \"format:check\": \"prettier --check .\"",
        "  }",
        "}"
      ]
    }
  ];

  // Инициализация состояний файлов
  useEffect(() => {
    fileStatesRef.current = codeFiles.map(() => ({
      displayedLines: [],
      currentLineIndex: 0,
      currentCharIndex: 0,
      completed: false
    }));
  }, []);

  // Умный выбор следующего файла с учетом зависимостей
  const getNextFileIndex = useCallback((currentIndex: number): number => {
    const availableFiles = codeFiles
      .map((_, index) => index)
      .filter(index => !completedFiles.has(index));
    
    if (availableFiles.length === 0) {
      // Все файлы завершены, начинаем заново
      setCompletedFiles(new Set());
      return 0;
    }

    // Пытаемся найти файл, от которого зависят другие
    for (let i = 0; i < codeFiles.length; i++) {
      const nextIndex = (currentIndex + i + 1) % codeFiles.length;
      if (!completedFiles.has(nextIndex)) {
        const file = codeFiles[nextIndex];
        
        // Проверяем зависимости
        if (file.dependencies) {
          const depsCompleted = file.dependencies.every(depName => {
            const depIndex = codeFiles.findIndex(f => f.name === depName);
            return completedFiles.has(depIndex);
          });
          
          if (depsCompleted || !depsCompleted && Math.random() > 0.7) {
            return nextIndex;
          }
        } else {
          return nextIndex;
        }
      }
    }
    
    return availableFiles[0];
  }, [completedFiles]);

  const typeCode = useCallback(async () => {
    if (isTyping) return;
    
    setIsTyping(true);
    const currentFile = codeFiles[currentFileIndex];
    const currentFileState = fileStatesRef.current[currentFileIndex];
    
    // Восстанавливаем состояние файла
    setDisplayedLines([...currentFileState.displayedLines]);
    setCurrentLineIndex(currentFileState.currentLineIndex);
    setCurrentCharIndex(currentFileState.currentCharIndex);
    
    const currentLines = currentFile.content;
    
    // Продолжаем печать с того места, где остановились
    for (let lineIndex = currentFileState.currentLineIndex; lineIndex < currentLines.length; lineIndex++) {
      const line = currentLines[lineIndex];
      const isLastLine = lineIndex === currentLines.length - 1;
      
      for (let charIndex = currentFileState.currentCharIndex; charIndex <= line.length; charIndex++) {
        const currentLine = line.slice(0, charIndex);
        
        setDisplayedLines(prev => {
          const newLines = [...prev];
          
          if (lineIndex < newLines.length) {
            newLines[lineIndex] = currentLine;
          } else {
            newLines.push(currentLine);
          }
          
          // Прокрутка к последней строке
          if (codeContainerRef.current) {
            setTimeout(() => {
              codeContainerRef.current?.scrollTo({
                top: codeContainerRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }, 0);
          }
          
          // Сохраняем состояние
          currentFileState.displayedLines = [...newLines];
          currentFileState.currentLineIndex = lineIndex;
          currentFileState.currentCharIndex = charIndex;
          
          return newLines.length > maxLines ? newLines.slice(-maxLines) : newLines;
        });
        
        // Динамическая задержка для более естественного набора
        const char = line[charIndex - 1];
        let delay = 30;
        
        if (char === ' ') delay = 50;
        if (char === '.' || char === ',' || char === ';') delay = 100;
        if (char === '\n' || char === undefined) delay = 150;
        if (line.startsWith('//') && charIndex === 2) delay = 200; // Пауза после комментария
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Сброс charIndex для следующей строки
      currentFileState.currentCharIndex = 0;
      
      // Пауза между строками
      await new Promise(resolve => setTimeout(resolve, line.length > 50 ? 100 : 50));
    }
    
     // Помечаем файл как завершенный
     currentFileState.completed = true;
     setCompletedFiles(prev => new Set(Array.from(prev).concat(currentFileIndex)));
    
    // Пауза перед сменой файла
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Анимация смены файла
    setIsChangingFile(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Переход к следующему файлу
    const nextFileIndex = getNextFileIndex(currentFileIndex);
    setCurrentFileIndex(nextFileIndex);
    
    // Сброс состояния для нового файла
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    
    setIsChangingFile(false);
    setIsTyping(false);
  }, [currentFileIndex, isTyping, getNextFileIndex]);

  // Автоматическое переключение файлов
  useEffect(() => {
    const startTyping = () => {
      if (!isTyping) {
        typeCode();
      }
    };

    // Запускаем сразу и затем по интервалу
    startTyping();
    typingIntervalRef.current = setInterval(startTyping, 8000);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [typeCode, isTyping]);

  const getCurrentLineNumber = (index: number) => {
    const totalLines = fileStatesRef.current[currentFileIndex]?.displayedLines.length || 0;
    const startLine = Math.max(1, totalLines - displayedLines.length + 1);
    return startLine + index;
  };

  const getLanguageClass = () => {
    return `language-${codeFiles[currentFileIndex]?.language || 'javascript'}`;
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
          <div className="file-info">
            <span className={`code-title ${isChangingFile ? 'changing' : ''}`}>
              {codeFiles[currentFileIndex]?.icon} {codeFiles[currentFileIndex]?.name}
            </span>
            <span className="file-progress">
              {completedFiles.size}/{codeFiles.length} files completed
            </span>
          </div>
        </div>
        
        <div className="code-content" ref={codeContainerRef}>
          <pre className={`code-text ${getLanguageClass()}`}>
            {displayedLines.map((line, index) => (
              <div key={index} className="code-line">
                <span className="line-number">
                  {String(getCurrentLineNumber(index)).padStart(3, ' ')}
                </span>
                <code className={getLanguageClass()}>{line}</code>
                {index === displayedLines.length - 1 && (
                  <span className="cursor">|</span>
                )}
              </div>
            ))}
            {displayedLines.length === 0 && (
              <div className="code-line">
                <span className="line-number">  1</span>
                <code></code>
                <span className="cursor">|</span>
              </div>
            )}
          </pre>
        </div>

        <div className="code-footer">
          <div className="dependencies">
            {codeFiles[currentFileIndex]?.dependencies?.map(dep => (
              <span key={dep} className="dependency-tag">📁 {dep}</span>
            ))}
          </div>
          <div className="typing-status">
            {isTyping ? '🔄 Typing...' : '⏸️ Paused'}
          </div>
        </div>
      </div>
    </section>
  );
}