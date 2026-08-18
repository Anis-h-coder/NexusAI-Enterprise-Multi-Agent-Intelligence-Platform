import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Search,
  BarChart3,
  Cpu,
  Code2,
  FileText,
  Target,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface StepOutputRendererProps {
  content: string;
  theme?: 'light' | 'dark';
}

interface StepItem {
  number: number;
  roleTitle: string;
  avatar: string;
  colorClass: string;
  darkColorClass: string;
  text: string;
}

const getRoleDetails = (rawText: string, index: number) => {
  const lower = rawText.toLowerCase();

  if (lower.includes('browser') || lower.includes('playwright') || lower.includes('navigate') || lower.includes('crawl')) {
    return {
      title: 'Autonomous Browser Agent',
      avatar: '🌐',
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      darkColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    };
  }
  if (lower.includes('research') || lower.includes('gather') || lower.includes('citation')) {
    return {
      title: 'Research Team',
      avatar: '🔍',
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      darkColorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    };
  }
  if (lower.includes('analyst') || lower.includes('data') || lower.includes('churn dataset') || lower.includes('patterns')) {
    return {
      title: 'Data Analyst Team',
      avatar: '📊',
      colorClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      darkColorClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
    };
  }
  if (lower.includes('mle') || lower.includes('ml engineer') || lower.includes('ml agent') || lower.includes('xgboost') || lower.includes('model') || lower.includes('shap')) {
    return {
      title: 'ML Agent Team',
      avatar: '🤖',
      colorClass: 'bg-blue-50 text-blue-800 border-blue-200',
      darkColorClass: 'bg-blue-950/80 text-blue-300 border-blue-800',
    };
  }
  if (lower.includes('dev') || lower.includes('development') || lower.includes('software agent') || lower.includes('software engineer') || lower.includes('express') || lower.includes('router') || lower.includes('typescript') || lower.includes('api')) {
    return {
      title: 'Software Agent Team',
      avatar: '💻',
      colorClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      darkColorClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
    };
  }
  if (lower.includes('doc') || lower.includes('documentation') || lower.includes('guide') || lower.includes('specs')) {
    return {
      title: 'Documentation Team',
      avatar: '📚',
      colorClass: 'bg-purple-50 text-purple-800 border-purple-200',
      darkColorClass: 'bg-purple-950/80 text-purple-300 border-purple-800',
    };
  }

  const defaultAvatars = ['🎯', '🔍', '📊', '🤖', '💻', '📚'];
  const defaultTitles = ['Strategy Setup', 'Knowledge Retrieval', 'Data Analysis', 'Model Benchmark', 'API Service', 'Documentation'];
  return {
    title: defaultTitles[index % defaultTitles.length],
    avatar: defaultAvatars[index % defaultAvatars.length],
    colorClass: 'bg-slate-100 text-slate-800 border-slate-200',
    darkColorClass: 'bg-slate-800 text-slate-200 border-slate-700',
  };
};

export const StepOutputRenderer: React.FC<StepOutputRendererProps> = ({ content, theme = 'light' }) => {
  if (!content) return null;

  // Check if content contains arrows like " -> " or is formatted with sequential arrow tokens
  const hasArrowSequence = content.includes(' -> ') || content.includes('\n-> ');

  if (hasArrowSequence) {
    // Split by arrows
    const rawParts = content
      .split(/\s*->\s*/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (rawParts.length > 1) {
      const items: StepItem[] = rawParts.map((part, idx) => {
        const cleanText = part.replace(/^Workflow structured:\s*/i, '').replace(/^[0-9]+[.)]\s*/, '').trim();
        const roleInfo = getRoleDetails(cleanText, idx);
        return {
          number: idx + 1,
          roleTitle: roleInfo.title,
          avatar: roleInfo.avatar,
          colorClass: roleInfo.colorClass,
          darkColorClass: roleInfo.darkColorClass,
          text: cleanText,
        };
      });

      return (
        <div className="space-y-2.5 my-1">
          <div className="flex items-center space-x-1.5 pb-1 text-[11px] font-bold tracking-wide uppercase">
            <span className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}>
              Structured Collaborative Pipeline ({items.length} Stages)
            </span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const isDark = theme === 'dark';
              return (
                <div key={idx} className="relative">
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700'
                        : 'bg-white border-slate-200/90 text-slate-800 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${
                          isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 font-bold'
                        }`}
                      >
                        {item.number}
                      </span>

                      <span
                        className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isDark ? item.darkColorClass : item.colorClass
                        }`}
                      >
                        <span>{item.avatar}</span>
                        <span>{item.roleTitle}</span>
                      </span>
                    </div>

                    <p
                      className={`text-xs leading-relaxed pl-7 ${
                        isDark ? 'text-slate-300' : 'text-slate-700 font-normal'
                      }`}
                    >
                      {item.text}
                    </p>
                  </div>

                  {idx < items.length - 1 && (
                    <div className="flex justify-center -my-1 py-0.5 relative z-10">
                      <div
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center space-x-1 ${
                          isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  }

  // Standard Markdown rendering with high-quality visual components
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-2 text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className={`text-sm font-bold mt-2 mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-xs font-bold mt-2 mb-1 uppercase tracking-wide ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xs font-bold mt-2 mb-1 ${isDark ? 'text-teal-300' : 'text-slate-900'}`}>{children}</h3>
          ),
          p: ({ children }) => (
            <p className={`leading-relaxed mb-2 last:mb-0 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{children}</p>
          ),
          ol: ({ children }) => (
            <div className="space-y-2 my-2">{children}</div>
          ),
          ul: ({ children }) => (
            <div className="space-y-1.5 my-2">{children}</div>
          ),
          li: ({ children, ...props }) => {
            return (
              <div
                className={`p-2.5 rounded-xl border flex items-start space-x-2.5 ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50/80 border-slate-200/80 text-slate-700'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1 leading-relaxed text-xs">{children}</div>
              </div>
            );
          },
          strong: ({ children }) => (
            <strong className={`font-bold ${isDark ? 'text-emerald-300' : 'text-slate-900'}`}>{children}</strong>
          ),
          code: ({ children }) => (
            <code
              className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
                isDark ? 'bg-slate-800 text-emerald-300 border border-slate-700' : 'bg-slate-100 text-emerald-800 border border-slate-200'
              }`}
            >
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
