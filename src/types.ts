/**
 * NexusAI - Enterprise Multi-Agent Intelligence Platform
 * Global Types & Specifications
 */

export type AgentRole =
  | 'Planner'
  | 'Research'
  | 'Data Analyst'
  | 'ML Engineer'
  | 'ML Agent'
  | 'Software Engineer'
  | 'Software Agent'
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

// Autonomous Goal Engine Types
export type GoalStage =
  | 'USER_GOAL'
  | 'PLANNER'
  | 'DATA_ANALYST'
  | 'RESEARCH_AGENT'
  | 'ML_AGENT'
  | 'QA_AGENT'
  | 'EXECUTIVE_REPORT'
  | 'COMPLETED';

export type GoalExecutionStateMachineState =
  | 'IDLE'
  | 'INTAKE'
  | 'PLANNING'
  | 'EXECUTING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'ERROR'
  | 'SELF_CORRECTION'
  | 'RETRY'
  | 'FAILED'
  | 'TERMINATED';

export type GoalResponseMode = 'business_simple' | 'technical_detail';

export interface ExecutionContextInfo {
  executionId: string;
  userGoal: string;
  goalType: string;
  targetDataset: string;
}

export interface AgentExecutionSummary {
  inputSources: string[];
  actionsExecuted: string[];
  outputSummary: string;
  whatAgentDid?: string;
}

export interface DataGroundingInfo {
  dataSource: string;
  rowsAnalyzed: number;
  baselinePeriod: string;
  currentPeriod: string;
  baselineRevenue: string;
  currentRevenue: string;
  percentageChange: string;
  methodology: string;
  formula?: string;
}

export interface ResearchProvenanceInfo {
  entityName: string;
  observedFact: string;
  sourceDocument: string;
  retrievedAt: string;
  evidenceConfidence: number;
}

export interface QAValidationCheck {
  name: string;
  status: 'PASSED' | 'FAILED';
  score: string;
  details: string;
}

export interface QANumericalCheck {
  metric: string;
  baselineValue: string;
  currentValue: string;
  calculatedFormula: string;
  evidenceDerivedDelta: string;
  executiveReportedDelta: string;
  isMatch: boolean;
}

export interface QAValidationMetrics {
  goalAlignmentPassed: boolean;
  datasetConsistencyPassed: boolean;
  numericalConsistencyPassed: boolean;
  agentAgreementPassed: boolean;
  evidenceGroundingPassed: boolean;
  shapProvenancePassed: boolean;
  ragCitationValidationPassed: boolean;
  executiveReportConsistencyPassed: boolean;
  overallConfidence: number;
  qaScore: number;
  qaStatus: 'PASSED' | 'FAILED';
  checks: QAValidationCheck[];
  numericalChecks: QANumericalCheck[];
}

export interface ShapAttributionFactor {
  feature: string;
  meanAbsoluteShap: number;
  normalizedContribution: number;
  businessExplanation: string;
  category: string;
}

export interface TechnicalEvidenceSummary {
  dataset: string;
  recordsAnalyzed: number;
  model: string;
  explainabilityMethod: string;
  targetVariable: string;
  mlAlgorithm: string;
  shapFactors: ShapAttributionFactor[];
  modelMetrics: Record<string, string>;
  ragSources: Array<{ title: string; sourceDoc: string; matchScore: number; verified: boolean }>;
  qaScore: number;
  qaStatus: string;
  confidence: number;
  toolCalls: number;
  durationMs: number;
  executionTrace?: Array<{ step: string; agent: string; latencyMs: number; status: string }>;
}

export interface ExecutiveCauseItem {
  factor: string;
  simpleExplanation: string;
  technicalEvidence: string;
  normalizedShap?: number;
  meanAbsoluteShap?: number;
}

export interface ExecutiveActionItem {
  timeframe?: string;
  title: string;
  simpleAction: string;
}

export interface ExecutiveSummaryStructured {
  finding: string;
  headline: string;
  whyItHappened: ExecutiveCauseItem[];
  topCauses: string[];
  recommendedActions: ExecutiveActionItem[];
  actionPlan: string[];
  technicalEvidenceSummary?: TechnicalEvidenceSummary;
}

