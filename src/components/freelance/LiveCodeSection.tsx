import React, { useCallback, useEffect, useRef, useState } from 'react';

// Improved LiveCodeSection: more natural per-character typing, jittered delays,
// optional small "typo + backspace" simulation, cleaner file switching,
// reliable cancellation/cleanup, and a blinking cursor.

type CodeFile = {
  name: string;
  icon?: string;
  language?: string;
  content: string[];
  dependencies?: string[];
};

export default function LiveCodeSection() {
  // --- CONFIG ---
  const maxLines = 15;
  const baseDelay = 24; // base ms per character
  const jitter = 40; // random jitter added/subtracted from base
  const punctuationDelay = 140;
  const spaceDelay = 50;
  const linePauseShort = 40;
  const linePauseLong = 120;
  const filePause = 1400;
  const typoChance = 0.18; // chance to simulate a small typo
  const typoMaxDelete = 5; // max chars to delete on typo

  // --- FILES ---
  const codeFiles: CodeFile[] = [
    // JavaScript
    { name: 'developer.js', icon: '', language: 'javascript', content: [
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
    ]},

    // TypeScript React component
    { name: 'ProjectCard.tsx', icon: '', language: 'typescript', content: [
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
    ], dependencies: ['types.ts'] },

    // TypeScript types
    { name: 'types.ts', icon: '', language: 'typescript', content: [
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
      "}",
    ]},

    // Python
    { name: 'app.py', icon: '', language: 'python', content: [
      "# Simple FastAPI example",
      "from fastapi import FastAPI",
      "",
      "app = FastAPI(title=\"Gosloto Freelance API\")",
      "",
      "@app.get(\"/health\")",
      "async def health_check():",
      "    return {\"status\": \"ok\", \"service\": \"freelance-portfolio\"}",
      "",
      "@app.get(\"/projects\")",
      "async def list_projects(limit: int = 5):",
      "    return [{\"id\": i, \"title\": f\"Project #{i}\"} for i in range(1, limit + 1)]",
    ]},

    // Rust
    { name: 'backend.rs', icon: '', language: 'rust', content: [
      "// Tiny Axum example in Rust",
      "use axum::{routing::get, Router};",
      "",
      "async fn health() -> &'static str {",
      "    \"OK from Rust backend\"",
      "}",
      "",
      "pub fn app() -> Router {",
      "    Router::new().route(\"/health\", get(health))",
      "}",
    ]},

    // CSS
    { name: 'layout.css', icon: '', language: 'css', content: [
      "/* Minimal layout snippet */",
      ":root {",
      "  --accent: #00ff88;",
      "}",
      "",
      ".hero-gradient {",
      "  background: radial-gradient(circle at 0 0, var(--accent), transparent 60%);",
      "  border: 3px solid #000;",
      "}",
    ]},

    // Docker
    { name: 'docker-compose.yml', icon: '', language: 'dockerfile', content: [
      "# Dev stack for portfolio",
      "version: '3.9'",
      "services:",
      "  web:",
      "    image: node:20-alpine",
      "    working_dir: /app",
      "    volumes:",
      "      - ./:/app",
      "    command: [\"npm\", \"run\", \"dev\"]",
    ]},

    // JSON
    { name: 'config.json', icon: '', language: 'json', content: [
      "{",
      "  \"portfolioOwner\": \"Gosloto\",",
      "  \"availableForHire\": true,",
      "  \"primaryStack\": [\"Next.js\", \"TypeScript\", \"Rust\"],",
      "  \"responseTimeMinutes\": 5",
      "}",
    ]},
  ];

  // If you want to include all original files, paste them into the array above.

  // --- STATE ---
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [completedFiles, setCompletedFiles] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mutable refs for cancellable typing
  const runningRef = useRef(false);
  const abortRef = useRef(false);

  // helper: sleep
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Randomized delay to make typing less robotic
  const charDelay = (char?: string) => {
    if (!char) return baseDelay + Math.floor(Math.random() * jitter);
    if (char === ' ') return spaceDelay + Math.random() * jitter;
    if (/[.,;:!?]/.test(char)) return punctuationDelay + Math.random() * jitter;
    return baseDelay + Math.floor(Math.random() * jitter);
  };

  // Ensure next file respects dependencies: basic topological-ish pick + randomness
  const getNextFileIndex = useCallback((fromIndex: number) => {
    const total = codeFiles.length;
    const available = [] as number[];
    for (let i = 0; i < total; i++) {
      if (!completedFiles.has(i)) available.push(i);
    }

    if (available.length === 0) {
      // reset cycle
      setCompletedFiles(new Set());
      return 0;
    }

    // Prefer next index in list but allow jumping to dependencies that are satisfied
    for (let offset = 1; offset <= total; offset++) {
      const idx = (fromIndex + offset) % total;
      if (completedFiles.has(idx)) continue;
      const file = codeFiles[idx];
      if (!file.dependencies || file.dependencies.length === 0) return idx;

      const depsSatisfied = file.dependencies.every(dep => {
        const dIndex = codeFiles.findIndex(f => f.name === dep);
        return dIndex >= 0 ? completedFiles.has(dIndex) : true;
      });

      if (depsSatisfied) return idx;
    }

    return available[0];
  }, [codeFiles, completedFiles]);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    if (!containerRef.current) return;
    try {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      // some browsers may not support smooth in this context
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Core typing routine with cancellation support
  const typeFile = useCallback(async (fileIndex: number) => {
    if (runningRef.current) return;
    runningRef.current = true;
    abortRef.current = false;
    setIsTyping(true);

    const file = codeFiles[fileIndex];
    const lines = file.content;

    // start from blank for this file (could be extended to resume state)
    setDisplayedLines([]);

    outer: for (let li = 0; li < lines.length; li++) {
      if (abortRef.current) break;
      const line = lines[li];
      // build each char
      let buffer = '';

      for (let ci = 0; ci <= line.length; ci++) {
        if (abortRef.current) break outer;

        // current visible substring
        buffer = line.slice(0, ci);

        setDisplayedLines(prev => {
          const copy = [...prev];
          if (ci === 0) {
            // ensure an empty line exists
            if (li < copy.length) copy[li] = '';
            else copy.push('');
          } else if (li < copy.length) {
            copy[li] = buffer;
          } else {
            copy.push(buffer);
          }

          // enforce max lines
          return copy.length > maxLines ? copy.slice(-maxLines) : copy;
        });

        // scroll
        scrollToBottom();

        // Occasionally simulate a small typo and backspace (makes it feel live)
        if (ci > 3 && Math.random() < typoChance && ci < line.length) {
          // type a couple more chars, then delete some
          const extra = Math.min(3, line.length - ci);
          for (let e = 0; e < extra; e++) {
            if (abortRef.current) break outer;
            await sleep(charDelay(line[ci + e] || undefined));
            ci++;
            buffer = line.slice(0, ci);
            setDisplayedLines(prev => {
              const copy = [...prev];
              copy[li] = buffer;
              return copy.length > maxLines ? copy.slice(-maxLines) : copy;
            });
          }

          // small pause, then delete a few chars
          await sleep(80 + Math.random() * 120);
          const toDelete = 1 + Math.floor(Math.random() * Math.min(typoMaxDelete, ci));
          for (let d = 0; d < toDelete; d++) {
            if (abortRef.current) break outer;
            ci--;
            buffer = line.slice(0, ci);
            setDisplayedLines(prev => {
              const copy = [...prev];
              copy[li] = buffer;
              return copy.length > maxLines ? copy.slice(-maxLines) : copy;
            });
            await sleep(25 + Math.random() * 30);
          }

          // continue typing normally (no extra delay here, next loop will apply it)
          continue;
        }

        // delay
        const ch = line[ci - 1];
        const delay = charDelay(ch);
        await sleep(delay);
      }

      // after finishing a line, small pause
      const pause = line.length > 60 ? linePauseLong : linePauseShort;
      await sleep(pause + Math.random() * 40);
    }

    // mark complete
    setCompletedFiles(prev => new Set(prev).add(fileIndex));
    setIsTyping(false);

    // small pause before changing file
    await sleep(filePause);
    if (abortRef.current) {
      runningRef.current = false;
      return;
    }

    // choose next
    const next = getNextFileIndex(fileIndex);
    setCurrentFileIndex(next);

    runningRef.current = false;
  }, [charDelay, getNextFileIndex]);

  // Start/stop effect: when currentFileIndex changes, start typing it
  useEffect(() => {
    abortRef.current = false;
    typeFile(currentFileIndex).catch(() => {
      // ignore cancellations
    });

    return () => {
      // cancel running typing when fileIndex changes or component unmounts
      abortRef.current = true;
    };
  }, [currentFileIndex, typeFile]);

  // On mount: start automatic cycling
  useEffect(() => {
    const interval = setInterval(() => {
      // if nothing is typing, trigger next file (safe-guard)
      if (!runningRef.current && !isTyping) {
        setCurrentFileIndex(i => getNextFileIndex(i));
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      abortRef.current = true;
    };
  }, [getNextFileIndex, isTyping]);

  // Helpers for display
  const languageClass = codeFiles[currentFileIndex]?.language ? `language-${codeFiles[currentFileIndex]!.language}` : 'language-javascript';

  return (
    <section className="live-code-section">
      <div className="live-code-container">
        <div className="code-header">
          <div className="dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="file-info">
            <strong>{codeFiles[currentFileIndex]?.icon} {codeFiles[currentFileIndex]?.name}</strong>
            <div className="small">{Array.from(completedFiles).length}/{codeFiles.length} files</div>
          </div>
        </div>

        <div className="code-content" ref={containerRef} style={{ maxHeight: 320, overflow: 'auto' }}>
          <pre className={`code-text ${languageClass}`} style={{ fontFamily: 'Fira Code, monospace', lineHeight: 1.35 }}>
            {displayedLines.length === 0 ? (
              <div className="code-line">
                <span className="ln">  1</span>
                <code />
                <span className={`cursor ${isTyping ? 'alive' : ''}`}>|</span>
              </div>
            ) : (
              displayedLines.map((line, idx) => (
                <div key={idx} className="code-line">
                  <span className="ln">{String(Math.max(1, idx + 1)).padStart(3, ' ')}</span>
                  <code>{line}</code>
                  {idx === displayedLines.length - 1 && <span className={`cursor ${isTyping ? 'alive' : ''}`}>|</span>}
                </div>
              ))
            )}
          </pre>
        </div>

        <div className="code-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <div className="deps">
            {codeFiles[currentFileIndex]?.dependencies?.map(d => (
              <span key={d} style={{ marginRight: 8 }}>📁 {d}</span>
            ))}
          </div>
          <div className="status">{isTyping ? '🔄 Typing...' : '⏸️ Idle'}</div>
        </div>

        <style jsx>{`
          .dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:6px }
          .dot.red { background:#ff5f56 }
          .dot.yellow { background:#ffbd2e }
          .dot.green { background:#27c93f }
          .code-text { padding: 12px; background:#0b1220; color:#e6eef6; border-radius:6px }
          .code-line { display:flex; gap:12px; align-items:flex-start; }
          .ln { min-width:36px; opacity:0.45; color:#9aa7b2 }
          .cursor { margin-left:6px; opacity:0.9 }
          .cursor.alive { animation: blink 1s steps(2, start) infinite }
          @keyframes blink { 50% { opacity: 0 } }
        `}</style>
      </div>
    </section>
  );
}
