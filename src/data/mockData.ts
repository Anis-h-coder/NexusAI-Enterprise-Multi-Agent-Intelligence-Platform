import {
  AgentState,
  DocumentFile,
  DocumentChunk,
  DatabaseTable,
  AutoMLResult,
  UserSession,
  WorkflowNode,
  WorkflowEdge
} from '../types';

export const INITIAL_AGENTS: AgentState[] = [
  {
    role: 'Planner',
    name: 'Nexus-Planner-v4',
    description: 'Decomposes complex goals into directed DAG execution graphs and assigns agent roles.',
    avatar: '🎯',
    status: 'idle',
    progress: 100,
    tokenUsage: 45200,
    lastActive: 'Just now',
  },
  {
    role: 'Research',
    name: 'Nexus-Research-v2',
    description: 'Retrieves relevant documents, performs hybrid vector search, and formats context chunks.',
    avatar: '🔍',
    status: 'idle',
    progress: 100,
    tokenUsage: 89100,
    lastActive: '2 mins ago',
  },
  {
    role: 'Data Analyst',
    name: 'Nexus-Analyst-v3',
    description: 'Performs exploratory data analysis (EDA), generates SQL, and identifies business KPIs.',
    avatar: '📊',
    status: 'idle',
    progress: 100,
    tokenUsage: 62400,
    lastActive: '5 mins ago',
  },
  {
    role: 'ML Engineer',
    name: 'Nexus-MLE-v5',
    description: 'Automates feature scaling, multi-model training (XGBoost/LightGBM), SHAP evaluation, and deployment.',
    avatar: '🤖',
    status: 'idle',
    progress: 100,
    tokenUsage: 112000,
    lastActive: '1 min ago',
  },
  {
    role: 'Software Engineer',
    name: 'Nexus-Dev-v4',
    description: 'Writes production-grade TypeScript/Python API routes, refactors code, and runs security checks.',
    avatar: '💻',
    status: 'idle',
    progress: 100,
    tokenUsage: 94800,
    lastActive: '3 mins ago',
  },
  {
    role: 'Documentation',
    name: 'Nexus-Doc-v2',
    description: 'Autogenerates OpenAPI specifications, architecture diagrams, and comprehensive technical READMEs.',
    avatar: '📚',
    status: 'idle',
    progress: 100,
    tokenUsage: 31200,
    lastActive: '10 mins ago',
  },
  {
    role: 'Report',
    name: 'Nexus-Report-v3',
    description: 'Synthesizes multi-agent outputs into executive PDF reports and formatted presentation summaries.',
    avatar: '📑',
    status: 'idle',
    progress: 100,
    tokenUsage: 48900,
    lastActive: '7 mins ago',
  },
  {
    role: 'Memory',
    name: 'Nexus-Memory-v1',
    description: 'Maintains long-term vector state memory across sessions, user preferences, and historical task executions.',
    avatar: '🧠',
    status: 'idle',
    progress: 100,
    tokenUsage: 128500,
    lastActive: 'Continuous',
  },
];

export const WORKFLOW_NODES: WorkflowNode[] = [
  { id: '1', label: 'User Task Input', agentRole: 'Planner', x: 50, y: 150, status: 'completed' },
  { id: '2', label: 'Task Decomposition (DAG)', agentRole: 'Planner', x: 220, y: 150, status: 'completed' },
  { id: '3', label: 'RAG Context Retrieval', agentRole: 'Research', x: 420, y: 80, status: 'completed' },
  { id: '4', label: 'EDA & SQL Insight Synthesis', agentRole: 'Data Analyst', x: 420, y: 220, status: 'completed' },
  { id: '5', label: 'AutoML Pipeline & SHAP', agentRole: 'ML Engineer', x: 640, y: 80, status: 'completed' },
  { id: '6', label: 'API Code Generation', agentRole: 'Software Engineer', x: 640, y: 220, status: 'completed' },
  { id: '7', label: 'Technical OpenAPI Docs', agentRole: 'Documentation', x: 840, y: 80, status: 'completed' },
  { id: '8', label: 'Executive Report Building', agentRole: 'Report', x: 840, y: 220, status: 'completed' },
  { id: '9', label: 'Long-term Vector Memory Store', agentRole: 'Memory', x: 1040, y: 150, status: 'completed' },
];

export const WORKFLOW_EDGES: WorkflowEdge[] = [
  { id: 'e1-2', source: '1', target: '2', active: true },
  { id: 'e2-3', source: '2', target: '3', active: true },
  { id: 'e2-4', source: '2', target: '4', active: true },
  { id: 'e3-5', source: '3', target: '5', active: true },
  { id: 'e4-6', source: '4', target: '6', active: true },
  { id: 'e5-7', source: '5', target: '7', active: true },
  { id: 'e6-8', source: '6', target: '8', active: true },
  { id: 'e7-9', source: '7', target: '9', active: true },
  { id: 'e8-9', source: '8', target: '9', active: true },
];

