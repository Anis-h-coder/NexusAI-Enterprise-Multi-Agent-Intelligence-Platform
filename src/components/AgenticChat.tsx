import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Code,
  Layers,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChatMessage, AgentRole } from '../types';

export const AgenticChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      agentRole: 'Planner',
      text: "Hi there! I'm your NexusAI Multi-Agent Co-Pilot. You can ask me anything about your datasets, run AutoML benchmarks, query documents via vector search, or generate SQL queries and production TypeScript code. What would you like to explore today?",
      timestamp: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgentRole, setSelectedAgentRole] = useState<AgentRole>('Planner');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentInput }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentRole: selectedAgentRole,
        text: data.answer || 'Query processed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Summarize Q3 enterprise revenue forecast and key findings',
    'What are the top features influencing customer churn risk?',
    'Write a TypeScript microservice for XGBoost model inference',
    'Generate SQL query for top 5 customers by MRR',
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Agentic RAG Co-Pilot & Workspace</h1>
            <p className="text-xs text-slate-500">
              Interactive multi-agent conversation backed by Gemini 3.6 Flash & ChromaDB vector store
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Primary Agent:</span>
          <select
            value={selectedAgentRole}
            onChange={(e) => setSelectedAgentRole(e.target.value as AgentRole)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="Planner">Planner Agent</option>
            <option value="Research">Research Agent</option>
            <option value="Data Analyst">Data Analyst Agent</option>
            <option value="ML Engineer">ML Engineer Agent</option>
            <option value="Software Engineer">Software Engineer Agent</option>
          </select>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(p)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors border border-slate-200/60 cursor-pointer"
          >
            💡 {p}
          </button>
        ))}
      </div>

      {/* Message Stream Box */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm min-h-[420px] max-h-[540px] overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 space-y-2 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-white font-medium'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold opacity-80 border-b border-black/10 pb-1.5">
                <span>{msg.sender === 'user' ? 'You' : `${msg.agentRole || 'NexusAI'} Agent`}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="text-xs leading-relaxed prose prose-xs max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Vector Context Citations
                  </span>
                  {msg.citations.map((c, i) => (
                    <div key={i} className="bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                      <span className="font-bold text-emerald-700">{c.documentName}</span> (Match: {c.score})
                      <p className="text-slate-600 italic mt-0.5">"{c.content}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center space-x-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Agents synthesizing response with Gemini 3.6 Flash...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask NexusAI Co-Pilot anything..."
          className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

