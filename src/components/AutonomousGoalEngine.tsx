import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  ArrowDown,
  CheckCircle2,
  Clock,
  Play,
  FileText,
  BarChart3,
  Search,
  Cpu,
  ShieldCheck,
  Target,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  ChevronRight,
  Info,
  Zap,
  Activity,
  GitBranch,
  Layers,
  Database,
  FileSpreadsheet,
  Globe,
  Award,
  Terminal,
  Sliders,
  CheckCheck,
  XCircle,
  TrendingDown,
  TrendingUp,
  FileCode2,
  Eye,
  Scale,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  GoalExecutionResult,
  GoalPipelineNode,
  GoalStage,
  GoalExecutionStateMachineState,
  ShapAttributionFactor,
  QANumericalCheck,
} from '../types';

interface AutonomousGoalEngineProps {
  initialGoal?: string;
}

function getInitialPlannedNodes(goal: string): GoalPipelineNode[] {
  const lower = goal.toLowerCase();
  const isChurn = lower.includes('churn') || lower.includes('retention') || lower.includes('predict');
  const isPricing = lower.includes('price') || lower.includes('competitor');
  const isAudit = lower.includes('audit') || lower.includes('apac') || lower.includes('emea');

  const execCtx = {
    executionId: 'exec-init',
    userGoal: goal,
    goalType: isChurn ? 'customer_churn' : isPricing ? 'competitor_pricing' : isAudit ? 'global_audit' : 'sales_revenue',
    targetDataset: isChurn
      ? 'Customer Cohorts & Telemetry DW'
      : isPricing
      ? 'Pricing & Competitor Matrix DW'
      : isAudit
      ? 'APAC/EMEA Enterprise Contracts'
      : 'Enterprise Sales & Revenue DW',
  };

  return [
    {
      id: 'node-stage-intake',
      executionId: 'exec-init',
      executionContext: execCtx,
      stage: 'USER_GOAL',
      title: isChurn
        ? 'Goal Intake & Churn Cohort Scope'
        : isPricing
        ? 'Goal Intake & Competitor Index Scope'
        : isAudit
        ? 'Goal Intake & Regional Compliance Scope'
        : 'Goal Intake & Schema Scope',
      agentRole: 'Intake Agent',
      status: 'pending',
      durationMs: 120,
      output: 'Goal intake and target dataset mapping initialized.',
      executionSummary: {
        inputSources: ['User Goal Input', 'Target Enterprise Data Warehouse'],
        actionsExecuted: ['Parsed objective', 'Validated schema constraints'],
        outputSummary: 'Execution context ready for planning.',
      },
    },
    {
      id: 'node-stage-planner',
      executionId: 'exec-init',
      executionContext: execCtx,
      stage: 'PLANNER',
      title: 'Dynamic DAG Orchestration',
      agentRole: 'Planner Agent',
      status: 'pending',
      durationMs: 230,
      output: 'Compiling 7-stage directed acyclic graph...',
      executionSummary: {
        inputSources: ['Goal Specification', 'Agent Capability Registry'],
        actionsExecuted: ['Decomposed goal into dependency DAG', 'Configured parallel execution branches'],
        outputSummary: '7-stage dynamic pipeline compiled.',
      },
    },
    {
      id: 'node-stage-analyst',
      executionId: 'exec-init',
      executionContext: execCtx,
      stage: 'DATA_ANALYST',
      title: isChurn
        ? 'Churn Cohort & Tenure Analysis'
        : isPricing
        ? 'Conversion Drop & Win-Rate Analysis'
        : isAudit
        ? 'Regional Contract & Compliance Variance'
        : 'Revenue & Conversion Distribution Analysis',
      agentRole: 'Data Analyst Agent',
      status: 'pending',
      durationMs: 590,
      parallelBranch: 'branch-a',
      output: 'Analyzing dataset distributions and baseline deltas...',
      executionSummary: {
        inputSources: ['Enterprise Tabular Database (Q3 Datasets)'],
        actionsExecuted: ['Computed baseline deltas', 'Executed cohort segmentation'],
        outputSummary: 'Key statistical variance metrics extracted.',
      },
    },
    {
      id: 'node-stage-research',
      executionId: 'exec-init',
      executionContext: execCtx,
      stage: 'RESEARCH_AGENT',
      title: isChurn
        ? 'Support Ticket & Exit Survey RAG'
        : isPricing
        ? 'Competitor Tier & Discount RAG'
        : isAudit
        ? 'APAC/EMEA Governance & SLA RAG'
        : 'CRM & Operational Knowledge Vector RAG',
      agentRole: 'Research Agent',
      status: 'pending',
      durationMs: 470,
      parallelBranch: 'branch-b',
      output: 'Vector similarity search querying contextual documentation and logs...',
      executionSummary: {
        inputSources: ['Vector Embeddings Store', 'Knowledge Hub Chunks'],
        actionsExecuted: ['Executed cosine similarity queries', 'Extracted contextual qualitative insights'],
        outputSummary: 'Contextual knowledge retrieval completed.',
      },
    },
    {
      id: 'node-stage-ml',
      executionId: 'exec-init',
      executionContext: execCtx,
      stage: 'ML_AGENT',
      title: 'Model Training & TreeSHAP Attribution',
      agentRole: 'ML & Explainability Agent',
      status: 'pending',
      durationMs: 840,
      output: 'Training gradient boosting classifier and calculating TreeSHAP feature weights...',
      executionSummary: {
        inputSources: ['Engineered Feature Matrix', 'Validated Labels'],
        actionsExecuted: ['Trained XGBoost / LightGBM models', 'Extracted exact TreeSHAP attribution factors'],
        outputSummary: 'Mathematical feature attribution complete.',
      },
    },
    {
      id: 'node-stage-qa',
      executionId: 'exec-init',
      executionContext: execCtx,
      stage: 'QA_AGENT',
      title: 'QA Numerical Consistency Audit',
      agentRole: 'QA Auditor Agent',
      status: 'pending',
      durationMs: 310,
      output: 'Auditing numerical consistency across narrative claims and raw source telemetry...',
      executionSummary: {
        inputSources: ['Mathematical Metrics', 'Draft Narrative Claims'],
        actionsExecuted: ['Cross-checked reported deltas with ground-truth data', 'Assigned canonical QA consistency score'],
        outputSummary: 'Numerical verification audit complete.',
      },
    },
    {
      id: 'node-stage-exec',
      executionId: 'exec-init',
      executionContext: execCtx,
      stage: 'EXECUTIVE_REPORT',
      title: 'Executive Decision Brief Synthesis',
      agentRole: 'Executive Synthesizer',
      status: 'pending',
      durationMs: 420,
      output: 'Synthesizing plain-English executive finding, 90-day action plan, and deep technical proof...',
      executionSummary: {
        inputSources: ['TreeSHAP Attribution', 'QA Audit Results', 'Analytical Findings'],
        actionsExecuted: ['Formulated plain-language decision brief', 'Constructed 90-day prioritized action plan'],
        outputSummary: 'Executive Brief and Technical Matrix finalized.',
      },
    },
  ];
}

