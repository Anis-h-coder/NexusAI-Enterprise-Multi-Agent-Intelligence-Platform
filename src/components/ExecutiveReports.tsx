import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  Download,
  Brain,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  BookOpen,
  Presentation,
  Eye,
  Code,
  Share2,
  Calendar,
  UserCheck,
  BarChart3,
  ListOrdered,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { generateExecutiveReportPDF } from '../utils/pdfGenerator';

export const ExecutiveReports: React.FC = () => {
  const [reportTopic, setReportTopic] = useState('NexusAI Q3 Multi-Agent Platform & ML Benchmark Summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'document' | 'deck' | 'raw'>('document');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const [reportMarkdown, setReportMarkdown] = useState<string>(`# NexusAI Q3 Multi-Agent Platform & ML Benchmark Executive Briefing

**Date:** October 2025  
**Prepared For:** Executive Leadership & Engineering Steering Committee  
**Author:** AI Systems Architecture Group  

---

## 1. Executive Summary

During Q3, NexusAI successfully deployed an 8-agent autonomous cluster to analyze enterprise customer churn dynamics, optimize database query engines, and benchmark machine learning algorithms across 7,043 enterprise data records. 

Key achievements include a **15% reduction in multi-agent workflow latency**, **91.2% classification accuracy** on predictive churn models, and sub-15ms vector retrieval times across RAG knowledge bases.

---

## 2. Key Operational Metrics & Findings

| Strategic Domain | Core Metric | Baseline (Q2) | Current (Q3) | Target (Q4) | Status & Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Model Performance** | XGBoost F1-Score | 0.812 | **0.894** | 0.920 | 🟢 +10.1% Improvement |
| **Inference Speed** | Avg Latency | 180 ms | **155 ms** | 100 ms | 🟢 13.8% Latency Reduction |
| **Agent Task Completion** | Autonomous Success Rate | 91.0% | **96.5%** | 98.0% | 🟢 Minimal Human Escalation |
| **Query Engine** | Natural Language SQL Accuracy | 82.4% | **94.1%** | 95.0% | 🟢 Sub-second SQL Generation |
| **RAG Vector Search** | Embedding Retrieval Latency | 24.5 ms | **14.2 ms** | 10.0 ms | 🟢 HNSW Index Optimization |

---

## 3. Multi-Agent Orchestration Workflow

1. **Planner Agent**: Synthesizes natural language business goals into a 5-stage executable directed acyclic graph (DAG).
2. **Research Agent**: Scans dense vector indexes to retrieve relevant enterprise context with 94%+ relevance score.
3. **Data Analyst Agent**: Inspects tabular feature distributions and detects data drift across incoming pipelines.
4. **ML Agent**: Benchmarks 4 candidate algorithm variants (XGBoost, LightGBM, Random Forest, Neural Net).
5. **Software Agent**: Auto-generates production-grade REST API endpoints with JWT authentication and rate limiting.
6. **Report Agent**: Compiles executive briefing slides and markdown artifacts.

---

## 4. Key Strategic Takeaways & Q4 Roadmap

- **Immediate Action**: Transition the top-performing XGBoost model into canary deployment for automated churn mitigation triggers.
- **Infrastructure Expansion**: Scale RAG knowledge stores to handle multi-tenant isolation and hybrid keyword-vector indexing.
- **Security & Compliance**: Implement automated PII anonymization gates on all agent memory channels.
`);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTopic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: reportTopic }),
      });
      const data = await res.json();
      if (data.markdown) {
        setReportMarkdown(data.markdown);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportTopic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    setIsPdfExporting(true);
    try {
      generateExecutiveReportPDF(reportTopic, reportMarkdown);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to export executive PDF report:', err);
    } finally {
      setIsPdfExporting(false);
    }
  };

  // Split report sections for slide deck presentation view
  const sections = reportMarkdown
    .split(/\n(?=##?\s)/g)
    .map((sec) => sec.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Executive Report & Presentation Generator</h1>
          </div>
          <p className="text-xs text-slate-500">
            Synthesizes multi-agent outputs, AutoML evaluation leaderboards, and RAG citations into human-grade executive documents.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode('document')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'document'
                ? 'bg-white text-pink-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-600" />
            <span>Executive Document</span>
          </button>

          <button
            onClick={() => setViewMode('deck')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'deck'
                ? 'bg-white text-pink-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Presentation className="w-3.5 h-3.5 text-pink-600" />
            <span>Presentation Deck</span>
          </button>

          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'raw'
                ? 'bg-white text-pink-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-pink-600" />
            <span>Raw Markdown</span>
          </button>
        </div>
      </div>

      {/* Topic Generator Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-3">
        <span className="text-xs font-semibold text-pink-400 flex items-center space-x-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Synthesize Executive Briefing</span>
        </span>

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={reportTopic}
            onChange={(e) => setReportTopic(e.target.value)}
            placeholder="Describe report topic or executive directive..."
            className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-all"
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 whitespace-nowrap shadow-md disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing Report...' : 'Synthesize Report'}</span>
          </button>
        </form>
      </div>

      {/* MAIN CONTENT VIEW CONTAINER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Document Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900">
              {viewMode === 'document' && 'Executive Report Briefing'}
              {viewMode === 'deck' && 'Presentation Deck Mode'}
              {viewMode === 'raw' && 'Markdown Code Source'}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-50 text-pink-700 border border-pink-200">
              C-Suite Ready
            </span>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors border border-slate-200 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>.MD</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isPdfExporting}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                pdfDownloaded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white active:scale-95'
              }`}
            >
              {pdfDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>PDF Exported!</span>
                </>
              ) : isPdfExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MODE 1: EXECUTIVE FORMATTED DOCUMENT (ReactMarkdown with custom GFM components) */}
        {viewMode === 'document' && (
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4 animate-fadeIn">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <div className="border-b border-slate-200 pb-4 mb-6 pt-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {children}
                    </h1>
                  </div>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-slate-900 border-l-4 border-pink-500 pl-3 mt-8 mb-4 tracking-tight flex items-center space-x-2">
                    <span>{children}</span>
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold text-slate-800 mt-6 mb-2 tracking-wide uppercase">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 my-4 pl-2 list-none">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-2.5 my-4 pl-2 list-none">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="flex items-start space-x-2.5 text-sm text-slate-700 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
                    <span className="leading-snug">{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-slate-900 bg-pink-50/80 px-1 py-0.5 rounded text-[13px]">
                    {children}
                  </strong>
                ),
                table: ({ children }) => (
                  <div className="my-6 border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-slate-50/80 transition-colors">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="py-3 px-4 font-semibold text-slate-900 border-r border-slate-200/60 last:border-r-0">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="py-2.5 px-4 border-r border-slate-100 last:border-r-0 font-sans">
                    {children}
                  </td>
                ),
                hr: () => <hr className="my-6 border-slate-200" />,
                blockquote: ({ children }) => (
                  <blockquote className="bg-pink-50/40 border-l-4 border-pink-500 p-4 rounded-r-xl text-slate-700 italic text-sm my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {reportMarkdown}
            </ReactMarkdown>
          </div>
        )}

        {/* MODE 2: PRESENTATION SLIDE DECK MODE */}
        {viewMode === 'deck' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Slide Navigation Header */}
            <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <Presentation className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Slide {activeSlideIndex + 1} of {sections.length || 1}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeSlideIndex === 0}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition-colors cursor-pointer"
                >
                  Prev Slide
                </button>
                <button
                  onClick={() => setActiveSlideIndex((prev) => Math.min(sections.length - 1, prev + 1))}
                  disabled={activeSlideIndex >= sections.length - 1}
                  className="px-3 py-1 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold disabled:opacity-30 text-xs transition-colors cursor-pointer"
                >
                  Next Slide
                </button>
              </div>
            </div>

            {/* Active Slide Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl text-slate-100 min-h-[360px] flex flex-col justify-between">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-black text-pink-400 border-b border-slate-800 pb-3 mb-6">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-white border-l-4 border-pink-500 pl-3 mb-4">
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{children}</p>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start space-x-2 text-sm text-slate-200 mb-2">
                      <ChevronRight className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                      <span>{children}</span>
                    </li>
                  ),
                  table: ({ children }) => (
                    <div className="my-4 border border-slate-800 rounded-xl overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs text-slate-200">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-slate-900 text-pink-300 uppercase text-[10px] font-bold">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => <th className="p-2.5 border-b border-slate-800">{children}</th>,
                  td: ({ children }) => <td className="p-2.5 border-b border-slate-900">{children}</td>,
                }}
              >
                {sections[activeSlideIndex] || reportMarkdown}
              </ReactMarkdown>

              <div className="pt-6 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>NexusAI Enterprise OS Deck</span>
                <span>Confidential — Internal Board Briefing</span>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: RAW MARKDOWN SOURCE CODE */}
        {viewMode === 'raw' && (
          <div className="animate-fadeIn">
            <textarea
              value={reportMarkdown}
              onChange={(e) => setReportMarkdown(e.target.value)}
              rows={18}
              className="w-full bg-slate-950 text-emerald-400 p-5 rounded-2xl text-xs font-mono border border-slate-800 focus:outline-none focus:border-pink-500 leading-relaxed resize-none shadow-inner"
            />
          </div>
        )}
      </div>
    </div>
  );
};