export interface GoalPipelineNode {
  id: string;
  executionId: string;
  executionContext: ExecutionContextInfo;
  stage: GoalStage;
  title: string;
  agentRole: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs: number;
  thought?: string;
  whatAgentDid?: string;
  executionSummary: AgentExecutionSummary;
  output: string;
  metrics?: Record<string, string>;
  dagPlan?: string[];
  dataHighlights?: Array<{ segment: string; revenueDrop: string; churnRate: string; primaryDriver: string }>;
  dataGrounding?: DataGroundingInfo;
  researchProvenance?: ResearchProvenanceInfo[];
  citations?: string[];
  mlMetrics?: { Model: string; Accuracy: string; RMSE: string; TopDriver: string; Method: string; Target?: string };
  shapFactors?: ShapAttributionFactor[];
  qaChecks?: Array<{ check: string; status: string; score: string }>;
  qaValidation?: QAValidationMetrics;
  reportTitle?: string;
  reportType?: string;
  parallelBranch?: 'branch-a' | 'branch-b' | 'none';
}

export interface GoalExecutionResult {
  executionId: string;
  executionContext: ExecutionContextInfo;
  goal: string;
  goalType: 'sales_revenue' | 'customer_churn' | 'competitor_pricing' | 'global_audit' | 'custom';
  status: 'running' | 'completed' | 'failed';
  executionState: GoalExecutionStateMachineState;
  executedAt: string;
  totalDurationMs: number;
  totalTasks: number;
  completedTasks: number;
  totalAgents: number;
  totalToolCalls: number;
  totalRetries: number;
  overallConfidence: number;
  qaScore?: number;
  qaStatus?: 'PASSED' | 'FAILED';
  qa?: {
    score: number;
    status: 'PASSED' | 'FAILED';
  };
  timeline: Array<{ stageTitle: string; agentRole: string; durationMs: number; status: string }>;
  nodes: GoalPipelineNode[];
  finalReport?: {
    reportType: string;
    title: string;
    markdown: string;
  };
  executiveSummary?: ExecutiveSummaryStructured;
  technicalEvidence?: TechnicalEvidenceSummary;
  qaValidation?: QAValidationMetrics;
}

// ==========================================
// AUTONOMOUS BROWSER RESEARCH AGENT TYPES
// ==========================================

export type ResearchType =
  | 'JOB_HIRING'
  | 'TECHNOLOGY_COMPARISON'
  | 'COMPANY_COMPARISON'
  | 'MARKET_INTELLIGENCE'
  | 'COMPETITOR_ANALYSIS'
  | 'STARTUP_RESEARCH'
  | 'RESEARCH_PAPER'
  | 'PRODUCT_COMPARISON'
  | 'GENERAL_WEB_RESEARCH';

export type SourceType =
  | 'Official Company Website'
  | 'Official Careers Portal'
  | 'Official Documentation'
  | 'Official Repository'
  | 'Technical Blog'
  | 'Release Notes'
  | 'Government Website'
  | 'University Website'
  | 'Job Board'
  | 'News Website'
  | 'Research Paper'
  | 'Blog'
  | 'Community Forum'
  | 'Social Media'
  | 'Unknown';

export type ReliabilityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ClassifiedSource {
  url: string;
  domain: string;
  sourceType: SourceType;
  title: string;
  crawlTimestamp: string;
  httpStatus: number;
  isOfficial: boolean;
  reliabilityLevel: ReliabilityLevel;
}

export type ClaimCategory =
  | 'Open Position'
  | 'Fresher Eligibility'
  | 'Experience Requirement'
  | 'Location'
  | 'Salary'
  | 'Internship'
  | 'Campus Hiring'
  | 'Off-Campus Hiring'
  | 'Technology Requirement'
  | 'Application Deadline'
  | 'Benefits'
  | 'Company Information';

export type PrimaryVerificationState =
  | 'VERIFIED'
  | 'PARTIALLY VERIFIED'
  | 'UNVERIFIED'
  | 'UNKNOWN'
  | 'CONFLICT';

export type EvidenceStrength = 'DIRECT' | 'INFERRED' | 'CORROBORATED' | 'CONFLICTING';

export type InformationType = 'RETRIEVED' | 'COMPUTED' | 'INFERRED' | 'RECOMMENDED';