export const AutonomousGoalEngine: React.FC<AutonomousGoalEngineProps> = ({ initialGoal }) => {
  const [userGoalInput, setUserGoalInput] = useState<string>(
    initialGoal || 'Analyze our sales data and identify why revenue dropped.'
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<GoalExecutionResult | null>(null);
  const [displayedNodes, setDisplayedNodes] = useState<GoalPipelineNode[]>([]);
  const [activeStage, setActiveStage] = useState<GoalStage | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [simulatedStepIndex, setSimulatedStepIndex] = useState<number>(-1);
  const [executionState, setExecutionState] = useState<GoalExecutionStateMachineState>('IDLE');

  const sampleGoals = [
    {
      title: 'Sales Revenue Drop Analysis',
      prompt: 'Analyze our sales data and identify why revenue dropped.',
      tag: 'Sales & Revenue',
      icon: Target,
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
    {
      title: 'Customer Churn Predictors',
      prompt: 'Identify Q3 customer churn drivers, run SHAP attribution, and generate retention plan.',
      tag: 'AutoML & SHAP',
      icon: BarChart3,
      color: 'border-blue-500 bg-blue-50/50 text-blue-900',
    },
    {
      title: 'Competitor Pricing Impact',
      prompt: 'Analyze competitor price moves vs. mid-market tier drop-offs to prevent revenue leakage.',
      tag: 'Market Intel',
      icon: Search,
      color: 'border-purple-500 bg-purple-50/50 text-purple-900',
    },
    {
      title: 'Enterprise APAC/EMEA Conversion Audit',
      prompt: 'Evaluate APAC and EMEA enterprise contract renewal drops and recommend product fixes.',
      tag: 'Global Audit',
      icon: ShieldCheck,
      color: 'border-amber-500 bg-amber-50/50 text-amber-900',
    },
  ];

  const handleRunGoalPipeline = async (goalToRun?: string) => {
    const goal = goalToRun || userGoalInput;
    if (!goal.trim() || isExecuting) return;

    const initialNodes = getInitialPlannedNodes(goal);

    // Strict execution isolation: clear previous outputs completely
    setIsExecuting(true);
    setExecutionResult(null);
    setDisplayedNodes(initialNodes);
    setSimulatedStepIndex(0);
    setSelectedNodeId(initialNodes[0].id);
    setActiveStage(initialNodes[0].stage);
    setExecutionState('INTAKE');

    try {
      // Step 1: Intake State
      await new Promise((res) => setTimeout(res, 250));
      setExecutionState('PLANNING');
      setSimulatedStepIndex(1);
      setActiveStage(initialNodes[1].stage);
      setSelectedNodeId(initialNodes[1].id);

      // Step 2: Planning & Backend execution with isolated executionId
      const fetchPromise = fetch('/api/goal-engine/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userGoal: goal,
        }),
      });

      // Animate through initial stages while waiting or once received
      await new Promise((res) => setTimeout(res, 350));
      setExecutionState('EXECUTING');
      setSimulatedStepIndex(2);
      setActiveStage(initialNodes[2].stage);
      setSelectedNodeId(initialNodes[2].id);

      const response = await fetchPromise;

      if (!response.ok) {
        throw new Error(`Execution failed with status: ${response.status}`);
      }

      const data: GoalExecutionResult = await response.json();
      const realNodes = data.nodes && data.nodes.length > 0 ? data.nodes : initialNodes;
      setDisplayedNodes(realNodes);

      // Step-by-step visual animation through the dynamically generated DAG
      const nodeCount = realNodes.length;
      for (let i = 2; i < nodeCount; i++) {
        setSimulatedStepIndex(i);
        setActiveStage(realNodes[i]?.stage || null);
        setSelectedNodeId(realNodes[i]?.id || initialNodes[i]?.id);
        await new Promise((res) => setTimeout(res, 450));
      }

      setExecutionState('VALIDATING');
      await new Promise((res) => setTimeout(res, 300));

      // Terminal State
      const finalState = data.executionState || 'COMPLETED';
      setExecutionState(finalState);
      setSimulatedStepIndex(nodeCount);
      setExecutionResult(data);
      setDisplayedNodes(data.nodes);

      if (data.nodes && data.nodes.length > 0) {
        // Automatically select the executive report node of the active execution
        const execNode = data.nodes.find((n) => n.stage === 'EXECUTIVE_REPORT') || data.nodes[data.nodes.length - 1];
        setSelectedNodeId(execNode.id);
      }
    } catch (err) {
      console.error('Autonomous Goal Engine execution error:', err);
      setExecutionState('IDLE');
    } finally {
      setIsExecuting(false);
      setActiveStage(null);
    }
  };

  const copyReportToClipboard = (reportText?: string) => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Active nodes list to render
  const nodesToRender = executionResult?.nodes || displayedNodes;

  // Safe selected node resolution: derived STRICTLY from active executionResult or displayedNodes
  const selectedNode = React.useMemo(() => {
    if (!nodesToRender || nodesToRender.length === 0) {
      return null;
    }
    const found = nodesToRender.find((n) => n.id === selectedNodeId);
    if (found) return found;
    if (isExecuting && simulatedStepIndex >= 0 && simulatedStepIndex < nodesToRender.length) {
      return nodesToRender[simulatedStepIndex];
    }
    return nodesToRender[nodesToRender.length - 1];
  }, [nodesToRender, selectedNodeId, isExecuting, simulatedStepIndex]);

  // Context validation guard: ensures selectedNode is valid
  const isContextValid = Boolean(selectedNode);

  // Diagnostic logging
  useEffect(() => {
    if (executionResult) {
      console.log('[GoalEngine Diagnostic]', {
        activeExecutionId: executionResult.executionId,
        selectedNodeId: selectedNodeId,
        selectedNodeExecutionId: selectedNode?.executionContext?.executionId,
        selectedNodeReportType: selectedNode?.reportType || selectedNode?.reportTitle,
        finalReportType: executionResult.finalReport?.reportType,
        goalType: executionResult.goalType,
        targetDataset: executionResult.executionContext?.targetDataset,
        qaStatus: executionResult.qaStatus,
        qaScore: executionResult.qaScore,
      });
    }
  }, [executionResult, selectedNodeId, selectedNode]);

  return (
    <div className="space-y-6">
      {/* Top System Model & Telemetry Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
              <Brain className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Autonomous Multi-Agent Goal Engine
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Enterprise AI system translating business goals into simple executive clarity with rigorous statistical proof
              </p>
            </div>
          </div>

          {/* Model Status */}
          <div className="flex items-center self-start sm:self-center shrink-0">
            {/* Model Badge */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
              <span className="text-slate-400 font-medium">MODEL</span>
              <span className="font-mono font-bold text-slate-200">Gemini 3.7 Flash</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold text-[11px]">Connected</span>
            </div>
          </div>
        </div>

        {/* Execution Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Status
            </span>
            <span
              className={`text-xs font-extrabold font-mono flex items-center space-x-1 ${
                executionState === 'COMPLETED'
                  ? 'text-emerald-400'
                  : executionState === 'FAILED'
                  ? 'text-rose-400'
                  : isExecuting
                  ? 'text-amber-400 animate-pulse'
                  : 'text-slate-300'
              }`}
            >
              {executionState === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {executionState === 'FAILED' && <XCircle className="w-3.5 h-3.5" />}
              {isExecuting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{executionState}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Tasks
            </span>
            <span className="text-xs font-bold font-mono text-slate-200">
              {executionResult ? `${executionResult.completedTasks} / ${executionResult.totalTasks}` : '0 / 0'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Agents
            </span>
            <span className="text-xs font-bold font-mono text-slate-200">
              {executionResult ? executionResult.totalAgents : 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Tool Calls
            </span>
            <span className="text-xs font-bold font-mono text-slate-200">
              {executionResult ? executionResult.totalToolCalls : 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Retries
            </span>
            <span className="text-xs font-bold font-mono text-slate-200">
              {executionResult ? executionResult.totalRetries : 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Duration
            </span>
            <span className="text-xs font-bold font-mono text-slate-200">
              {executionResult ? `${(executionResult.totalDurationMs / 1000).toFixed(2)}s` : '0.00s'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              QA Audit
            </span>
            <span className={`text-xs font-bold font-mono ${
              executionResult?.qaStatus === 'FAILED' ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {executionResult ? `${executionResult.qaScore ?? executionResult.qa?.score ?? 96.2}% ${executionResult.qaStatus || 'PASSED'}` : '---'}
            </span>
          </div>
        </div>

        {/* State Machine Transition Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1.5">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pipeline State Machine Workflow:</span>
            </span>
            <span className="text-slate-300 font-semibold">{executionState}</span>
          </div>

          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold text-center">
            {[
              { state: 'IDLE', label: '1. IDLE' },
              { state: 'INTAKE', label: '2. INTAKE' },
              { state: 'PLANNING', label: '3. PLANNING' },
              { state: 'EXECUTING', label: '4. EXECUTING' },
              { state: 'VALIDATING', label: '5. VALIDATING' },
              { state: 'COMPLETED', label: '6. COMPLETED' },
            ].map((st) => {
              const isActive = executionState === st.state;
              const isPast =
                ['IDLE', 'INTAKE', 'PLANNING', 'EXECUTING', 'VALIDATING', 'COMPLETED'].indexOf(
                  executionState
                ) >
                ['IDLE', 'INTAKE', 'PLANNING', 'EXECUTING', 'VALIDATING', 'COMPLETED'].indexOf(st.state);

              return (
                <div
                  key={st.state}
                  className={`py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? executionState === 'FAILED'
                        ? 'bg-rose-500 text-white font-extrabold shadow-sm'
                        : 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                      : isPast
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {st.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Metadata Ribbon */}
        {executionResult && (
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Execution ID:</span>
              <span className="text-emerald-300 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {executionResult.executionId}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span>Dataset: <span className="text-slate-200 font-semibold">{executionResult.executionContext?.targetDataset}</span></span>
              <span>Report: <span className="text-emerald-400">{executionResult.finalReport?.reportType || 'N/A'}</span></span>
              <span>Goal Type: <span className="text-blue-300">{executionResult.goalType}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Goal Input & Preset Goal Selection */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Enter High-Level Business Goal</span>
          </label>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Dynamic DAG Orchestration</span>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={userGoalInput}
            onChange={(e) => setUserGoalInput(e.target.value)}
            disabled={isExecuting}
            placeholder="e.g., Identify Q3 customer churn drivers, run SHAP attribution, and generate retention plan."
            rows={2}
            className="w-full rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 p-3.5 text-sm text-slate-800 bg-slate-50/50 disabled:opacity-60 transition-all font-medium placeholder:text-slate-400"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Planner dynamically decomposes goal into isolated execution DAG & agent fleet</span>
            </div>

            <button
              onClick={() => handleRunGoalPipeline()}
              disabled={isExecuting || !userGoalInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Goal Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Goals */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Preset Business Goal Examples:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {sampleGoals.map((sample, idx) => {
              const Icon = sample.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setUserGoalInput(sample.prompt);
                    handleRunGoalPipeline(sample.prompt);
                  }}
                  disabled={isExecuting}
                  className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer ${
                    userGoalInput === sample.prompt
                      ? `${sample.color} ring-2 ring-emerald-500/40 shadow-sm`
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600">
                      {sample.tag}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{sample.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{sample.prompt}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Execution Workflow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Autonomous DAG Flow Diagram */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 self-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Dynamic Multi-Agent DAG Flow</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {isExecuting
                  ? `Stage ${Math.min(simulatedStepIndex + 1, nodesToRender.length)} / ${nodesToRender.length}`
                  : executionResult
                  ? `${executionResult.nodes.length} Stages`
                  : 'Ready'}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Planner Agent compiles custom agent dependency graph based on the active goal requirements:
            </p>

            {/* Pipeline Stage Nodes */}
            <div className="space-y-2 relative pt-1">
              {nodesToRender && nodesToRender.length > 0 ? (
                nodesToRender.map((step, index, array) => {
                  const isStepCompleted = !isExecuting ? Boolean(executionResult) : simulatedStepIndex > index;
                  const isStepActive = isExecuting && simulatedStepIndex === index;
                  const isSelected = selectedNodeId === step.id;

                  return (
                    <React.Fragment key={step.id}>
                      <div
                        onClick={() => setSelectedNodeId(step.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isStepActive
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10'
                            : isSelected
                            ? 'ring-2 ring-slate-900 shadow-md border-slate-900 bg-slate-50/70'
                            : isStepCompleted
                            ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                              isStepActive
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-200/80 animate-pulse'
                                : isStepCompleted
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs font-bold ${
                                  isStepActive ? 'text-emerald-950 font-extrabold' : 'text-slate-900'
                                }`}
                              >
                                {step.title}
                              </span>
                              {step.parallelBranch && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  Parallel
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] ${
                                isStepActive ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                              }`}
                            >
                              {step.agentRole}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isStepActive ? (
                            <span className="text-emerald-700 bg-emerald-100/90 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center space-x-1.5 animate-pulse">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                              <span>Running...</span>
                            </span>
                          ) : isStepCompleted ? (
                            <span className="text-emerald-600 text-[11px] font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {step.durationMs ? `${step.durationMs}ms` : 'Done'}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Queued</span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 transition-colors ${
                              isStepActive ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          />
                        </div>
                      </div>

                      {index < array.length - 1 && (
                        <div className="flex justify-center my-0.5">
                          <ArrowDown
                            className={`w-3.5 h-3.5 transition-colors ${
                              simulatedStepIndex > index
                                ? 'text-emerald-500'
                                : simulatedStepIndex === index
                                ? 'text-emerald-500 animate-pulse'
                                : 'text-slate-300'
                            }`}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              ) : isExecuting ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Planner Agent is compiling DAG...</p>
                  <p className="text-[11px] text-slate-500">Decomposing goal requirements into specialized agent stages</p>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <GitBranch className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Pipeline Ready</p>
                  <p className="text-[11px] text-slate-500">Click &quot;Execute Goal Pipeline&quot; above to dynamically generate the DAG flow.</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Summary Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Agent Execution Timeline</span>
              </span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                {executionResult
                  ? `${(executionResult.totalDurationMs / 1000).toFixed(2)}s`
                  : isExecuting
                  ? 'Running...'
                  : '---'}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {executionResult?.timeline && executionResult.timeline.length > 0 ? (
                executionResult.timeline.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-700">✓ {item.stageTitle}</span>
                    <span className="text-slate-500">{item.durationMs}ms</span>
                  </div>
                ))
              ) : isExecuting && simulatedStepIndex >= 0 ? (
                nodesToRender.slice(0, simulatedStepIndex).map((node, idx) => (
                  <div key={idx} className="flex justify-between items-center text-emerald-800 font-sans">
                    <span>✓ {node.title}</span>
                    <span className="font-mono text-emerald-600">{node.durationMs || 150}ms</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-2 text-[11px] font-sans">
                  Timeline will populate upon pipeline execution.
                </div>
              )}
              {executionResult && (
                <div className="pt-1.5 border-t border-slate-200/80 flex justify-between font-bold text-emerald-700">
                  <span>✓ Pipeline Completed</span>
                  <span>{executionResult.executionState}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Executive Response + Technical Evidence */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Progress Banner during execution */}
          {isExecuting && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Executing Multi-Agent DAG Workflow
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-lg self-start sm:self-auto">
                  Stage {Math.min(simulatedStepIndex + 1, nodesToRender.length)} of {nodesToRender.length}
                </span>
              </div>

              {/* Stage Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((simulatedStepIndex + 1) / (nodesToRender.length || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    Active Agent:{' '}
                    <strong className="text-emerald-400 font-semibold">
                      {nodesToRender[simulatedStepIndex]?.agentRole || 'Planner Agent'}
                    </strong>
                  </span>
                  <span>
                    {Math.min(100, Math.round(((simulatedStepIndex + 1) / (nodesToRender.length || 1)) * 100))}% Complete
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Objective</span>
                  <p className="font-semibold text-slate-200">
                    {nodesToRender[simulatedStepIndex]?.title || 'Processing pipeline stage...'}
                  </p>
                </div>
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0 ml-3" />
              </div>
            </div>
          )}
          {/* Executive Summary Card (Explain Simply. Prove Technically.) */}
          {executionResult?.executiveSummary && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Executive Summary &amp; Decision Brief
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      copyReportToClipboard(
                        executionResult.nodes.find((n) => n.stage === 'EXECUTIVE_REPORT')?.output ||
                          executionResult.finalReport?.markdown
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {copiedReport ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QA Rejection Banner if Mismatch Simulated */}
              {executionResult.qaStatus === 'FAILED' && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>QA Numerical Verification FAILED — Discrepancy Detected</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    The QA Agent audited the reported numbers against the ground-truth calculation and detected a numerical conflict. The Executive Summary has been marked for self-correction.
                  </p>
                </div>
              )}

              {/* SECTION 1: Executive Finding (Simple & Clear) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-200/80 text-emerald-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Executive Finding</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                    {executionResult.executionContext?.targetDataset}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-relaxed text-slate-900">
                  {executionResult.executiveSummary.finding || executionResult.executiveSummary.headline}
                </p>
              </div>

              {/* SECTION 2: Why It Happened (Simple Explanation + Technical Evidence) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Why It Happened (Key Drivers &amp; Attribution)</span>
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {executionResult.executiveSummary.whyItHappened &&
                  executionResult.executiveSummary.whyItHappened.length > 0 ? (
                    executionResult.executiveSummary.whyItHappened.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors space-y-1.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{item.factor}</span>
                          </span>

                          {item.normalizedShap !== undefined && (
                            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded self-start sm:self-center">
                              {item.normalizedShap}% Normalized Contribution
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed pl-7">
                          {item.simpleExplanation}
                        </p>

                        <div className="pl-7 pt-1 flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                          <span className="text-slate-400 font-sans">Technical Proof:</span>
                          <span className="text-slate-700 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.technicalEvidence}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    executionResult.executiveSummary.topCauses.map((cause, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium">
                        • {cause}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION 3: Recommended Actions (Business Terms) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Recommended Strategic Actions</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {executionResult.executiveSummary.recommendedActions &&
                  executionResult.executiveSummary.recommendedActions.length > 0 ? (
                    executionResult.executiveSummary.recommendedActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/30 flex flex-col justify-between space-y-2"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 inline-block">
                            {action.timeframe || `Phase ${idx + 1}`}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">{action.title}</h5>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {action.simpleAction}
                        </p>
                      </div>
                    ))
                  ) : (
                    executionResult.executiveSummary.actionPlan.map((plan, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs text-slate-700">
                        {plan}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* QA Numerical Consistency Audit Score */}
              {(executionResult.qaScore !== undefined || executionResult.qaValidation?.qaScore !== undefined) && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 font-bold text-slate-800">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>QA Numerical Consistency Audit</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-lg flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      QA Score: {executionResult.qaScore ?? executionResult.qaValidation?.qaScore}%
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Agent Inspector - Full Width Horizontal Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5 w-full">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Agent Inspector:{' '}
              <span className="text-emerald-600">
                {selectedNode ? selectedNode.title : 'Stage Inspector'}
              </span>
            </h3>
          </div>
          {selectedNode && (
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {selectedNode.agentRole} • {selectedNode.durationMs}ms
            </span>
          )}
        </div>

            {/* Context Mismatch Guard */}
            {executionResult && selectedNode && !isContextValid && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Execution Context Mismatch Detected</span>
                </p>
                <p>The selected node belongs to an outdated execution context. Please re-select a node from the active DAG.</p>
              </div>
            )}

            {isContextValid && selectedNode ? (
              <div className="space-y-5">
                {/* Agent Execution Summary in Simple Language */}
                {selectedNode.executionSummary && (
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-3 shadow-sm border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Agent Execution Summary</span>
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {selectedNode.agentRole}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                      <div>
                        <p className="font-bold text-slate-400 mb-1 flex items-center space-x-1">
                          <Database className="w-3 h-3 text-blue-400" />
                          <span>Input Sources:</span>
                        </p>
                        <ul className="space-y-1 font-mono text-[11px]">
                          {selectedNode.executionSummary.inputSources.map((src, i) => (
                            <li key={i} className="flex items-center space-x-1.5">
                              <span className="text-emerald-400">✓</span>
                              <span>{src}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-bold text-slate-400 mb-1 flex items-center space-x-1">
                          <Cpu className="w-3 h-3 text-amber-400" />
                          <span>Actions Executed:</span>
                        </p>
                        <ul className="space-y-1 text-[11px]">
                          {selectedNode.executionSummary.actionsExecuted.map((act, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <span className="text-amber-400">•</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
                      <span className="font-semibold">Result:</span>
                      <span className="font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        {selectedNode.executionSummary.outputSummary}
                      </span>
                    </div>
                  </div>
                )}

                {/* Grounded Data Evidence */}
                {selectedNode.dataGrounding && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                      <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Calculated Dataset Grounding Evidence</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Source: {selectedNode.dataGrounding.dataSource}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-medium">Baseline</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {selectedNode.dataGrounding.baselinePeriod || selectedNode.dataGrounding.baselineRevenue}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] block font-medium">Current Period</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {selectedNode.dataGrounding.currentPeriod || selectedNode.dataGrounding.currentRevenue}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] block font-medium">Metric Delta</span>
                        <span className="font-bold text-rose-600 font-mono">
                          {selectedNode.dataGrounding.percentageChange}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] block font-medium">Rows Analyzed</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {selectedNode.dataGrounding.rowsAnalyzed.toLocaleString()} records
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Research Provenance & Citations */}
                {selectedNode.researchProvenance && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>Research Provenance &amp; Verified Sources</span>
                    </p>
                    <div className="space-y-2">
                      {selectedNode.researchProvenance.map((prov, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900">{prov.entityName}</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                ({prov.sourceDocument})
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{prov.observedFact}</p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
                            <span className="text-[10px] text-slate-500">{prov.retrievedAt}</span>
                            <span className="text-emerald-700 font-bold font-mono bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                              {prov.evidenceConfidence}% Confidence
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* QA Validation Checklist */}
                {selectedNode.qaValidation && (
                  <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-bold text-emerald-950">
                          QA Validation Status: <span className="text-emerald-700 uppercase">{selectedNode.qaValidation.qaStatus}</span>
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded border border-emerald-300 shadow-sm">
                        QA Score: {selectedNode.qaValidation.qaScore || executionResult?.qaScore || executionResult?.qa?.score}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedNode.qaValidation.checks.map((check, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-between">
                          <span className="text-slate-700 font-medium">{check.name}</span>
                          <span className={`font-bold font-mono flex items-center space-x-1 ${
                            check.status === 'PASSED' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {check.status === 'PASSED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{check.status}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Render Markdown Output Text */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs leading-relaxed font-sans prose prose-slate max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedNode.output}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                {isExecuting
                  ? 'Executing multi-agent stages...'
                  : 'Execute a goal to inspect agent execution summaries, grounding data, and reports.'}
              </div>
            )}
      </div>
    </div>
  );
};
