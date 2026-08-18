import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Layers,
  Database,
  Code2,
  FileCode,
  CheckCircle2,
  Server,
  Activity,
  Terminal,
  Download,
  FileText,
  Check,
  Printer,
  Sparkles,
} from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';
import { generateDocumentationPDF } from '../utils/pdfGenerator';

export const SecurityDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'er' | 'rbac' | 'api'>('architecture');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      generateDocumentationPDF();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate documentation PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with PDF Download Actions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Enterprise System Design, Security & API Docs</h1>
          </div>
          <p className="text-xs text-slate-500">
            Clean enterprise architecture, JWT RBAC security matrix, PostgreSQL ER schema, and OpenAPI specification.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>PDF Downloaded!</span>
              </>
            ) : isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Building PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Documentation (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
              <span>Official Enterprise Architecture & Security Spec</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                PDF Ready
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Includes System DAG topology, PostgreSQL DDL schemas, JWT claims matrix, and 5 OpenAPI REST endpoints.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export .PDF</span>
        </button>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSection('architecture')}
          className={`pb-2.5 transition-all ${
            activeSection === 'architecture'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          System Architecture & DAG
        </button>
        <button
          onClick={() => setActiveSection('er')}
          className={`pb-2.5 transition-all ${
            activeSection === 'er'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          PostgreSQL ER Diagram & Schema
        </button>
        <button
          onClick={() => setActiveSection('rbac')}
          className={`pb-2.5 transition-all ${
            activeSection === 'rbac'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          JWT Security & RBAC Matrix
        </button>
        <button
          onClick={() => setActiveSection('api')}
          className={`pb-2.5 transition-all ${
            activeSection === 'api'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          OpenAPI REST API Endpoints
        </button>
      </div>

      {/* Section 1: System Architecture */}
      {activeSection === 'architecture' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Enterprise Multi-Agent Architecture Topology</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Layer 1: Frontend UI</span>
              <h3 className="font-bold text-slate-900 text-sm">React + Tailwind + Recharts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Responsive single-page enterprise dashboard with interactive agent flow visualization, AutoML leaderboard, RAG inspector, and NL SQL query studio.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-mono text-teal-600 font-bold uppercase">Layer 2: Server API & Orchestrator</span>
              <h3 className="font-bold text-slate-900 text-sm">Express + Gemini 3.6 Flash</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Server-side API routes proxying requests safely, executing LangGraph state transitions across 8 autonomous agents with zero browser key leaks.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">Layer 3: Vector & Data Engine</span>
              <h3 className="font-bold text-slate-900 text-sm">ChromaDB + PostgreSQL</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-dimensional vector embedding database for RAG context retrieval paired with relational database for SQL execution and transactional state.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: PostgreSQL ER Diagram */}
      {activeSection === 'er' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">PostgreSQL Database ER Diagram & DDL</h2>

          <div className="bg-slate-900 text-emerald-300 p-5 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800">
            {`-- PostgreSQL DDL Database Schema Specification

CREATE TABLE enterprise_customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'Enterprise Gold',
    mrr DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_execution_logs (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    agent_role VARCHAR(50) NOT NULL,
    tokens_consumed INT DEFAULT 0,
    latency_ms INT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('SUCCESS', 'FAILED', 'RUNNING')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vector_document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_name VARCHAR(255) NOT NULL,
    content_chunk TEXT NOT NULL,
    embedding_vector vector(768),
    score DECIMAL(5,4)
);`}
          </div>
        </div>
      )}

      {/* Section 3: JWT Security & RBAC */}
      {activeSection === 'rbac' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">JWT Token Payload & RBAC Roles</h2>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
              Authenticated Session
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
              <span className="text-emerald-400 font-bold block">// Decoded JWT Token Claims</span>
              <pre className="text-teal-300 text-[11px] overflow-x-auto">
                {JSON.stringify(
                  {
                    sub: CURRENT_USER.username,
                    email: CURRENT_USER.email,
                    role: CURRENT_USER.role,
                    permissions: CURRENT_USER.permissions,
                    exp: CURRENT_USER.expiresIn,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-900">Role-Based Access Permissions</h3>
              <div className="space-y-2">
                {CURRENT_USER.permissions.map((perm) => (
                  <div key={perm} className="flex items-center space-x-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono">{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: OpenAPI Endpoints */}
      {activeSection === 'api' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">OpenAPI 3.0 REST Specification</h2>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">/api/agents/run</span>
              </div>
              <p className="text-xs text-slate-600">
                Orchestrates multi-agent execution pipeline across 8 autonomous agent roles.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-teal-600 text-white font-mono text-[10px] font-bold">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">/api/rag/query</span>
              </div>
              <p className="text-xs text-slate-600">
                Performs hybrid semantic similarity search and returns citation-grounded answers.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">/api/sql/translate</span>
              </div>
              <p className="text-xs text-slate-600">
                Translates natural language questions into executable ANSI SQL with EXPLAIN plans.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