export const SAMPLE_DOCUMENTS: DocumentFile[] = [
  {
    id: 'doc-1',
    name: 'Enterprise_Q3_Revenue_Forecast.pdf',
    size: '4.2 MB',
    type: 'pdf',
    uploadDate: '2026-07-28',
    chunkCount: 38,
    status: 'indexed',
    tokenCount: 14200,
    previewText: 'Quarterly financial report detailing Q3 expansion across enterprise Cloud and AI services...',
  },
  {
    id: 'doc-2',
    name: 'Customer_Churn_Dataset_2026.csv',
    size: '1.8 MB',
    type: 'csv',
    uploadDate: '2026-07-29',
    chunkCount: 120,
    status: 'indexed',
    tokenCount: 28400,
    previewText: 'Customer features including Tenure, Monthly Charges, Total Charges, Contract Type, and Churn status.',
  },
  {
    id: 'doc-3',
    name: 'NexusAI_Architecture_Whitepaper.pdf',
    size: '8.5 MB',
    type: 'pdf',
    uploadDate: '2026-07-25',
    chunkCount: 94,
    status: 'indexed',
    tokenCount: 41000,
    previewText: 'Technical specifications of the multi-agent orchestration layer, hybrid RAG retriever, and LangGraph DAG runner.',
  },
  {
    id: 'doc-4',
    name: 'PostgreSQL_Sales_Production_DB.sql',
    size: '560 KB',
    type: 'sql',
    uploadDate: '2026-07-30',
    chunkCount: 18,
    status: 'indexed',
    tokenCount: 6500,
    previewText: 'DDL and DML schema statements for enterprise transactions, customer telemetry, and product inventory tables.',
  },
];

export const SAMPLE_CHUNKS: DocumentChunk[] = [
  {
    id: 'chk-101',
    documentId: 'doc-1',
    documentName: 'Enterprise_Q3_Revenue_Forecast.pdf',
    content: 'Enterprise ARR grew by 34.2% YoY driven by multi-agent enterprise deployments. Gross margin held steady at 78.4% with recurring API API usage scaling to 1.2M queries per day.',
    pageOrRow: 4,
    score: 0.94,
    embeddingPreview: [0.042, -0.118, 0.892, 0.312, -0.054],
  },
  {
    id: 'chk-102',
    documentId: 'doc-2',
    documentName: 'Customer_Churn_Dataset_2026.csv',
    content: 'Feature correlation analysis indicates that Month-to-Month contracts have a 4.2x higher churn probability compared to 2-year enterprise SLA agreements.',
    pageOrRow: 1,
    score: 0.89,
    embeddingPreview: [-0.089, 0.231, 0.654, -0.112, 0.442],
  },
  {
    id: 'chk-103',
    documentId: 'doc-3',
    documentName: 'NexusAI_Architecture_Whitepaper.pdf',
    content: 'The Planner Agent employs dynamic beam search over execution subgraphs to guarantee non-cyclic execution with max step timeouts.',
    pageOrRow: 12,
    score: 0.86,
    embeddingPreview: [0.124, 0.441, -0.021, 0.771, 0.098],
  },
];

