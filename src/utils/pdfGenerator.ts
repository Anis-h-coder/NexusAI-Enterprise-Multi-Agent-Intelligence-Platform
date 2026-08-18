import { jsPDF } from 'jspdf';
import { CURRENT_USER } from '../data/mockData';

export interface SystemDocData {
  title?: string;
  version?: string;
  date?: string;
}

export const generateDocumentationPDF = (options?: SystemDocData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 20;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      renderHeaderFooter();
    }
  };

  const renderHeaderFooter = () => {
    const totalPages = doc.getNumberOfPages();
    const pageNum = totalPages;

    // Header line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('NexusAI Enterprise System Design & Security Documentation', margin, 9);
    doc.text('CONFIDENTIAL & PROPRIETARY', pageWidth - margin, 9, { align: 'right' });

    // Footer line
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, margin, pageHeight - 7);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // --- PAGE 1: TITLE & COVER ---
  // Top Badge
  doc.setFillColor(16, 185, 129); // Emerald
  doc.roundedRect(margin, currentY, 32, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL SPEC', margin + 4, currentY + 4.8);

  currentY += 14;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Enterprise System Design, Security & API Documentation', margin, currentY);

  currentY += 10;

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Comprehensive Technical Architecture, PostgreSQL Schema, JWT RBAC & OpenAPI 3.0 Specifications', margin, currentY);

  currentY += 12;

  // Metadata Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Version:', margin + 6, currentY + 7);
  doc.text('Authored By:', margin + 6, currentY + 14);
  doc.text('Target Environment:', margin + 6, currentY + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('v2.4 Enterprise Production', margin + 35, currentY + 7);
  doc.text('NexusAI Systems & Autonomous Agent Architecture Group', margin + 35, currentY + 14);
  doc.text('Google Cloud Platform / Cloud SQL (PostgreSQL) / Gemini 3.6 Pro & Flash', margin + 35, currentY + 21);

  currentY += 32;

  // --- SECTION 1: SYSTEM ARCHITECTURE & MULTI-AGENT DAG ---
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('1. MULTI-AGENT SYSTEM ARCHITECTURE & TOPOLOGY', margin + 4, currentY + 5.5);

  currentY += 14;

  const layers = [
    {
      title: 'Layer 1: Frontend Single-Page Application (SPA)',
      tech: 'React 19 + TypeScript + Tailwind CSS + Recharts',
      desc: 'Interactive enterprise cockpit providing real-time multi-agent execution graphs, AutoML benchmark leaderboards, vector retrieval chunk inspection, and conversational natural language query consoles.',
    },
    {
      title: 'Layer 2: Server API & Multi-Agent Orchestrator',
      tech: 'Express.js + Gemini 3.6 Pro / Flash Autonomous Fleet',
      desc: 'Server-side proxy layer securing API keys, running Directed Acyclic Graph (DAG) task scheduling across 8 specialized agents with dynamic beam search subtask decomposition.',
    },
    {
      title: 'Layer 3: Vector & Relational Storage Engine',
      tech: 'ChromaDB (HNSW 768-dim) + Cloud SQL (PostgreSQL)',
      desc: 'High-speed vector similarity search engine for RAG knowledge retrieval (<15ms latency) paired with ACID-compliant relational schemas for customer telemetry, transactions, and audit logs.',
    },
  ];

  layers.forEach((layer) => {
    checkPageBreak(26);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(layer.title, margin + 4, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 148, 136); // teal-600
    doc.text(`[ ${layer.tech} ]`, margin + 4, currentY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitDesc = doc.splitTextToSize(layer.desc, contentWidth - 8);
    doc.text(splitDesc, margin + 4, currentY + 16);

    currentY += 26;
  });

  // --- SECTION 2: POSTGRESQL DATABASE SCHEMA (DDL) ---
  checkPageBreak(50);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('2. POSTGRESQL RELATIONAL DATABASE SCHEMA (DDL)', margin + 4, currentY + 5.5);

  currentY += 14;

  const ddlCode = [
    '-- Enterprise Customers Table',
    'CREATE TABLE enterprise_customers (',
    '    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
    '    company_name VARCHAR(255) NOT NULL,',
    '    plan_tier VARCHAR(50) DEFAULT \'Enterprise Gold\',',
    '    mrr DECIMAL(10,2) NOT NULL,',
    '    contract_type VARCHAR(50) DEFAULT \'Two-Year\',',
    '    churn_risk_score DECIMAL(4,3) DEFAULT 0.050,',
    '    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    '-- Agent Execution Telemetry Table',
    'CREATE TABLE agent_execution_logs (',
    '    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
    '    task_id UUID NOT NULL,',
    '    agent_role VARCHAR(50) NOT NULL,',
    '    tokens_consumed INT DEFAULT 0,',
    '    latency_ms INT NOT NULL,',
    '    status VARCHAR(20) CHECK (status IN (\'SUCCESS\', \'FAILED\', \'RUNNING\')),',
    '    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    '-- Vector Document Chunks Store',
    'CREATE TABLE vector_document_chunks (',
    '    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
    '    document_name VARCHAR(255) NOT NULL,',
    '    content_chunk TEXT NOT NULL,',
    '    embedding_vector vector(768),',
    '    cosine_similarity DECIMAL(5,4)',
    ');',
  ];

  checkPageBreak(ddlCode.length * 4 + 8);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, ddlCode.length * 3.8 + 6, 2, 2, 'F');

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(52, 211, 153); // emerald-400

  let ddlY = currentY + 5;
  ddlCode.forEach((line) => {
    if (line.startsWith('--')) {
      doc.setTextColor(148, 163, 184); // slate-400
    } else {
      doc.setTextColor(52, 211, 153);
    }
    doc.text(line, margin + 4, ddlY);
    ddlY += 3.8;
  });

  currentY = ddlY + 6;

  // --- SECTION 3: JWT SECURITY & ROLE-BASED ACCESS CONTROL (RBAC) ---
  checkPageBreak(50);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('3. JWT SECURITY ARCHITECTURE & RBAC PERMISSION MATRIX', margin + 4, currentY + 5.5);

  currentY += 14;

  // JWT Details Table
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Authentication Standard:', margin + 4, currentY + 6);
  doc.text('Token Format:', margin + 4, currentY + 12);
  doc.text('Token Claims:', margin + 4, currentY + 18);
  doc.text('Active User Session:', margin + 4, currentY + 24);
  doc.text('Enforced Roles:', margin + 4, currentY + 30);
  doc.text('Encryption & Hashing:', margin + 4, currentY + 36);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('OAuth 2.0 / OpenID Connect compliant stateless Bearer token headers', margin + 44, currentY + 6);
  doc.text('RFC 7519 JSON Web Token (JWT) with HS256 / RS256 signature verification', margin + 44, currentY + 12);
  doc.text('sub (User ID), email, role, org_id, permissions[], iat, exp (3600s TTL)', margin + 44, currentY + 18);
  doc.text(`${CURRENT_USER.username} (${CURRENT_USER.email}) [ Role: ${CURRENT_USER.role} ]`, margin + 44, currentY + 24);
  doc.text('SUPER_ADMIN, ML_ENGINEER, DATA_ANALYST, EXECUTIVE_READONLY', margin + 44, currentY + 30);
  doc.text('TLS 1.3 in-transit encryption with Argon2id password hashing', margin + 44, currentY + 36);

  currentY += 48;

  // --- SECTION 4: OPENAPI 3.0 REST API SPECIFICATION ---
  checkPageBreak(50);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('4. OPENAPI 3.0 REST API SPECIFICATION & CONTROLLER ENDPOINTS', margin + 4, currentY + 5.5);

  currentY += 14;

  const endpoints = [
    {
      method: 'POST',
      path: '/api/agents/run',
      desc: 'Orchestrates multi-agent execution pipeline across 8 autonomous agent roles. Accepts prompt and returns synthesized DAG output.',
      status: '200 OK | JSON { success: true, steps: AgentExecutionStep[], totalTokens: number }',
    },
    {
      method: 'POST',
      path: '/api/rag/query',
      desc: 'Executes cosine similarity retrieval across 768-dimensional document chunks and generates citations with Gemini 3.6 Flash.',
      status: '200 OK | JSON { answer: string, citations: Citation[], latencyMs: number }',
    },
    {
      method: 'POST',
      path: '/api/rag/chat',
      desc: 'Multi-turn conversational RAG endpoint scoped to uploaded documents with session memory and context grounding.',
      status: '200 OK | JSON { answer: string, citations: Citation[], docFilter: string }',
    },
    {
      method: 'POST',
      path: '/api/sql/translate',
      desc: 'Converts human natural language business queries into valid PostgreSQL ANSI SQL queries with EXPLAIN query plan analysis.',
      status: '200 OK | JSON { sql: string, explanation: string, confidence: number }',
    },
    {
      method: 'POST',
      path: '/api/automl/train',
      desc: 'Initiates automated machine learning benchmark competition across XGBoost, LightGBM, Random Forest, and MLP algorithms.',
      status: '200 OK | JSON { models: ModelBenchmark[], bestModel: string, shapFactors: SHAP[] }',
    },
  ];

  endpoints.forEach((ep) => {
    checkPageBreak(22);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

    // Method badge
    doc.setFillColor(16, 185, 129); // emerald
    doc.roundedRect(margin + 3, currentY + 3, 13, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(ep.method, margin + 4.5, currentY + 6.8);

    // Path
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(ep.path, margin + 18, currentY + 7);

    // Desc
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(ep.desc, margin + 3, currentY + 12);

    // Status
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(13, 148, 136);
    doc.text(`Response: ${ep.status}`, margin + 3, currentY + 16);

    currentY += 22;
  });

  // Render header/footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Header line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('NexusAI Enterprise System Design & Security Documentation', margin, 9);
    doc.text('CONFIDENTIAL & PROPRIETARY', pageWidth - margin, 9, { align: 'right' });

    // Footer line
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  // Trigger PDF download
  const filename = `NexusAI_Enterprise_System_Documentation_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export const generateExecutiveReportPDF = (title: string, markdownContent: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 22;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 22) {
      doc.addPage();
      currentY = 22;
    }
  };

  // Header Box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('NexusAI Executive Briefing Report', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • AI Architecture Group`, margin + 6, currentY + 17);

  currentY += 32;

  // Process markdown lines
  const lines = markdownContent.split('\n');

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      currentY += 4;
      return;
    }

    if (trimmed.startsWith('# ')) {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      const text = trimmed.replace(/^#\s+/, '');
      doc.text(text, margin, currentY);
      currentY += 8;
    } else if (trimmed.startsWith('## ')) {
      checkPageBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136); // teal
      const text = trimmed.replace(/^##\s+/, '');
      doc.text(text, margin, currentY);
      currentY += 7;
    } else if (trimmed.startsWith('### ')) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      const text = trimmed.replace(/^###\s+/, '');
      doc.text(text, margin, currentY);
      currentY += 6;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      checkPageBreak(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const text = '• ' + trimmed.replace(/^[-*]\s+/, '').replace(/\*\*/g, '');
      const splitText = doc.splitTextToSize(text, contentWidth - 4);
      doc.text(splitText, margin + 4, currentY);
      currentY += splitText.length * 5 + 1;
    } else if (trimmed.startsWith('---')) {
      checkPageBreak(8);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;
    } else {
      checkPageBreak(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const cleanText = trimmed.replace(/\*\*/g, '');
      const splitText = doc.splitTextToSize(cleanText, contentWidth);
      doc.text(splitText, margin, currentY);
      currentY += splitText.length * 5 + 1;
    }
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('NexusAI Autonomous Intelligence Platform', margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  const filename = `NexusAI_Executive_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