export type ClaimField =
  | 'companyName'
  | 'companyDescription'
  | 'fundingStage'
  | 'jobTitle'
  | 'jobLocation'
  | 'jobStatus'
  | 'fresherEligibility'
  | 'experienceRequirement'
  | 'salary'
  | 'technologyRequirements'
  | 'applicationDeadline'
  | 'postingDate'
  | 'updatedDate'
  | 'general';

export type JobStatus = 'OPEN' | 'CLOSED' | 'EXPIRED' | 'UNKNOWN' | 'POSSIBLY STALE';

export interface ExactEvidence {
  sourceUrl: string;
  pageTitle: string;
  extractedText: string;
  elementSelector?: string;
  crawlTimestamp: string;
  sourceDomain: string;
  sourceType: SourceType;
  isExactDOMQuote: boolean;
}

export interface CellVerification {
  status: PrimaryVerificationState;
  evidenceStrength?: EvidenceStrength;
  evidence?: string;
  whyTrustThis?: string;
  informationType?: InformationType;
  sourceUrl?: string;
  sourceType?: SourceType;
  freshness?: string;
  isJobLevel?: boolean;
}

export type BrowserActionType =
  | 'SEARCH'
  | 'NAVIGATE'
  | 'EXTRACT'
  | 'VERIFY_DATE'
  | 'COLLECT_EVIDENCE'
  | 'CLICK'
  | 'SCROLL';

export interface BrowserLiveAction {
  id: string;
  executionId?: string;
  actionType: BrowserActionType;
  targetUrl?: string;
  domain?: string;
  title?: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  extractedSnippet?: string;
  elementSelector?: string;
  httpStatus?: number;
  latencyMs?: number;
  sourceType?: SourceType;
}

export interface VerifiedClaim {
  id: string; // unique ID
  claimId: string;
  executionId: string;
  claim: string; // text of claim
  claimText?: string;
  field?: ClaimField;
  value?: string;
  category: ClaimCategory | string;
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string;
  sourceType?: SourceType;
  evidence: string; // extracted text quote
  evidenceText?: string;
  extractedEvidence?: ExactEvidence;
  timestamp: string;
  extractionTimestamp?: string;
  confidence: number; // 0 - 100
  confidenceExplanation?: string;
  verificationStatus: PrimaryVerificationState | 'HIGH_CONFIDENCE' | 'CROSS_CHECKED' | 'UNCONFIRMED';
  crossSourceMatchesCount?: number;
  crossSourceSources?: string[];
  conflictDetected?: boolean;
  conflictDetails?: string;
  freshnessStatus?: string;
  postedDate?: string;
  jobStatus?: JobStatus;
  duplicateGroupId?: string;
  provenanceChain?: string[];
  entityName?: string;
  informationType?: InformationType;
  evidenceStrength?: EvidenceStrength;
  isJobLevel?: boolean;
  whyTrustThis?: string;
}

export interface CompanyComparisonItem {
  id: string;
  executionId?: string;
  companyName: string; // Acts as entityName
  tierOrType: string;
  evidenceStrength?: EvidenceStrength;

  // Hiring specific fields (used when researchType === 'JOB_HIRING')
  location?: string;
  fresherEligible?: 'Yes' | 'No' | 'Not stated' | 'UNKNOWN';
  experienceRequired?: string;
  currentOpeningsCount?: number;
  currentOpening?: string;
  fresherOpenings?: string[];
  keyRoles?: string[];
  jobStatus?: JobStatus;
  salaryOrStipendRange?: string;
  salary?: string;
  techStack?: string[];
  fundingStage?: string;
  fundingStageFreshness?: string;
  fundingEvidence?: string;
  applicationDeadline?: string;
  applicationUrl?: string;

  // Technology comparison specific fields (used when researchType === 'TECHNOLOGY_COMPARISON')
  maintainer?: string;
  repositoryUrl?: string;
  license?: string;
  openSourceStatus?: string;
  architecture?: string;
  multiAgentSupport?: string;
  workflowOrchestration?: string;
  memoryAndRag?: string;
  humanInTheLoop?: string;
  deploymentOptions?: string;
  observability?: string;
  enterpriseFeatures?: string;
  latestVersion?: string;
  githubActivity?: string;

  // Generic / Custom research fields
  categoryOrDomain?: string;
  primaryAttributes?: Record<string, string>;

