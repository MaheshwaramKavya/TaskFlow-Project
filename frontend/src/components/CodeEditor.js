import React, { useState, useRef, useEffect } from 'react';
import * as api from '../api';

export default function CodeEditor({ task, onCodeChange }) {
  const [code, setCode] = useState(task?.code || '');
  const [language, setLanguage] = useState(task?.code_language || 'javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const textareaRef = useRef(null);

  useEffect(() => {
    setCode(task?.code || '');
    setLanguage(task?.code_language || 'javascript');
  }, [task]);

  const handleCodeChange = (value) => {
    setCode(value);
    onCodeChange?.(value, language);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    onCodeChange?.(code, newLanguage);
  };

  const runCode = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    setOutput('Running code...');

    try {
      const response = await api.executeCode({ code, language });
      if (response.data.success) {
        setOutput(response.data.output || 'Code executed successfully (no output)');
      } else {
        setOutput(`Error: ${response.data.error}`);
      }
    } catch (error) {
      setOutput(`Execution failed: ${error.response?.data?.message || error.message}`);
    }

    setIsRunning(false);
    setActiveTab('output');
  };

  const clearOutput = () => {
    setOutput('');
  };

  const insertTemplate = (template) => {
    const templates = {
      javascript: {
        'Hello World': 'console.log("Hello, World!");',
        'Function': 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("TaskFlow"));',
        'Array Operations': 'const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log("Original:", numbers);\nconsole.log("Doubled:", doubled);',
        'Object Manipulation': 'const user = {\n  name: "John",\n  age: 30,\n  tasks: ["code", "test", "deploy"]\n};\n\nconsole.log("User:", user);\nconsole.log("Task count:", user.tasks.length);'
      }
    };

    if (templates[language] && templates[language][template]) {
      handleCodeChange(templates[language][template]);
    }
  };

  return (
    <div className="code-workspace">
      <div className="code-header">
        <h3 style={{ margin: '0 0 12px 0', color: '#f6fbff', fontSize: 16, fontWeight: 900 }}>
          💻 Live Coding Workspace
        </h3>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid rgba(106, 92, 255, 0.24)',
              background: 'rgba(10, 9, 30, 0.88)',
              color: '#f6fbff',
              fontSize: 12
            }}
          >
            <option value="javascript">JavaScript</option>
          </select>

          <select
            onChange={(e) => e.target.value && insertTemplate(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid rgba(106, 92, 255, 0.24)',
              background: 'rgba(10, 9, 30, 0.88)',
              color: '#a9b0d4',
              fontSize: 12
            }}
            defaultValue=""
          >
            <option value="" disabled>Insert Template</option>
            <option value="Hello World">Hello World</option>
            <option value="Function">Function</option>
            <option value="Array Operations">Array Operations</option>
            <option value="Object Manipulation">Object Manipulation</option>
          </select>

          <button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: isRunning ? '#ff7a1a' : '#42f59b',
              color: '#0f1127',
              fontSize: 12,
              fontWeight: 800,
              cursor: isRunning || !code.trim() ? 'not-allowed' : 'pointer',
              opacity: isRunning || !code.trim() ? 0.6 : 1
            }}
          >
            {isRunning ? '▶️ Running...' : '▶️ Run Code'}
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(106, 92, 255, 0.24)' }}>
          {['editor', 'output'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: activeTab === tab ? 'rgba(106, 92, 255, 0.2)' : 'transparent',
                color: activeTab === tab ? '#69e6ff' : '#a9b0d4',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #69e6ff' : 'none'
              }}
            >
              {tab === 'editor' ? '📝 Code Editor' : '📤 Output'}
            </button>
          ))}
        </div>
      </div>

      <div className="code-content">
        {activeTab === 'editor' ? (
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={`Write your ${language} code here...\n\nExample: console.log("Hello from TaskFlow!");`}
              style={{
                width: '100%',
                height: 300,
                padding: 16,
                border: 'none',
                borderRadius: 8,
                background: 'rgba(10, 9, 30, 0.88)',
                color: '#f6fbff',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: 14,
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
                tabSize: 2
              }}
            />
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: 11,
              color: '#a9b0d4',
              background: 'rgba(0,0,0,0.5)',
              padding: '2px 6px',
              borderRadius: 4
            }}>
              {language.toUpperCase()}
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '100%',
                minHeight: 300,
                padding: 16,
                borderRadius: 8,
                background: 'rgba(10, 9, 30, 0.88)',
                color: output.includes('Error') || output.includes('failed') ? '#ff5f87' : '#42f59b',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                border: '1px solid rgba(106, 92, 255, 0.24)'
              }}
            >
              {output || 'No output yet. Write some code and click "Run Code" to see results here.'}
            </div>
            {output && (
              <button
                onClick={clearOutput}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: 'none',
                  background: 'rgba(255, 95, 135, 0.2)',
                  color: '#ff5f87',
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}