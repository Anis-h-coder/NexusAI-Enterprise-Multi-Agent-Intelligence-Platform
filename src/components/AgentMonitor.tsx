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
  Loader2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Search,
  Database,
  BarChart3,
  Download,
} from 'lucide-react';
import { AgentState, AgentExecutionStep, AgentRole } from '../types';
import { generateDocumentationPDF } from '../utils/pdfGenerator';
import { StepOutputRenderer } from './StepOutputRenderer';

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

interface ActiveAgentStageInfo {
  role: string;
  title: string;
  action: string;
  model: string;
  icon: string;
  stageNum: number;
  totalStages: number;
  progressPercent: number;
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

  // Live execution tracking state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<ActiveAgentStageInfo>({
    role: 'Planner',
    title: 'Planner Agent',
    action: 'Decomposing task goal into Directed Acyclic Graph (DAG) subgraphs',
    model: 'Gemini 3.6 Pro',
    icon: '🎯',
    stageNum: 1,
    totalStages: 5,
    progressPercent: 20,
  });

  // Status simulation state when user tests live workflow
  const [simulatedNodeStatuses, setSimulatedNodeStatuses] = useState<Record<string, 'running' | 'waiting' | 'pending' | 'completed'>>({
    planner: 'completed',
    research: 'completed',
    data: 'completed',
    ml: 'completed',
    software: 'completed',
    documentation: 'completed',
  });

  // Handle live timer and multi-agent stage sequencing when task is launched
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExecuting) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);

      // Stage 1: Planner
      setActiveStage({
        role: 'Planner',
        title: 'Planner Agent',
        action: 'Analyzing user instructions & constructing optimal Directed Acyclic Graph (DAG)...',
        model: 'Gemini 3.6 Pro',
        icon: '🎯',
        stageNum: 1,
        totalStages: 5,
        progressPercent: 20,
      });
      setSimulatedNodeStatuses({
        planner: 'running',
        research: 'waiting',
        data: 'waiting',
        ml: 'pending',
        software: 'pending',
        documentation: 'pending',
      });

      // Stage 2: Research & Data Analyst (Parallel execution)
      const timer1 = setTimeout(() => {
        setActiveStage({
          role: 'Research & Analyst',
          title: 'Research & Data Analyst Fleet',
          action: 'Querying ChromaDB vector index and profiling statistical feature correlations...',
          model: 'Gemini 3.6 Flash',
          icon: '🔍',
          stageNum: 2,
          totalStages: 5,
          progressPercent: 42,
        });
        setSimulatedNodeStatuses({
          planner: 'completed',
          research: 'running',
          data: 'running',
          ml: 'waiting',
          software: 'pending',
          documentation: 'pending',
        });
      }, 1200);

      // Stage 3: ML Agent
      const timer2 = setTimeout(() => {
        setActiveStage({
          role: 'ML Agent',
          title: 'AutoML & ML Agent',
          action: 'Cross-validating XGBoost vs LightGBM algorithms and computing SHAP values...',
          model: 'Gemini 3.6 Pro',
          icon: '🤖',
          stageNum: 3,
          totalStages: 5,
          progressPercent: 68,
        });
        setSimulatedNodeStatuses({
          planner: 'completed',
          research: 'completed',
          data: 'completed',
          ml: 'running',
          software: 'waiting',
          documentation: 'pending',
        });
      }, 2600);

      // Stage 4: Software Agent
      const timer3 = setTimeout(() => {
        setActiveStage({
          role: 'Software Agent',
          title: 'Software Agent',
          action: 'Synthesizing production TypeScript Express router & predictive controller API...',
          model: 'Gemini 3.6 Flash',
          icon: '💻',
          stageNum: 4,
          totalStages: 5,
          progressPercent: 88,
        });
        setSimulatedNodeStatuses({
          planner: 'completed',
          research: 'completed',
          data: 'completed',
          ml: 'completed',
          software: 'running',
          documentation: 'waiting',
        });
      }, 3900);

      // Stage 5: Documentation
      const timer4 = setTimeout(() => {
        setActiveStage({
          role: 'Documentation',
          title: 'Documentation Specialist',
          action: 'Compiling OpenAPI 3.1 specifications and executive summary...',
          model: 'Gemini 3.6 Flash',
          icon: '📚',
          stageNum: 5,
          totalStages: 5,
          progressPercent: 96,
        });
        setSimulatedNodeStatuses({
          planner: 'completed',
          research: 'completed',
          data: 'completed',
          ml: 'completed',
          software: 'completed',
          documentation: 'running',
        });
      }, 5200);

      return () => {
        clearInterval(interval);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      setSimulatedNodeStatuses({
        planner: 'completed',
        research: 'completed',
        data: 'completed',
        ml: 'completed',
        software: 'completed',
        documentation: 'completed',
      });
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
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 border border-emerald-300 text-[11px] font-extrabold shadow-lg shadow-emerald-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>🟢 WORKING NOW</span>
          </span>
        );
      case 'waiting':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>🟡 Waiting</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>⚪ Queued</span>
          </span>
        );
      case 'completed':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>🔵 Completed</span>
          </span>
        );
    }
  };

  // Agent model assignment catalog
  const getAgentModel = (role: AgentRole): string => {
    switch (role) {
      case 'Planner':
        return 'Gemini 3.6 Pro';
      case 'ML Agent':
        return 'Gemini 3.6 Pro';
      case 'Research':
        return 'Gemini 3.6 Flash';
      case 'Data Analyst':
        return 'Gemini 3.6 Flash';
      case 'Software Agent':
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
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500 text-slate-950 border border-emerald-400 text-xs font-extrabold shadow-lg shadow-emerald-500/30 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
              <span>Agents Working: {activeStage.role}</span>
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
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-not-allowed animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Agent Working...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Task</span>
                </>
              )}
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
              <div className={`w-80 rounded-2xl p-4 transition-all duration-300 space-y-2 ${
                simulatedNodeStatuses.planner === 'running'
                  ? 'bg-slate-900 border-2 border-emerald-400 ring-4 ring-emerald-400/50 shadow-2xl shadow-emerald-500/50 scale-105 animate-pulse'
                  : 'bg-slate-950 border border-slate-800 shadow-xl'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🎯</span>
                    <div>
                      <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Planner</h3>
                      <p className="text-[10px] text-slate-400">Task Decomposition (DAG)</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.planner)}
                </div>

                {simulatedNodeStatuses.planner === 'running' && (
                  <div className="bg-emerald-950/90 text-emerald-300 text-[10px] px-2.5 py-1 rounded-lg border border-emerald-700/80 font-mono flex items-center space-x-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                    <span>Planning subtasks & agent routing...</span>
                  </div>
                )}

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
              <div className={`rounded-2xl p-4 transition-all duration-300 space-y-2 ${
                simulatedNodeStatuses.research === 'running'
                  ? 'bg-slate-900 border-2 border-teal-400 ring-4 ring-teal-400/50 shadow-2xl shadow-teal-500/50 scale-105 animate-pulse'
                  : 'bg-slate-950 border border-slate-800 shadow-lg'
              }`}>
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

                {simulatedNodeStatuses.research === 'running' && (
                  <div className="bg-teal-950/90 text-teal-300 text-[10px] px-2.5 py-1 rounded-lg border border-teal-700/80 font-mono flex items-center space-x-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
                    <span>Querying ChromaDB vector store...</span>
                  </div>
                )}

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
              <div className={`rounded-2xl p-4 transition-all duration-300 space-y-2 ${
                simulatedNodeStatuses.data === 'running'
                  ? 'bg-slate-900 border-2 border-cyan-400 ring-4 ring-cyan-400/50 shadow-2xl shadow-cyan-500/50 scale-105 animate-pulse'
                  : 'bg-slate-950 border border-slate-800 shadow-lg'
              }`}>
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

                {simulatedNodeStatuses.data === 'running' && (
                  <div className="bg-cyan-950/90 text-cyan-300 text-[10px] px-2.5 py-1 rounded-lg border border-cyan-700/80 font-mono flex items-center space-x-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                    <span>Calculating feature correlation matrix...</span>
                  </div>
                )}

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

              {/* ML Agent Node */}
              <div className={`rounded-2xl p-4 transition-all duration-300 space-y-2 ${
                simulatedNodeStatuses.ml === 'running'
                  ? 'bg-slate-900 border-2 border-blue-400 ring-4 ring-blue-400/50 shadow-2xl shadow-blue-500/50 scale-105 animate-pulse'
                  : 'bg-slate-950 border border-slate-800 shadow-lg'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🤖</span>
                    <div>
                      <h4 className="text-xs font-bold text-blue-400 uppercase">ML Agent</h4>
                      <p className="text-[10px] text-slate-400">AutoML & SHAP Explain</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.ml)}
                </div>

                {simulatedNodeStatuses.ml === 'running' && (
                  <div className="bg-blue-950/90 text-blue-300 text-[10px] px-2.5 py-1 rounded-lg border border-blue-700/80 font-mono flex items-center space-x-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span>Training XGBoost & generating SHAP values...</span>
                  </div>
                )}

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

            {/* Level 3: Software Agent Node */}
            <div className="flex justify-center w-full">
              <div className={`w-80 rounded-2xl p-4 transition-all duration-300 space-y-2 ${
                simulatedNodeStatuses.software === 'running'
                  ? 'bg-slate-900 border-2 border-indigo-400 ring-4 ring-indigo-400/50 shadow-2xl shadow-indigo-500/50 scale-105 animate-pulse'
                  : 'bg-slate-950 border border-indigo-500/80 shadow-xl'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">💻</span>
                    <div>
                      <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Software Agent</h3>
                      <p className="text-[10px] text-slate-400">TypeScript API Generation</p>
                    </div>
                  </div>
                  {renderStatusBadge(simulatedNodeStatuses.software)}
                </div>

                {simulatedNodeStatuses.software === 'running' && (
                  <div className="bg-indigo-950/90 text-indigo-300 text-[10px] px-2.5 py-1 rounded-lg border border-indigo-700/80 font-mono flex items-center space-x-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    <span>Writing TypeScript Express router...</span>
                  </div>
                )}

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
              <div className={`w-80 rounded-2xl p-4 transition-all duration-300 space-y-2 ${
                simulatedNodeStatuses.documentation === 'running'
                  ? 'bg-slate-900 border-2 border-purple-400 ring-4 ring-purple-400/50 shadow-2xl shadow-purple-500/50 scale-105 animate-pulse'
                  : 'bg-slate-950 border border-purple-500/80 shadow-xl'
              }`}>
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

                {simulatedNodeStatuses.documentation === 'running' && (
                  <div className="bg-purple-950/90 text-purple-300 text-[10px] px-2.5 py-1 rounded-lg border border-purple-700/80 font-mono flex items-center space-x-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                    <span>Compiling Markdown docs & schemas...</span>
                  </div>
                )}

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
            {/* Live In-Progress Card in feed if executing */}
            {isExecuting && (
              <div className="p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50/80 shadow-md shadow-emerald-500/10 space-y-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-black flex items-center space-x-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{activeStage.role} (ACTIVE)</span>
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">{activeStage.action}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Working now • {elapsedSeconds.toFixed(1)}s
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  Agent reasoning in progress with {activeStage.model}...
                </p>
              </div>
            )}

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

                  <div className="mt-2.5 text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                    <StepOutputRenderer content={step.output} theme="light" />
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
                <div className="mt-1 bg-slate-950 text-slate-200 p-3.5 rounded-xl text-xs overflow-x-auto border border-slate-800 max-h-72 leading-relaxed">
                  <StepOutputRenderer content={selectedStep.output} theme="dark" />
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

              {/* Documentation PDF Export Option */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Export Documentation</span>
                <button
                  onClick={() => generateDocumentationPDF()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Doc PDF</span>
                </button>
              </div>
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


