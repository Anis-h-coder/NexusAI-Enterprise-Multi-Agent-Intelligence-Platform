/**
 * NexusAI - Enterprise Multi-Agent Intelligence Platform
 * Global Types & Specifications
 */

export type AgentRole =
  | 'Planner'
  | 'Research'
  | 'Data Analyst'
  | 'ML Engineer'
  | 'Software Engineer'
  | 'Documentation'
  | 'Report'
  | 'Memory';

export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'completed' | 'error';

export interface AgentState {
  role: AgentRole;
  name: string;
  description: string;
  avatar: string;
  status: AgentStatus;
  currentTask?: string;
  progress: number; // 0 to 100
  tokenUsage: number;
  lastActive: string;
}

export interface AgentExecutionStep {
  id: string;
  agentRole: AgentRole;
  title: string;
  input?: string;
  thought: string;
  output: string;
  durationMs: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  codeSnippet?: string;
}

export interface WorkflowNode {
  id: string;
  label: string;
  agentRole: AgentRole;
  x: number;
  y: number;
  status: AgentStatus;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  active?: boolean;
}

// RAG Document Types
export type DocumentFileType = 'pdf' | 'csv' | 'xlsx' | 'image' | 'sql';

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  pageOrRow: number;
  score?: number;
  embeddingPreview: number[];
}

export interface DocumentFile {
  id: string;
  name: string;
  size: string;
  type: DocumentFileType;
  uploadDate: string;
  chunkCount: number;
  status: 'indexed' | 'processing' | 'error';
  tokenCount: number;
  previewText?: string;
}

// AutoML Types
export type DatasetProblemType = 'classification' | 'regression' | 'time_series' | 'clustering' | 'anomaly_detection';

export interface ModelMetric {
  modelName: string;
  accuracy?: number;
  f1Score?: number;
  rmse?: number;
  r2Score?: number;
  mae?: number;
  precision?: number;
  recall?: number;
  trainingTimeSec: number;
  isBest?: boolean;
}

export interface ShapValue {
  feature: string;
  importance: number;
  impactDirection: 'positive' | 'negative';
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][];
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  forecast: number;
  upperBound: number;
  lowerBound: number;
}

export interface AnomalyPoint {
  index: number;
  timestamp: string;
  metricValue: number;
  anomalyScore: number;
  isAnomaly: boolean;
}

export interface AutoMLResult {
  datasetName: string;
  problemType: DatasetProblemType;
  rowCount: number;
  columnCount: number;
  missingValuesCleaned: number;
  featuresEncoded: number;
  models: ModelMetric[];
  bestModel: string;
  shapValues: ShapValue[];
  confusionMatrix?: ConfusionMatrixData;
  forecastData?: ForecastPoint[];
  anomalyData?: AnomalyPoint[];
  pythonCode: string;
}

// SQL & BI Types
export interface DatabaseTable {
  tableName: string;
  rowCount: number;
  columns: { name: string; type: string; isPrimaryKey?: boolean }[];
  sampleRows: Record<string, any>[];
}

export interface SqlQueryResult {
  naturalPrompt: string;
  generatedSql: string;
  explainPlan: string;
  executionTimeMs: number;
  columns: string[];
  rows: Record<string, any>[];
  chartRecommendation: 'bar' | 'line' | 'pie' | 'table';
}

// Chat & RAG Messages
export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentRole?: AgentRole;
  text: string;
  timestamp: string;
  citations?: DocumentChunk[];
  steps?: AgentExecutionStep[];
  codeBlock?: { language: string; code: string };
  isStreaming?: boolean;
}

// Security & RBAC
export type UserRole = 'Admin' | 'AI Architect' | 'Data Scientist' | 'Viewer';

export interface UserSession {
  username: string;
  email: string;
  role: UserRole;
  jwtToken: string;
  expiresIn: string;
  permissions: string[];
}