  // Common verification & citation fields
  lastVerifiedDate?: string;
  postedDate?: string;
  freshnessDays?: string;
  hiringStatus?: string;
  overallVerificationStatus?: PrimaryVerificationState;
  cellVerifications?: Record<string, CellVerification>;
  evidenceQuotes?: string[];
  sourceCitations?: string[];
  confidenceScore: number;
  sourceName?: string;
  sourceUrl?: string;
  evidenceStatus?: PrimaryVerificationState;
  freshness?: string;
}

export interface CandidateExclusionReason {
  candidateName: string;
  status: 'VERIFIED' | 'EXCLUDED' | 'PARTIAL';
  reason: string;
  evidenceStrength?: EvidenceStrength;
}

export interface ResearchDecision {
  decisionStatus: 'FULL_ANSWER' | 'PARTIAL_ANSWER' | 'INSUFFICIENT_EVIDENCE';
  requestedCount: number;
  verifiedCount: number;
  requestedConcept: string;
  exclusionSummary: CandidateExclusionReason[];
  recommendation: string;
}

export interface BrowserResearchDAGStage {
  id: string;
  executionId?: string;
  stage:
    | 'PLANNER'
    | 'BROWSER_AGENT'
    | 'RESEARCH_AGENT'
    | 'CLAIM_EXTRACTION'
    | 'FIELD_VERIFICATION'
    | 'CONFLICT_AUDIT'
    | 'QA_AUDIT'
    | 'RESEARCH_DECISION'
    | 'COMPARISON'
    | 'EXECUTIVE_REPORT'
    | 'RAG_SYNC';
  title: string;
  agentRole: string;
  status: 'pending' | 'running' | 'completed';
  durationMs: number;
  summary: string;
  details: string[];
}

export interface ResearchQAMetrics {
  executionId: string;
  totalChecks: number;
  passedChecks: number;
  status: 'PASSED' | 'PARTIALLY_PASSED' | 'FAILED';
  checks: {
    id: string;
    name: string;
    passed: boolean;
    details: string;
  }[];
}

export interface ToolCallStats {
  plannerCalls: number;
  browserCalls: number;
  researchCalls: number;
  verificationCalls: number;
  ragCalls: number;
}

export interface BrowserResearchMetrics {
  pagesVisited: number;
  officialSources: number;
  secondarySources: number;
  claimsExtracted: number;
  verifiedClaims: number;
  partiallyVerifiedClaims: number;
  unverifiedClaims: number;
  unknownClaims?: number;
  conflictsDetected: number;
  duplicatesGrouped: number;
  companiesResearched?: number;
  companiesWithVerifiedOpenings?: number;
  partiallyVerifiedCompanies?: number;
  unableToVerifyCompanies?: number;
  criticalClaimsVerified?: string;
  evidenceCoveragePercentage?: number;
}

export interface RAGSyncDetails {
  executionId: string;
  status: 'Ready' | 'Indexed' | 'Failed';
  eligibleVerifiedClaimsCount: number;
  skippedUnverifiedClaimsCount: number;
  indexedCount: number;
  failedCount: number;
  indexedDocumentIds: string[];
}

export interface BrowserResearchResult {
  executionId: string;
  query: string;
  researchType?: ResearchType;
  entityTerm?: string; // e.g. "Frameworks", "Companies", "Products", "Startups"
  comparisonMatrixTitle?: string; // e.g. "Technology Comparison Matrix", "Company Comparison Matrix"
  comparisonMatrixSubtitle?: string; // e.g. "Multi-Framework Enterprise Comparison"
  executedAt: string;
  totalDurationMs: number;
  searchMode?: 'deep' | 'fast' | 'exhaustive';
  pipelineStatus?: string;

  metrics?: BrowserResearchMetrics;
  toolCallStats?: ToolCallStats;
  qaResults?: ResearchQAMetrics;
  researchDecision?: ResearchDecision;
  ragSync?: RAGSyncDetails;
  classifiedSources?: ClassifiedSource[];

  pagesVisitedCount: number;
  claimsVerifiedCount: number;
  overallConfidence: number;
  dagStages: BrowserResearchDAGStage[];
  browserActions: BrowserLiveAction[];
  companies: CompanyComparisonItem[];
  claims: VerifiedClaim[];
  markdownReport: string;
  executiveSummary: {
    headline: string;
    keyFindings: string[];
    recommendations: string[];
    recommendedActions?: string[];
  };
  indexedToRag: boolean;
  ragDocId?: string;
}




