import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingDashboard } from './components/LandingDashboard';
import { AgentMonitor } from './components/AgentMonitor';
import { AutoMLWorkbench } from './components/AutoMLWorkbench';
import { RagKnowledgeHub } from './components/RagKnowledgeHub';
import { NLQueryStudio } from './components/NLQueryStudio';
import { AgenticChat } from './components/AgenticChat';
import { ExecutiveReports } from './components/ExecutiveReports';
import { SecurityDocs } from './components/SecurityDocs';
import { AutonomousGoalEngine } from './components/AutonomousGoalEngine';

import { AgentState, AgentExecutionStep } from './types';
import { INITIAL_AGENTS, CURRENT_USER } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [quickPromptText, setQuickPromptText] = useState<string>('');
  const [hasApiSecret, setHasApiSecret] = useState<boolean>(true);

  const [executionSteps, setExecutionSteps] = useState<AgentExecutionStep[]>([
    {
      id: 'step-init-1',
      agentRole: 'Planner',
      title: 'Workflow & Strategy Breakdown',
      thought: "I reviewed the request and assembled a 5-step collaborative plan for our team.",
      output: `1. **Research Team**: Gather domain best practices for churn analysis, XGBoost, SHAP, and secure Express API development with TypeScript.
2. **Data Analyst Team**: Perform deep dive into customer dataset, identifying key churn drivers and feature distributions.
3. **ML Agent Team**: Train and evaluate XGBoost vs. LightGBM, integrate SHAP for explainability, and determine optimal model hyperparameters.
4. **Software Agent Team**: Build type-safe Express API router with JWT security and real-time inference routes.
5. **Documentation Team**: Author comprehensive OpenAPI developer specifications and executive briefing guides.`,
      durationMs: 240,
      status: 'completed',
      timestamp: '10:02 AM',
    },
    {
      id: 'step-init-2',
      agentRole: 'Research',
      title: 'Context Search & Relevant Docs',
      thought: 'I searched our knowledge base for key context on revenue growth and churn metrics.',
      output: 'Retrieved 3 highly relevant context passages from Enterprise_Q3_Revenue_Forecast.pdf.',
      durationMs: 380,
      status: 'completed',
      timestamp: '10:02 AM',
    },
    {
      id: 'step-init-3',
      agentRole: 'Data Analyst',
      title: 'Data Exploration & Feature Insights',
      thought: 'I analyzed feature distributions to identify what factors drive customer churn risk.',
      output: 'Month-to-month contracts and short tenure were identified as the strongest churn predictors.',
      durationMs: 510,
      status: 'completed',
      timestamp: '10:03 AM',
    },
    {
      id: 'step-init-4',
      agentRole: 'ML Agent',
      title: 'AutoML Benchmark & SHAP Evaluation',
      thought: 'I trained and benchmarked XGBoost, LightGBM, and Random Forest models.',
      output: 'XGBoost achieved peak performance with 91.2% accuracy and an F1-score of 0.894.',
      durationMs: 1150,
      status: 'completed',
      timestamp: '10:03 AM',
    },
    {
      id: 'step-init-5',
      agentRole: 'Software Agent',
      title: 'TypeScript API Endpoint Generation',
      thought: "I wrote a clean, type-safe Express controller in TypeScript to serve model predictions.",
      output: 'Production TypeScript controller generated cleanly with risk evaluation and error handling.',
      durationMs: 740,
      status: 'completed',
      timestamp: '10:04 AM',
      codeSnippet: `// Production Express API Endpoint
import express from 'express';
import { XGBoostClassifier } from './ml_models';

const router = express.Router();

router.post('/predict', async (req, res) => {
  const { customerFeatures } = req.body;
  const prediction = await XGBoostClassifier.predict(customerFeatures);
  res.json({
    churnProbability: prediction.probability,
    riskTier: prediction.probability > 0.65 ? 'HIGH_RISK' : 'STABLE'
  });
});

export default router;`,
    },
  ]);

  // Check health on load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey !== undefined) {
          setHasApiSecret(data.hasGeminiKey);
        }
      })
      .catch((err) => console.log('Backend health check info:', err));
  }, []);

  const handleRunWorkflow = async (prompt: string) => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskPrompt: prompt }),
      });
      const data = await res.json();
      if (data.steps && data.steps.length > 0) {
        setExecutionSteps(data.steps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunQuickTask = (promptText: string) => {
    setQuickPromptText(promptText);
    handleRunWorkflow(promptText);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Navigation Sidebar & Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={CURRENT_USER}
        hasApiSecret={hasApiSecret}
      />

      {/* Main View Container */}
      <main className="flex-1 lg:pl-64 w-full transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'overview' && (
            <LandingDashboard
              agents={agents}
              setActiveTab={setActiveTab}
              onRunQuickTask={handleRunQuickTask}
            />
          )}

          {activeTab === 'goalEngine' && <AutonomousGoalEngine />}

          {activeTab === 'agents' && (
            <AgentMonitor
              agents={agents}
              executionSteps={executionSteps}
              isExecuting={isExecuting}
              onRunWorkflow={handleRunWorkflow}
              quickPromptText={quickPromptText}
            />
          )}

          {activeTab === 'automl' && <AutoMLWorkbench />}

          {activeTab === 'rag' && <RagKnowledgeHub />}

          {activeTab === 'sql' && <NLQueryStudio />}

          {activeTab === 'chat' && <AgenticChat />}

          {activeTab === 'reports' && <ExecutiveReports />}

          {activeTab === 'security' && <SecurityDocs />}
        </div>
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-6 lg:pl-64 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">Nexus<span className="text-emerald-500">AI</span></span>
            <span>— Enterprise Multi-Agent Intelligence & AutoML Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-medium text-slate-400">
            <span>Gemini 3.6 Flash</span>
            <span>•</span>
            <span>ChromaDB Vector Store</span>
            <span>•</span>
            <span className="text-emerald-600 font-mono font-bold">v4.2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