export const SAMPLE_AUTOML_RESULTS: AutoMLResult = {
  datasetName: 'Customer_Churn_Dataset_2026.csv',
  problemType: 'classification',
  rowCount: 7043,
  columnCount: 21,
  missingValuesCleaned: 11,
  featuresEncoded: 8,
  models: [
    { modelName: 'XGBoost Classifier', accuracy: 0.912, f1Score: 0.894, precision: 0.905, recall: 0.884, trainingTimeSec: 2.4, isBest: true },
    { modelName: 'LightGBM Classifier', accuracy: 0.898, f1Score: 0.879, precision: 0.891, recall: 0.868, trainingTimeSec: 1.8, isBest: false },
    { modelName: 'Random Forest', accuracy: 0.875, f1Score: 0.852, precision: 0.864, recall: 0.841, trainingTimeSec: 3.1, isBest: false },
    { modelName: 'Logistic Regression', accuracy: 0.804, f1Score: 0.778, precision: 0.790, recall: 0.767, trainingTimeSec: 0.4, isBest: false },
  ],
  bestModel: 'XGBoost Classifier',
  shapValues: [
    { feature: 'Contract_MonthToMonth', importance: 0.385, impactDirection: 'positive' },
    { feature: 'Tenure_Months', importance: 0.264, impactDirection: 'negative' },
    { feature: 'MonthlyCharges', importance: 0.182, impactDirection: 'positive' },
    { feature: 'InternetService_Fiber', importance: 0.115, impactDirection: 'positive' },
    { feature: 'TechSupport_No', importance: 0.054, impactDirection: 'positive' },
  ],
  confusionMatrix: {
    labels: ['Retained', 'Churned'],
    matrix: [
      [4650, 524],
      [362, 1507],
    ],
  },
  anomalyData: Array.from({ length: 30 }, (_, i) => ({
    index: i + 1,
    timestamp: `2026-07-${(i + 1).toString().padStart(2, '0')}`,
    metricValue: Math.round(150 + Math.random() * 80 + (i === 14 || i === 22 ? 220 : 0)),
    anomalyScore: i === 14 || i === 22 ? 0.94 : Math.round(Math.random() * 0.3 * 100) / 100,
    isAnomaly: i === 14 || i === 22,
  })),
  forecastData: Array.from({ length: 14 }, (_, i) => {
    const base = 500 + i * 25;
    return {
      date: `2026-08-${(i + 1).toString().padStart(2, '0')}`,
      actual: i < 7 ? base + (Math.random() * 40 - 20) : undefined,
      forecast: base,
      upperBound: base + 45,
      lowerBound: base - 45,
    };
  }),
  pythonCode: `import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import classification_report, roc_auc_score
import shap

# 1. Load Data
df = pd.read_csv('Customer_Churn_Dataset_2026.csv')

# 2. Automated Preprocessing & Cleaning
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['TotalCharges'].fillna(df['TotalCharges'].median(), inplace=True)

# 3. Encoding & Feature Engineering
categorical_cols = df.select_dtypes(include=['object']).columns.drop('customerID', errors='ignore')
df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

X = df_encoded.drop(columns=['Churn_Yes', 'customerID'], errors='ignore')
y = df_encoded['Churn_Yes']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 4. Model Training (XGBoost)
model = XGBClassifier(n_estimators=150, learning_rate=0.05, max_depth=5, subsample=0.8, eval_metric='logloss')
model.fit(X_train, y_train)

# 5. Model Evaluation & SHAP Explainability
preds = model.predict(X_test)
print(classification_report(y_test, preds))

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test)`,
};

export const SAMPLE_DATABASE_TABLES: DatabaseTable[] = [
  {
    tableName: 'enterprise_customers',
    rowCount: 1420,
    columns: [
      { name: 'customer_id', type: 'UUID', isPrimaryKey: true },
      { name: 'company_name', type: 'VARCHAR(255)' },
      { name: 'plan_tier', type: 'VARCHAR(50)' },
      { name: 'mrr', type: 'DECIMAL(10,2)' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
    sampleRows: [
      { customer_id: 'c01a94', company_name: 'Acme Cloud Corp', plan_tier: 'Enterprise Platinum', mrr: 12500.00, created_at: '2025-03-15' },
      { customer_id: 'c02b88', company_name: 'Starlight Dynamics', plan_tier: 'Enterprise Gold', mrr: 8400.00, created_at: '2025-06-11' },
      { customer_id: 'c03c77', company_name: 'Apex AI Systems', plan_tier: 'Enterprise Platinum', mrr: 18900.00, created_at: '2025-01-20' },
      { customer_id: 'c04d66', company_name: 'Vanguard Labs', plan_tier: 'Scaleup', mrr: 3200.00, created_at: '2025-09-04' },
    ],
  },
  {
    tableName: 'agent_execution_logs',
    rowCount: 8940,
    columns: [
      { name: 'execution_id', type: 'UUID', isPrimaryKey: true },
      { name: 'agent_role', type: 'VARCHAR(50)' },
      { name: 'tokens_consumed', type: 'INTEGER' },
      { name: 'latency_ms', type: 'INTEGER' },
      { name: 'status', type: 'VARCHAR(20)' },
    ],
    sampleRows: [
      { execution_id: 'e-991', agent_role: 'Planner', tokens_consumed: 1420, latency_ms: 184, status: 'SUCCESS' },
      { execution_id: 'e-992', agent_role: 'ML Engineer', tokens_consumed: 3840, latency_ms: 412, status: 'SUCCESS' },
      { execution_id: 'e-993', agent_role: 'Research', tokens_consumed: 2100, latency_ms: 290, status: 'SUCCESS' },
    ],
  },
];

export const CURRENT_USER: UserSession = {
  username: 'alex.vanguard',
  email: 'fanish050@gmail.com',
  role: 'AI Architect',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYW5pc2gwNTAiLCJyb2xlIjoiQUkgQXJjaGl0ZWN0IiwiaWF0IjoxNzU0MTU4OTk2fQ.nexus-sig-884920412',
  expiresIn: '23h 59m',
  permissions: ['agents:execute', 'automl:train', 'rag:manage', 'sql:query', 'reports:generate', 'admin:access'],
};
