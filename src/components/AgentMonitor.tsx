import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Layers,
  Play,
  CheckCircle2,
  Clock,
  Code2,
  Sparkles,
  Terminal,
  Activity,
  FileText,
  MessageSquareQuote,
  Cpu,
  GitFork,
  Brain,
  Bot,
  RotateCw,
  Info,
} from 'lucide-react';
import { AgentState, AgentExecutionStep, AgentRole } from '../types';

interface AgentMonitorProps {
  agents: AgentState[];
  executionSteps: AgentExecutionStep[];
  isExecuting: boolean;
  onRunWorkflow: (prompt: string) => void;
  quickPromptText?: string;
}

export interface DagNodeInfo {
  id: string;
  role: AgentRole;
  title: string;
  description: string;
  model: string;
  tokens: string;
  status: 'running' | 'waiting' | 'pending' | 'completed';
  avatar: string;
}

export const AgentMonitor: React.FC<AgentMonitorProps> = ({
  agents,
  executionSteps,
  isExecuting,
  onRunWorkflow,
  quickPromptText,
}) => {
  const [taskPrompt, setTaskPrompt] = useState(
    quickPromptText ||
      'Analyze customer churn dataset, auto-train XGBoost model with SHAP explainability, and generate Express API router with TypeScript types.'
  );
  const [selectedStep, setSelectedStep] = useState<AgentExecutionStep | null>(
    executionSteps[0] || null
  );

  // Status simulation state when user tests live workflow
  const [simulatedNodeStatuses, setSimulatedNodeStatuses] = useState<Record<string, 'running' | 'waiting' | 'pending' | 'completed'>>({
    planner: 'completed',
    research: 'completed',
    data: 'completed',
    ml: 'completed',
    software: 'completed',
    documentation: 'completed',
  });

  useEffect(() => {
    if (isExecuting) {
      setSimulatedNodeStatuses({
        planner: 'completed',
        research: 'running',
        data: 'running',
        ml: 'waiting',
        software: 'pending',
        documentation: 'pending',
      });

      const timer1 = setTimeout(() => {
        setSimulatedNodeStatuses({
          planner: 'completed',
          research: 'completed',
          data: 'completed',
          ml: 'running',
          software: 'waiting',
          documentation: 'pending',
        });
      }, 1500);

      const timer2 = setTimeout(() => {
        setSimulatedNodeStatuses({
          planner: 'completed',
          research: 'completed',
          data: 'completed',
          ml: 'completed',
          software: 'running',
          documentation: 'waiting',
        });
      }, 3000);

      const timer3 = setTimeout(() => {
        setSimulatedNodeStatuses({
          planner: 'completed',
          research: 'completed',
          data: 'completed',
          ml: 'completed',
          software: 'completed',
          documentation: 'completed',
        });
      }, 4500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isExecuting]);

  useEffect(() => {
    if (executionSteps.length > 0) {
      setSelectedStep(executionSteps[0]);
    }
  }, [executionSteps]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskPrompt.trim() || isExecuting) return;
    onRunWorkflow(taskPrompt);
  };

  // Helper to render live animated status badge
  const renderStatusBadge = (status: 'running' | 'waiting' | 'pending' | 'completed') => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-bold animate-pulse shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>🟢 Running</span>
          </span>
        );
      case 'waiting':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>🟡 Waiting</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span>⚪ Pending</span>
          </span>
        );
      case 'completed':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>🔵 Complete</span>
          </span>
        );
    }
  };

  // Agent model assignment catalog
  const getAgentModel = (role: AgentRole): string => {
    switch (role) {
      case 'Planner':
        return 'Gemini 3.6 Pro';
      case 'ML Engineer':
        return 'Gemini 3.6 Pro';
      case 'Research':
        return 'Gemini 3.6 Flash';
      case 'Data Analyst':
        return 'Gemini 3.6 Flash';
      case 'Software Engineer':
        return 'Gemini 3.6 Flash';
      case 'Documentation':
        return 'Gemini 3.6 Flash';
      default:
        return 'Gemini 3.6 Flash';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Multi-Agent Task Orchestrator</h1>
          </div>
          <p className="text-xs text-slate-500">
            Collaborative agent fleet with dynamic DAG execution visualizer, per-agent model telemetry & token breakdown
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 font-medium">Pipeline Status:</span>
          {isExecuting ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Agents Working...</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ready for Tasks</span>
            </span>
          )}
        </div>
      </div>

      {/* Workflow Execution Trigger Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ask Our Multi-Agent Fleet</span>
            </label>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gemini 3.6 Pro & Flash Fleet</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              rows={2}
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              placeholder="Describe what you want the agent team to analyze or build..."
              className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={isExecuting}
              className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg whitespace-nowrap cursor-pointer ${
                isExecuting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isExecuting ? 'Running Team...' : 'Launch Task'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Visual Workflow Graph Canvas (Visual Planner DAG) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Canvas Header & Legend */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Planner Orchestration DAG (Directed Acyclic Graph)
            </span>
          </div>

          {/* Status Indicator Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-400 font-medium mr-1">Status Legend:</span>
            {renderStatusBadge('running')}
            {renderStatusBadge('waiting')}
            {renderStatusBadge('pending')}
            {renderStatusBadge('completed')}
          </div>
        </div>

        {/* Directed Acyclic Graph Visual Layout */}
        <div className="relative bg-slate-900/95 text-white p-6 sm:p-10 min-h-[460px] flex flex-col items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] overflow-x-auto">
          {/* Subtle SVG Connection Flow Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dagLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            {/* Top Planner to middle nodes */}
            <path d="M 50% 110 C 30% 150, 20% 170, 20% 210" stroke="url(#dagLineGrad)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse" />
            <path d="M 50% 110 C 50% 150, 50% 170, 50% 210" stroke="url(#dagLineGrad)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse" />
            <path d="M 50% 110 C 70% 150, 80% 170, 80% 210" stroke="url(#dagLineGrad)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse" />

            {/* Middle nodes to Software Engineer */}
            <path d="M 20% 270 C 20% 310, 40% 330, 50% 360" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="4 4" />
            <path d="M 50% 270 C 50% 310, 50% 330, 50% 360" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="4 4" />
            <path d="M 80% 270 C 80% 310, 60% 330, 50% 360" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="4 4" />

            {/* Software Engineer to Documentation */}
            <path d="M 50% 410 L 50% 450" stroke="#10B981" strokeWidth="2" fill="none" strokeDasharray="4 4" />
          </svg>

          <div className="relative z-10 w-full max-w-4xl space-y-8 flex flex-col items-center">
            {/* Level 1: Root Planner Node */}
            <div className="flex justify-center w-full">
              <div className="w-80 bg-slate-950 border-2 border-emerald-500 rounded-2xl p-4 shadow-xl hover:shadow-emerald-500/10 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <div>
                      <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Planner</h3>
                      <p className="text-[10px] text-slate-400">Task Decomposition (DAG)</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.planner)}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-emerald-400" />
                    <span>Gemini 3.6 Pro</span>
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    1.8k tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Connector Arrow Down */}
            <div className="text-emerald-400/80 font-mono text-xs flex items-center space-x-2">
              <span>↓ Parallel Execution Subgraphs ↓</span>
            </div>

            {/* Level 2: Parallel Branches (Research, Data Analyst, ML Engineer) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {/* Research Agent */}
              <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🔍</span>
                    <div>
                      <h4 className="text-xs font-bold text-teal-400 uppercase">Research</h4>
                      <p className="text-[10px] text-slate-400">RAG Vector Context</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.research)}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-teal-400" />
                    <span>Gemini 3.6 Flash</span>
                  </span>
                  <span className="text-teal-400 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                    3.4k tokens
                  </span>
                </div>
              </div>

              {/* Data Analyst Agent */}
              <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">📊</span>
                    <div>
                      <h4 className="text-xs font-bold text-cyan-400 uppercase">Data Analyst</h4>
                      <p className="text-[10px] text-slate-400">EDA & Feature Correlations</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.data)}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>Gemini 3.6 Flash</span>
                  </span>
                  <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    2.5k tokens
                  </span>
                </div>
              </div>

              {/* ML Engineer Agent */}
              <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🤖</span>
                    <div>
                      <h4 className="text-xs font-bold text-blue-400 uppercase">ML Engineer</h4>
                      <p className="text-[10px] text-slate-400">AutoML & SHAP Explain</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.ml)}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-blue-400" />
                    <span>Gemini 3.6 Pro</span>
                  </span>
                  <span className="text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                    2.4k tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Convergence Connector */}
            <div className="text-blue-400/80 font-mono text-xs flex items-center space-x-2">
              <span>↓ Converge Subgraph Insights ↓</span>
            </div>

            {/* Level 3: Software Engineer Node */}
            <div className="flex justify-center w-full">
              <div className="w-80 bg-slate-950 border border-indigo-500/80 rounded-2xl p-4 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">💻</span>
                    <div>
                      <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Software Engineer</h3>
                      <p className="text-[10px] text-slate-400">TypeScript API Generation</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.software)}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    <span>Gemini 3.6 Flash</span>
                  </span>
                  <span className="text-indigo-400 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                    2.1k tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Level 4: Documentation Node */}
            <div className="flex justify-center w-full">
              <div className="w-80 bg-slate-950 border border-purple-500/80 rounded-2xl p-4 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">📚</span>
                    <div>
                      <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Documentation</h3>
                      <p className="text-[10px] text-slate-400">OpenAPI & Arch Specs</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.documentation)}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-purple-400" />
                    <span>Gemini 3.6 Flash</span>
                  </span>
                  <span className="text-purple-400 font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                    2.0k tokens
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Summary Bar at bottom of canvas (Per-Agent Tokens + Execution Confidence) */}
        <div className="bg-white border-t border-slate-200/80 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Total & Per-Agent Token Breakdown */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1">
                  <span>Token Usage Breakdown</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-mono font-bold">Total: 14.2k</span>
                </p>
                <span className="text-[11px] text-slate-400">Per-agent consumption telemetry</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-sans text-slate-500 font-semibold block">Planner</span>
                  <span className="font-bold text-slate-900">1.8k</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-sans text-slate-500 font-semibold block">Research</span>
                  <span className="font-bold text-slate-900">3.4k</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-sans text-slate-500 font-semibold block">Data & ML</span>
                  <span className="font-bold text-slate-900">4.9k</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-sans text-slate-500 font-semibold block">Software</span>
                  <span className="font-bold text-slate-900">2.1k</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-sans text-slate-500 font-semibold block">Documentation</span>
                  <span className="font-bold text-slate-900">2.0k</span>
                </div>
              </div>
            </div>

            {/* Pipeline Execution Confidence (Renamed from generic Accuracy) */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pipeline Execution Confidence
                </p>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  96.4%
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96.4%' }} />
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Evaluated workflow graph execution reliability & DAG node completion verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Timeline & Detailed Log Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Log Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Agent Collaboration Feed</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {executionSteps.length} steps recorded
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {executionSteps.map((step) => {
              const isSelected = selectedStep?.id === step.id;
              const stepModel = getAgentModel(step.agentRole);
              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-400/80 shadow-xs ring-1 ring-emerald-300'
                      : 'bg-slate-50/70 border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                        {step.agentRole}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px]">
                      <span className="font-mono text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded font-semibold">
                        {stepModel}
                      </span>
                      <div className="flex items-center space-x-1 text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{step.durationMs}ms</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
                    <span className="font-semibold text-slate-700">Reasoning:</span> "{step.thought}"
                  </p>

                  <div className="mt-2.5 text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200/70 leading-relaxed prose prose-xs max-w-none">
                    <ReactMarkdown>{step.output}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Step Code & Thought Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Step Output Details</h2>
            </div>
          </div>

          {selectedStep ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Agent Role
                  </span>
                  <p className="text-sm font-bold text-emerald-400">{selectedStep.agentRole} ({selectedStep.title})</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Model Used
                  </span>
                  <p className="text-xs font-mono font-bold text-indigo-300">{getAgentModel(selectedStep.agentRole)}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                  <MessageSquareQuote className="w-3 h-3 text-emerald-400" />
                  Agent Reasoning
                </span>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 italic mt-1 leading-relaxed">
                  "{selectedStep.thought}"
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-400" />
                  Full Response & Output
                </span>
                <div className="mt-1 bg-slate-950 text-slate-200 p-3.5 rounded-xl text-xs overflow-x-auto border border-slate-800 max-h-60 leading-relaxed prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown>{selectedStep.output}</ReactMarkdown>
                </div>
              </div>

              {selectedStep.codeSnippet && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Generated Code Payload
                  </span>
                  <pre className="mt-1 bg-slate-950 text-emerald-300 p-3 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 max-h-56">
                    {selectedStep.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-8 text-center">
              Click any step on the left to view detailed agent output.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


