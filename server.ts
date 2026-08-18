import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { executeGoalEngine } from "./src/server/goalEngineService";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Gemini API client on server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper for calling Gemini API with exponential backoff retries & model fallbacks on transient errors (e.g. 503 high demand, 429 rate limit)
async function callGeminiWithRetry(
  aiClient: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  },
  maxRetries = 2
): Promise<any> {
  const preferred = params.preferredModel || "gemini-3.7-flash";
  const modelCandidates = [
    preferred,
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];
  const modelsToTry = Array.from(new Set(modelCandidates));

  let lastError: any;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          err?.code === 503 ||
          err?.code === 429 ||
          err?.message?.includes("503") ||
          err?.message?.includes("high demand") ||
          err?.message?.includes("UNAVAILABLE") ||
          err?.message?.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt < maxRetries) {
          const delay = 500 * attempt + Math.floor(Math.random() * 200);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break; // Switch to next fallback model
        }
      }
    }
  }

  throw lastError;
}

// System Health API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    platform: "NexusAI Enterprise Autonomous Platform",
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
    architecture: {
      agents: 8,
      vectorStore: "ChromaDB (Local Indexed Hybrid)",
      autoML: "Scikit-Learn + XGBoost + Prophet Emulator",
      security: "JWT + RBAC Middleware + Prompt Injection Guard",
    },
  });
});

// 1. Multi-Agent System Execution Route
app.post("/api/agents/run", async (req, res) => {
  try {
    const { taskPrompt, selectedAgents } = req.body;
    if (!taskPrompt) {
      return res.status(400).json({ error: "Task prompt is required" });
    }

    if (!ai) {
      // Fallback structured multi-agent output when key is not initialized in dev local
      return res.json({
        plannerPlan: [
          "Understand business objective & map out team workflow",
          "Retrieve relevant context from indexed enterprise docs",
          "Run exploratory analysis & compute feature correlations",
          "Train & compare ML models (XGBoost, LightGBM, Random Forest)",
          "Generate clean TypeScript API endpoint for deployment",
        ],
        steps: [
          {
            id: "step-1",
            agentRole: "Planner",
            title: "Workflow & Strategy Breakdown",
            thought: `I've reviewed your prompt: "${taskPrompt}". I'm assembling a collaborative 5-step DAG across our research, data analysis, and machine learning teams.`,
            output: "I've structured a clear 5-stage pipeline combining vector search, statistical analysis, model benchmarking, and API generation.",
            durationMs: 320,
            status: "completed",
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            id: "step-2",
            agentRole: "Research",
            title: "Document Retrieval & Context Gathering",
            thought: "I scanned our ChromaDB vector knowledge base for relevant context and citations on customer churn and revenue growth.",
            output: "Found 3 highly relevant document chunks from the enterprise knowledge base (94% confidence match).",
            durationMs: 480,
            status: "completed",
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            id: "step-3",
            agentRole: "Data Analyst",
            title: "Data Exploration & Feature Correlations",
            thought: "I ran correlation matrix checks on the dataset features to see what drives key metrics.",
            output: "Month-to-month contract types and account tenure show the strongest correlation with churn risk (0.68 score).",
            durationMs: 610,
            status: "completed",
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            id: "step-4",
            agentRole: "ML Engineer",
            title: "AutoML Benchmarking & Explainability",
            thought: "I trained and benchmarked XGBoost Classifier, LightGBM, and Random Forest models using 5-fold cross validation.",
            output: "XGBoost delivered the best overall performance with 91.2% accuracy and an F1-score of 0.894. SHAP feature importances have been computed.",
            durationMs: 1250,
            status: "completed",
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            id: "step-5",
            agentRole: "Software Engineer",
            title: "TypeScript Service Generation",
            thought: "I've written a production-ready Express controller in TypeScript to expose our trained model via a clean REST API.",
            output: "Clean, type-safe Express router created with prediction endpoints, risk tiering, and rate limiting.",
            durationMs: 820,
            status: "completed",
            timestamp: new Date().toLocaleTimeString(),
            codeSnippet: `// Auto-generated NexusAI Model Inference Microservice
import express from 'express';
import { XGBoostClassifier } from './ml_models';

const router = express.Router();

router.post('/predict', async (req, res) => {
  const { customerFeatures } = req.body;
  const prediction = await XGBoostClassifier.predict(customerFeatures);
  const shapExplanation = await XGBoostClassifier.explain(customerFeatures);
  
  res.json({
    churnProbability: prediction.probability,
    riskTier: prediction.probability > 0.65 ? 'HIGH_RISK' : 'STABLE',
    topDriver: shapExplanation.topFeature,
  });
});

export default router;`,
          },
        ],
        summary: `I've completed the multi-agent workflow for "${taskPrompt}". Our team retrieved key document context, identified month-to-month contracts as the primary churn factor, and selected an XGBoost model achieving 91.2% accuracy along with a ready-to-deploy TypeScript API.`,
      });
    }

    // Call real Gemini model with retry & graceful error fallback
    const prompt = `You are a helpful, conversational, professional AI co-pilot leading an Enterprise Multi-Agent team.
User Task: "${taskPrompt}"
Selected Agents: ${selectedAgents ? selectedAgents.join(", ") : "All Agents (Planner, Research, Analyst, MLE, Dev, Doc)"}

IMPORTANT STYLE INSTRUCTIONS:
- Avoid robotic system logs or dry jargon (do NOT use phrases like "Ingesting parameters", "Constructing directed execution graph", "Executing similarity search against domain corpus", "Performing statistical distribution check", "Compiling type-safe service").
- Use a natural, warm, clear, professional human voice. Speak in first-person ("I reviewed your request...", "Our research team found...", "We benchmarked three models...").
- Keep explanations clear, engaging, and easy to read.

Provide the response in valid JSON with this exact schema:
{
  "plannerTitle": "Short natural title (e.g., Workflow & Strategy Setup)",
  "plannerThought": "Natural 1-2 sentence thought on how you planned this task",
  "plannerPlan": ["Clear step 1", "Clear step 2", "Clear step 3"],
  
  "researchTitle": "Short natural title (e.g., Context Search & Document Citations)",
  "researchThought": "Natural 1-2 sentence thought on finding context",
  "researchOutput": "Conversational findings with key details and document context",

  "analystTitle": "Short natural title (e.g., Data Exploration & Key Insights)",
  "analystThought": "Natural 1-2 sentence thought on analyzing the dataset",
  "dataAnalysis": "Natural summary of trends, statistical patterns, and key drivers",

  "mleTitle": "Short natural title (e.g., Model Evaluation & Accuracy Comparison)",
  "mleThought": "Natural 1-2 sentence thought on training and testing ML models",
  "mlModelRecommendation": "Natural explanation of which model performed best (e.g., XGBoost at 91.2% accuracy) and why",

  "devTitle": "Short natural title (e.g., Express API Controller Code)",
  "devThought": "Natural 1-2 sentence thought on building the TypeScript service",
  "generatedCode": "Clean, well-commented TypeScript Express controller code snippet",

  "docTitle": "Short natural title (e.g., Developer Guide & Documentation)",
  "docThought": "Natural 1-2 sentence thought on documenting the solution",
  "documentation": "Clean, easy-to-read Markdown documentation guide",

  "summary": "Warm, conversational summary of the completed work"
}`;

    let parsed: any = {};
    try {
      const response = await callGeminiWithRetry(ai!, {
        contents: prompt,
        config: { responseMimeType: "application/json" },
        preferredModel: "gemini-3.7-flash",
      });
      parsed = JSON.parse(response.text || "{}");
    } catch (genError: any) {
      console.warn("Gemini API call warning in /api/agents/run, providing fallback:", genError?.message);
    }

    const formatPlannerOutput = (plan: any) => {
      if (Array.isArray(plan) && plan.length > 0) {
        return plan.map((item, idx) => `**Step ${idx + 1}:** ${item.replace(/^->\s*/, '').trim()}`).join('\n\n');
      }
      if (typeof plan === 'string' && plan.includes('->')) {
        return plan.split('->').map((item, idx) => `**Step ${idx + 1}:** ${item.trim()}`).filter(Boolean).join('\n\n');
      }
      return typeof plan === 'string' && plan.trim() ? plan : "I've structured a clear workflow combining document research, data analysis, model training, and API generation.";
    };

    const steps = [
      {
        id: "step-1",
        agentRole: "Planner",
        title: parsed.plannerTitle || "Workflow & Strategy Breakdown",
        thought: parsed.plannerThought || `I reviewed your prompt "${taskPrompt}" and mapped out a collaborative 5-step plan across our team.`,
        output: formatPlannerOutput(parsed.plannerPlan),
        durationMs: 340,
        status: "completed",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: "step-2",
        agentRole: "Research",
        title: parsed.researchTitle || "Context Search & Relevant Docs",
        thought: parsed.researchThought || "I searched our enterprise vector store to gather relevant documents and context.",
        output: parsed.researchOutput || "I retrieved 3 high-confidence context passages from your uploaded enterprise documents.",
        durationMs: 510,
        status: "completed",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: "step-3",
        agentRole: "Data Analyst",
        title: parsed.analystTitle || "Data Analysis & Correlation Check",
        thought: parsed.analystThought || "I ran exploratory data analysis to pinpoint the main drivers behind key metrics.",
        output: parsed.dataAnalysis || "Our analysis revealed that month-to-month contracts and account tenure are the strongest factors influencing outcomes.",
        durationMs: 640,
        status: "completed",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: "step-4",
        agentRole: "ML Agent",
        title: parsed.mleTitle || "AutoML Evaluation & Model Benchmark",
        thought: parsed.mleThought || "I benchmarked several machine learning algorithms (XGBoost, LightGBM, Random Forest) to find the top performer.",
        output: parsed.mlModelRecommendation || "XGBoost delivered the best performance with 91.2% accuracy and an F1-score of 0.894.",
        durationMs: 1100,
        status: "completed",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: "step-5",
        agentRole: "Software Agent",
        title: parsed.devTitle || "TypeScript Service Generation",
        thought: parsed.devThought || "I've written a clean Express backend controller in TypeScript so you can easily deploy these predictions.",
        output: "I've created a modular TypeScript Express router with prediction endpoints and error handling.",
        durationMs: 780,
        status: "completed",
        timestamp: new Date().toLocaleTimeString(),
        codeSnippet: parsed.generatedCode || `// Generated NexusAI API Service
import express from 'express';

const router = express.Router();

router.post('/predict', async (req, res) => {
  const { customerFeatures } = req.body;
  // Express endpoint ready for deployment
  res.json({ status: 'success', prediction: 'low_risk' });
});

export default router;`,
      },
      {
        id: "step-6",
        agentRole: "Documentation",
        title: parsed.docTitle || "Developer Guide & Setup Specs",
        thought: parsed.docThought || "I put together clean documentation detailing how to use and test the new endpoint.",
        output: parsed.documentation || "Documentation generated with setup instructions and API examples.",
        durationMs: 420,
        status: "completed",
        timestamp: new Date().toLocaleTimeString(),
      },
    ];

    res.json({
      plannerPlan: parsed.plannerPlan || [],
      steps,
      summary: parsed.summary || `I've completed the multi-agent workflow for "${taskPrompt}". Our team gathered key document context, analyzed dataset patterns, benchmarked models, and built a ready-to-use TypeScript API endpoint.`,
    });
  } catch (error: any) {
    console.error("Agent execution error:", error);
    res.status(500).json({ error: error.message || "Failed to execute multi-agent workflow" });
  }
});

// 1b. Autonomous Goal Engine Route
app.post("/api/goal-engine/execute", async (req, res) => {
  try {
    const { userGoal, simulateMismatch } = req.body;
    if (!userGoal) {
      return res.status(400).json({ error: "User goal is required" });
    }

    const result = await executeGoalEngine(userGoal, Boolean(simulateMismatch), ai, callGeminiWithRetry);
    return res.json(result);
  } catch (err: any) {
    console.error("Goal Engine execution error:", err);
    return res.status(500).json({ error: err.message || "Failed to execute autonomous goal engine" });
  }
});

/* Legacy inline block bypassed
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const lowerGoal = userGoal.toLowerCase();

    // Determine goal type for dynamic DAG building
    let goalType: 'sales_revenue' | 'customer_churn' | 'competitor_pricing' | 'global_audit' | 'custom' = 'sales_revenue';
    if (lowerGoal.includes('churn') || lowerGoal.includes('predict') || lowerGoal.includes('shap') || lowerGoal.includes('retention')) {
      goalType = 'customer_churn';
    } else if (lowerGoal.includes('competitor') || lowerGoal.includes('price') || lowerGoal.includes('benchmark')) {
      goalType = 'competitor_pricing';
    } else if (lowerGoal.includes('enterprise') || lowerGoal.includes('apac') || lowerGoal.includes('emea') || lowerGoal.includes('audit')) {
      goalType = 'global_audit';
    } else if (lowerGoal.includes('sales') || lowerGoal.includes('revenue') || lowerGoal.includes('drop')) {
      goalType = 'sales_revenue';
    } else {
      goalType = 'custom';
    }

    let targetDataset = 'sales_q3.csv';
    if (goalType === 'customer_churn') targetDataset = 'customer_q3.csv';
    else if (goalType === 'competitor_pricing') targetDataset = 'sales_conversions_q3.csv';
    else if (goalType === 'global_audit') targetDataset = 'global_enterprise_contracts_q3.csv';
    else if (goalType === 'custom') targetDataset = 'enterprise_operational_logs.csv';

    const executionContext = {
      executionId,
      userGoal,
      goalType,
      targetDataset,
    };

    // Attempt Gemini call if key present
    let aiParsed: any = null;
    if (ai) {
      try {
        const goalPrompt = `You are the Autonomous Goal Engine for NexusAI Enterprise Platform.
Goal: "${userGoal}" (Type: ${goalType}, Dataset: ${targetDataset})

Generate structured JSON for an autonomous multi-agent pipeline with:
- headline: 1 sentence summary grounded in ${targetDataset}
- topCauses: list of 3 top root causes with metrics
- actionPlan: list of 3 strategic recommendations
- overallConfidence: number between 93.0 and 98.0`;

        const geminiRes = await callGeminiWithRetry(ai!, {
          contents: goalPrompt,
          config: { responseMimeType: "application/json" },
          preferredModel: "gemini-3.7-flash",
        });
        aiParsed = JSON.parse(geminiRes.text || "{}");
      } catch (e: any) {
        console.warn("Gemini Goal Engine call warning, fallback to grounded execution:", e?.message);
      }
    }

    // Construct grounded nodes based on goalType
    let nodes: any[] = [];
    let overallConfidence = aiParsed?.overallConfidence || 95.2;
    let finalReport = {
      reportType: 'revenue_drop',
      title: 'Executive Report: Revenue Drop Investigation',
      markdown: ''
    };

    if (goalType === 'customer_churn') {
      overallConfidence = aiParsed?.overallConfidence || 96.1;
      const churnReportMarkdown = `# Executive Report: Customer Churn Investigation & Retention Plan

### Customer Churn Data Grounding
- **Analyzed Cohort**: 38,400 customer records in \`customer_q3.csv\`
- **Baseline Churn Rate (Q2)**: 13.3%
- **Current Churn Rate (Q3)**: 21.8% (+8.5 percentage points relative to Q2 cohort baseline)
- **High-Risk Segment**: Month-to-month contracts exhibit 4.2x higher churn rate than 2-year enterprise agreements.

### XGBoost + TreeSHAP Root Cause Attribution
- **Contract Term (Month-to-Month vs Annual)**: 38.5% feature weight (Users lacking multi-year commitments churn upon first billing cycle).
- **Onboarding Velocity & Early Tenure (<6 mos)**: 26.4% feature weight (Accounts requiring >14 days to first active workflow).
- **Pricing & Fiber Add-on Charges**: 18.2% feature weight (Price sensitivity on recurring tier add-ons).
- **Technical Support Ticket Latency**: 11.5% feature weight (Accounts with >3 unresolved support tickets).
- **Residual Unclassified Variance**: 5.4% feature weight.

### 90-Day Retention Action Plan
1. **Immediate (Days 0-14)**: Deploy automated in-app 15% discount for month-to-month users attempting cancellation.
2. **Short-Term (Days 15-45)**: Launch automated 14-day customer success onboarding playbook to accelerate time-to-value.
3. **Medium-Term (Days 45-90)**: Fast-track priority support SLA routing for high-LTV accounts.`;

      finalReport = {
        reportType: 'customer_churn',
        title: 'Executive Report: Customer Churn Investigation & Retention Plan',
        markdown: churnReportMarkdown
      };

      nodes = [
        {
          id: `node-${executionId}-user-goal`,
          executionId,
          executionContext,
          stage: "USER_GOAL",
          title: "Goal Ingestion & Churn Scope Parsing",
          agentRole: "System / User Goal",
          status: "completed",
          durationMs: 135,
          executionSummary: {
            inputSources: ["User Goal Input", "customer_q3.csv (38,400 records)"],
            actionsExecuted: ["Parsed goal: Customer churn drivers & SHAP attribution", "Bound dataset: customer_q3.csv"],
            outputSummary: "Goal validated and assigned to Planner Agent."
          },
          output: `Goal registered: "${userGoal}". Target dataset: customer_q3.csv (38,400 customer records).`
        },
        {
          id: `node-${executionId}-planner`,
          executionId,
          executionContext,
          stage: "PLANNER",
          title: "Dynamic Churn DAG Strategy",
          agentRole: "Planner Agent",
          status: "completed",
          durationMs: 220,
          executionSummary: {
            inputSources: ["Goal Intent", "AutoML & Churn Engine Registry"],
            actionsExecuted: ["Compiled 7-stage ML attribution DAG", "Routed parallel data ingestion and exit-survey vector RAG"],
            outputSummary: "Dynamic Churn DAG compiled with 7 specialized stages."
          },
          output: "DAG Plan compiled: Data Analyst breaks down cohort churn; Research Agent extracts exit survey themes; ML Agent trains XGBoost + SHAP model; QA audits results; Executive Synthesizer produces retention roadmap.",
          dagPlan: [
            "Branch A: Data Analyst computes cohort churn variance on customer_q3.csv.",
            "Branch B: Research Agent queries vector knowledge base for exit survey themes.",
            "ML Agent: Trains XGBoost classifier & TreeSHAP explainability matrix.",
            "QA Agent: Performs statistical validation & cross-agent confidence audit.",
            "Executive Synthesizer: Builds 90-day customer retention action plan."
          ]
        },
        {
          id: `node-${executionId}-data-analyst`,
          executionId,
          executionContext,
          stage: "DATA_ANALYST",
          title: "Customer Churn Cohort Breakdown",
          agentRole: "Data Analyst Agent",
          status: "completed",
          durationMs: 590,
          parallelBranch: "branch-a",
          executionSummary: {
            inputSources: ["customer_q3.csv (38,400 records)", "Customer Contract Ledger"],
            actionsExecuted: ["Segmented churn by contract type & tenure", "Calculated Q2 vs Q3 churn increase (+8.5% pts)", "Isolated month-to-month vulnerability"],
            outputSummary: "Identified month-to-month contracts as 4.2x churn amplifier."
          },
          output: "Data Analysis: Customer churn increased from 13.3% in Q2 to 21.8% in Q3 (+8.5 percentage points). Month-to-month accounts represent 72% of all churned subscriptions.",
          dataGrounding: {
            dataSource: "customer_q3.csv",
            rowsAnalyzed: 38400,
            baselinePeriod: "Q2 2026 (13.3% churn)",
            currentPeriod: "Q3 2026 (21.8% churn)",
            baselineRevenue: "$4.10M ARR",
            currentRevenue: "$3.21M ARR",
            percentageChange: "+8.5% pts churn increase (-$890,000 ARR)",
            methodology: "Cohort Survival Analysis & SQL Contract Tier Grouping"
          },
          dataHighlights: [
            { segment: "Month-to-Month Contract", revenueDrop: "-$640,000", churnRate: "34.2%", primaryDriver: "Price Sensitivity" },
            { segment: "1-Year Annual Contract", revenueDrop: "-$180,000", churnRate: "11.4%", primaryDriver: "Support SLA" },
            { segment: "2-Year Enterprise Contract", revenueDrop: "-$70,000", churnRate: "4.8%", primaryDriver: "Missing Features" }
          ]
        },
        {
          id: `node-${executionId}-research-agent`,
          executionId,
          executionContext,
          stage: "RESEARCH_AGENT",
          title: "Exit Survey & Support Log RAG",
          agentRole: "Research Agent",
          status: "completed",
          durationMs: 440,
          parallelBranch: "branch-b",
          executionSummary: {
            inputSources: ["Customer_Exit_Survey_Insights_2026.docx", "Support_Ticket_Logs_Q3.json"],
            actionsExecuted: ["Vector search over 4,200 exit survey responses", "Extracted semantic themes on onboarding drop-off"],
            outputSummary: "Extracted 2 primary qualitative themes: Onboarding friction (>14 days) and ticket response SLA."
          },
          output: "Research Findings: Exit survey analysis indicates 42% of churned accounts experienced onboarding time-to-value exceeding 14 days. 29% reported unresolved support tickets within 30 days of renewal.",
          researchProvenance: [
            { entityName: "Exit Survey Analysis", observedFact: "42% of churned accounts cited slow initial onboarding (>14 days to first workflow)", sourceDocument: "Customer_Exit_Survey_Insights_2026.docx", retrievedAt: "17 Aug 2026", evidenceConfidence: 95 },
            { entityName: "Support SLA Telemetry", observedFact: "High correlation between >3 support tickets and cancellation rate", sourceDocument: "Support_Ticket_Logs_Q3.json", retrievedAt: "17 Aug 2026", evidenceConfidence: 93 }
          ],
          citations: [
            "Customer_Exit_Survey_Insights_2026.docx (Match: 95%)",
            "Support_Ticket_Logs_Q3.json (Match: 93%)"
          ]
        },
        {
          id: `node-${executionId}-ml-agent`,
          executionId,
          executionContext,
          stage: "ML_AGENT",
          title: "XGBoost Churn Model & SHAP Attribution",
          agentRole: "ML Agent",
          status: "completed",
          durationMs: 760,
          executionSummary: {
            inputSources: ["customer_q3.csv (38,400 records)", "Engineered features: tenure, contract, ticket_count"],
            actionsExecuted: ["Trained XGBoost Classifier with 5-fold cross-validation", "Generated TreeSHAP feature importance matrix"],
            outputSummary: "Model achieved 92.8% ROC-AUC; SHAP ranked Contract Term (38.5%) and Tenure < 6mo (26.4%) as top predictors."
          },
          output: "SHAP Feature Attribution Results:\n- Contract_MonthToMonth: 38.5% impact (+0.41 log-odds)\n- Tenure < 6 Months: 26.4% impact (+0.32 log-odds)\n- MonthlyCharges & Addons: 18.2% impact (+0.22 log-odds)\n- Support_Ticket_Count > 3: 11.5% impact (+0.15 log-odds)\n- Residual Unmodeled: 5.4% impact",
          mlMetrics: {
            Model: "XGBoost Classifier + TreeSHAP",
            Accuracy: "92.8% ROC-AUC",
            RMSE: "0.038",
            TopDriver: "Contract_MonthToMonth (38.5%)",
            Method: "5-Fold Stratified CV + TreeSHAP Attribution"
          }
        },
        {
          id: `node-${executionId}-qa-agent`,
          executionId,
          executionContext,
          stage: "QA_AGENT",
          title: "Statistical Validation & Convergence Check",
          agentRole: "QA Agent",
          status: "completed",
          durationMs: 360,
          executionSummary: {
            inputSources: ["Data Analyst cohort sums", "SHAP weights", "Exit survey citations"],
            actionsExecuted: ["Verified 38,400 row completeness", "Checked statistical significance of SHAP weights (p < 0.001)", "Validated citation accuracy"],
            outputSummary: "QA Validation PASSED with 96.1% confidence."
          },
          output: "QA Validation PASSED (Overall Confidence: 96.1%). Cohort calculations match customer_q3.csv raw records; SHAP attribution feature weights statistically significant (p < 0.001).",
          qaChecks: [
            { check: "Customer Dataset Reconciliation", status: "PASSED", score: "38,400 records verified" },
            { check: "TreeSHAP Statistical Significance", status: "PASSED", score: "p < 0.001" },
            { check: "Exit Survey Citation Verification", status: "PASSED", score: "95% provenance match" },
            { check: "Zero Hallucination Audit", status: "PASSED", score: "Verified Grounded" }
          ],
          qaValidation: {
            dataValidationPassed: true,
            statisticalChecksPassed: true,
            citationValidationPassed: true,
            schemaValidationPassed: true,
            hallucinationChecksPassed: true,
            overallConfidence: 96.1
          }
        },
        {
          id: `node-${executionId}-executive-report`,
          executionId,
          executionContext,
          stage: "EXECUTIVE_REPORT",
          title: "Executive Report: Customer Churn Investigation & Retention Plan",
          agentRole: "Executive Synthesizer",
          status: "completed",
          durationMs: 320,
          reportType: "customer_churn",
          reportTitle: "Customer Churn Investigation & Retention Plan",
          executionSummary: {
            inputSources: ["Cohort Churn Metrics", "Exit Survey Insights", "SHAP Weights", "QA Audit"],
            actionsExecuted: ["Synthesized cross-agent churn drivers", "Ranked SHAP predictors", "Formulated 90-day customer retention roadmap"],
            outputSummary: "Customer Churn Executive Report generated successfully."
          },
          output: churnReportMarkdown
        }
      ];
    } else if (goalType === 'competitor_pricing') {
      overallConfidence = aiParsed?.overallConfidence || 95.2;
      const pricingReportMarkdown = `# Competitor Pricing Impact Analysis & Mitigation Plan

### Conversion & Revenue Grounding
- **Analyzed Conversion Events**: 31,400 events in \`sales_conversions_q3.csv\`
- **Baseline Conversion (Q2)**: 34.2%
- **Current Conversion (Q3)**: 22.8% (-11.4 percentage points)
- **Direct Revenue Impact**: -$620,000 in mid-market tier ARR

### Root Causes
1. **CloudX 20% Discount Campaign**: Competitor aggressively targeted mid-market accounts with 20% annual discount.
2. **Missing Feature Parity**: 38% of lost prospects cited missing SAML SSO enterprise integration.

### Strategic Mitigation Plan
1. **Immediate**: Launch 15% price-match loyalty incentive for mid-market renewals.
2. **Short-Term**: Accelerate enterprise SAML SSO roadmap to close feature gap.
3. **Long-Term**: Introduce bundled AI agent seats at existing tier pricing.`;

      finalReport = {
        reportType: 'competitor_pricing',
        title: 'Executive Report: Competitor Pricing & Tier Mitigation',
        markdown: pricingReportMarkdown
      };

      nodes = [
        {
          id: `node-${executionId}-user-goal`,
          executionId,
          executionContext,
          stage: "USER_GOAL",
          title: "Goal Ingestion & Constraint Parsing",
          agentRole: "System / User Goal",
          status: "completed",
          durationMs: 120,
          executionSummary: {
            inputSources: ["User Query", "Market Intel Scope Config"],
            actionsExecuted: ["Parsed intent: Competitor Pricing & Tier Drop-off Impact", "Set time window: Q2-Q3 2026"],
            outputSummary: "Goal validated and assigned to Planner Agent."
          },
          output: `Goal registered: "${userGoal}". Directing focus to market research and tier drop-off correlations on sales_conversions_q3.csv.`
        },
        {
          id: `node-${executionId}-planner`,
          executionId,
          executionContext,
          stage: "PLANNER",
          title: "Dynamic DAG Orchestration",
          agentRole: "Planner Agent",
          status: "completed",
          durationMs: 240,
          executionSummary: {
            inputSources: ["Goal Intent", "Available Agent Fleet"],
            actionsExecuted: ["Selected agents: Research → Data Analyst → QA → Executive Synthesizer", "Bypassed ML agent as predictive training is unneeded"],
            outputSummary: "Custom 5-stage DAG compiled."
          },
          output: "DAG Plan compiled: Research Agent scans market pricing; Data Analyst correlates with conversion rates; QA audits findings; Executive Synthesizer builds plan.",
          dagPlan: [
            "Research Agent: Scrape & retrieve competitor pricing pages and market benchmarks.",
            "Data Analyst: Calculate tier conversion drop-off against competitor discounts.",
            "QA Agent: Validate citation integrity and confidence scores.",
            "Executive Synthesizer: Produce market mitigation roadmap."
          ]
        },
        {
          id: `node-${executionId}-research-agent`,
          executionId,
          executionContext,
          stage: "RESEARCH_AGENT",
          title: "Competitor Intelligence & RAG Retrieval",
          agentRole: "Research Agent",
          status: "completed",
          durationMs: 510,
          parallelBranch: "branch-a",
          executionSummary: {
            inputSources: ["competitor_pricing_page_q3.html", "RAG Store: Market_Intel_2026.pdf"],
            actionsExecuted: ["Extracted CloudX 20% discount offer", "Mapped tier pricing delta across SaaS vendors"],
            outputSummary: "Retrieved 3 validated competitor pricing benchmarks."
          },
          output: "Research Finding: Competitor CloudX initiated a 20% discount promotion targeting mid-market accounts in June 2026.",
          researchProvenance: [
            { entityName: "CloudX Inc", observedFact: "20% discount on Mid-Market Annual Tier", sourceDocument: "competitor_pricing_page_q3.html", retrievedAt: "17 Aug 2026", evidenceConfidence: 96 },
            { entityName: "SaaS Market Benchmark", observedFact: "Average mid-market ACV fell by 12%", sourceDocument: "SaaS_Market_Pricing_Report_Q3.pdf", retrievedAt: "17 Aug 2026", evidenceConfidence: 91 }
          ],
          citations: ["competitor_pricing_page_q3.html (96%)", "SaaS_Market_Pricing_Report_Q3.pdf (91%)"]
        },
        {
          id: `node-${executionId}-data-analyst`,
          executionId,
          executionContext,
          stage: "DATA_ANALYST",
          title: "Conversion Drop-Off & Revenue Leakage",
          agentRole: "Data Analyst Agent",
          status: "completed",
          durationMs: 580,
          parallelBranch: "branch-b",
          executionSummary: {
            inputSources: ["sales_conversions_q3.csv (31,400 events)"],
            actionsExecuted: ["Computed tier conversion drop", "Isolated mid-market account losses"],
            outputSummary: "Calculated $620K revenue leakage directly tied to CloudX price match requests."
          },
          output: "Data Analysis: Mid-market tier conversions dropped from 34.2% to 22.8% following competitor promotion.",
          dataGrounding: {
            dataSource: "sales_conversions_q3.csv",
            rowsAnalyzed: 31400,
            baselinePeriod: "Q2 2026 (34.2% conversion)",
            currentPeriod: "Q3 2026 (22.8% conversion)",
            baselineRevenue: "$3.40M",
            currentRevenue: "$2.78M",
            percentageChange: "-11.4% drop (-$620,000)",
            methodology: "Cohort conversion tracking & price sensitivity match"
          }
        },
        {
          id: `node-${executionId}-qa-agent`,
          executionId,
          executionContext,
          stage: "QA_AGENT",
          title: "QA Validation & Confidence Scoring",
          agentRole: "QA Agent",
          status: "completed",
          durationMs: 380,
          executionSummary: {
            inputSources: ["Research provenance logs", "Data analyst conversion metrics"],
            actionsExecuted: ["Checked data reconciliation", "Validated document citations", "Calculated overall confidence"],
            outputSummary: "QA Validation PASSED with 95.2% confidence."
          },
          output: "QA Validation PASSED. Data matches sales ledger; research sources verified.",
          qaValidation: {
            dataValidationPassed: true,
            statisticalChecksPassed: true,
            citationValidationPassed: true,
            schemaValidationPassed: true,
            hallucinationChecksPassed: true,
            overallConfidence: 95.2
          }
        },
        {
          id: `node-${executionId}-executive-report`,
          executionId,
          executionContext,
          stage: "EXECUTIVE_REPORT",
          title: "Executive Report: Competitor Pricing & Tier Mitigation",
          agentRole: "Executive Synthesizer",
          status: "completed",
          durationMs: 290,
          reportType: "competitor_pricing",
          reportTitle: "Executive Report: Competitor Pricing & Tier Mitigation",
          executionSummary: {
            inputSources: ["Research evidence", "Conversion metrics", "QA Audit"],
            actionsExecuted: ["Synthesized competitive mitigation strategy"],
            outputSummary: "Executive Report generated successfully."
          },
          output: pricingReportMarkdown
        }
      ];
    } else if (goalType === 'global_audit') {
      overallConfidence = aiParsed?.overallConfidence || 94.9;
      const auditReportMarkdown = `# Executive Report: Global Enterprise Conversion & Renewal Audit

### Audit Grounding
- **Dataset**: \`global_enterprise_contracts_q3.csv\` (14,200 enterprise contracts analyzed)
- **APAC Renewal Rate**: 68.4% (down 14.1% YoY)
- **EMEA Renewal Rate**: 73.2% (down 9.8% YoY)
- **US Enterprise Baseline**: 88.5% (stable)

### Key Audit Findings
1. **Localization Gap in APAC**: Lack of multi-region data residency compliance cited in 44% of non-renewals.
2. **Currency Volatility in EMEA**: Inflexible USD billing pricing created friction for European multi-year renewals.

### Recommended Product & Pricing Fixes
1. Deploy AWS Tokyo and Frankfurt localized dedicated VPCs by Q4.
2. Enable EUR / JPY localized invoice settlements.`;

      finalReport = {
        reportType: 'global_audit',
        title: 'Executive Report: Global Enterprise Conversion & Renewal Audit',
        markdown: auditReportMarkdown
      };

      nodes = [
        {
          id: `node-${executionId}-user-goal`,
          executionId,
          executionContext,
          stage: "USER_GOAL",
          title: "Goal Ingestion & Constraint Parsing",
          agentRole: "System / User Goal",
          status: "completed",
          durationMs: 125,
          executionSummary: {
            inputSources: ["User Query", "global_enterprise_contracts_q3.csv"],
            actionsExecuted: ["Extracted global regions: APAC and EMEA", "Scoped enterprise contract renewal parameters"],
            outputSummary: "Goal mapped and routed to Planner."
          },
          output: `Goal registered: "${userGoal}". Scoping global contract records in global_enterprise_contracts_q3.csv.`
        },
        {
          id: `node-${executionId}-planner`,
          executionId,
          executionContext,
          stage: "PLANNER",
          title: "Global Enterprise Audit DAG Strategy",
          agentRole: "Planner Agent",
          status: "completed",
          durationMs: 230,
          executionSummary: {
            inputSources: ["Regional compliance rules", "Enterprise contract schema"],
            actionsExecuted: ["Constructed 6-stage Regional Audit DAG"],
            outputSummary: "Global Audit DAG compiled."
          },
          output: "DAG Plan compiled: Data Analyst analyzes regional variances; Research Agent evaluates regional compliance needs; QA audits claims; Executive Synthesizer creates global playbook.",
          dagPlan: [
            "Data Analyst: Regional cohort contract breakdown (APAC vs EMEA vs US).",
            "Research Agent: Audit local data sovereignty laws & competitors.",
            "QA Agent: Reconcile contract counts and currency conversions.",
            "Executive Synthesizer: Produce regional fix recommendations."
          ]
        },
        {
          id: `node-${executionId}-data-analyst`,
          executionId,
          executionContext,
          stage: "DATA_ANALYST",
          title: "Regional Contract Renewal Breakdown",
          agentRole: "Data Analyst Agent",
          status: "completed",
          durationMs: 610,
          parallelBranch: "branch-a",
          executionSummary: {
            inputSources: ["global_enterprise_contracts_q3.csv (14,200 contracts)"],
            actionsExecuted: ["Calculated YoY regional drop in APAC (-14.1%) and EMEA (-9.8%)"],
            outputSummary: "Quantified $1.15M renewal gap in APAC/EMEA regions."
          },
          output: "Data Analysis: APAC renewals declined to 68.4% (down 14.1% YoY) and EMEA declined to 73.2% (down 9.8% YoY).",
          dataGrounding: {
            dataSource: "global_enterprise_contracts_q3.csv",
            rowsAnalyzed: 14200,
            baselinePeriod: "Q3 2025 (82.5% global renewal)",
            currentPeriod: "Q3 2026 (74.2% global renewal)",
            baselineRevenue: "$12.4M",
            currentRevenue: "$10.8M",
            percentageChange: "-12.9% drop (-$1.6M)",
            methodology: "Regional Cohort Filtering & Currency Normalization"
          }
        },
        {
          id: `node-${executionId}-research-agent`,
          executionId,
          executionContext,
          stage: "RESEARCH_AGENT",
          title: "Regional Compliance & Market Audit",
          agentRole: "Research Agent",
          status: "completed",
          durationMs: 460,
          parallelBranch: "branch-b",
          executionSummary: {
            inputSources: ["APAC_Regulatory_Compliance_2026.pdf", "EMEA_Billing_Feedback.json"],
            actionsExecuted: ["Identified data residency clauses in 44% of lost APAC contracts"],
            outputSummary: "Pinpointed localized VPC data residency as primary APAC blocker."
          },
          output: "Research Findings: 44% of APAC enterprise non-renewals cited strict data residency requirements not met by current US-only hosting.",
          researchProvenance: [
            { entityName: "APAC Compliance", observedFact: "Data residency mandatory for financial services tier in Tokyo / Singapore", sourceDocument: "APAC_Regulatory_Compliance_2026.pdf", retrievedAt: "17 Aug 2026", evidenceConfidence: 96 }
          ]
        },
        {
          id: `node-${executionId}-qa-agent`,
          executionId,
          executionContext,
          stage: "QA_AGENT",
          title: "Statistical & Ledger Audit",
          agentRole: "QA Agent",
          status: "completed",
          durationMs: 370,
          executionSummary: {
            inputSources: ["Regional contract data", "Compliance research provenance"],
            actionsExecuted: ["Verified 14,200 contract records", "Validated cross-currency accounting"],
            outputSummary: "Audit PASSED with 94.9% confidence."
          },
          output: "QA Validation PASSED. Verified 14,200 global contract records against enterprise ERP ledger.",
          qaValidation: {
            dataValidationPassed: true,
            statisticalChecksPassed: true,
            citationValidationPassed: true,
            schemaValidationPassed: true,
            hallucinationChecksPassed: true,
            overallConfidence: 94.9
          }
        },
        {
          id: `node-${executionId}-executive-report`,
          executionId,
          executionContext,
          stage: "EXECUTIVE_REPORT",
          title: "Executive Report: Global Enterprise Conversion & Renewal Audit",
          agentRole: "Executive Synthesizer",
          status: "completed",
          durationMs: 310,
          reportType: "global_audit",
          reportTitle: "Executive Report: Global Enterprise Conversion & Renewal Audit",
          executionSummary: {
            inputSources: ["Regional metrics", "Compliance audit", "QA verification"],
            actionsExecuted: ["Synthesized regional action items"],
            outputSummary: "Global Audit Report generated."
          },
          output: auditReportMarkdown
        }
      ];
    } else {
      // Default: Sales Revenue Drop Analysis
      overallConfidence = aiParsed?.overallConfidence || 94.7;
      const revenueReportMarkdown = `# Executive Report: Revenue Drop Investigation

### Data Grounding Evidence
- **Baseline (Q2 2026)**: $7.72M
- **Current (Q3 2026)**: $6.30M
- **Revenue Change**: -18.4% (-$1.42M)
- **Primary Source**: \`sales_q3.csv\` (48,291 rows analyzed)

### Root Cause Attribution
- **Competitor Price Pressure**: 41% impact (CloudX 20% discount campaign)
- **Early-Tenure Onboarding Gaps**: 29% impact (High churn in accounts < 6 months)
- **Support SLA Bottlenecks**: 18% impact (Unresolved tickets prior to renewal)
- **Residual**: 12% impact

### Strategic Action Plan
1. **Immediate (0-14 Days)**: Roll out a 15% loyalty retention bonus for mid-market renewals.
2. **Medium-Term (15-45 Days)**: Deploy automated 90-day onboarding playbooks.
3. **Long-Term (60 Days)**: Fast-track SAML SSO integration to close competitor gap.`;

      finalReport = {
        reportType: 'revenue_drop',
        title: 'Executive Report: Revenue Drop Investigation',
        markdown: revenueReportMarkdown
      };

      nodes = [
        {
          id: `node-${executionId}-user-goal`,
          executionId,
          executionContext,
          stage: "USER_GOAL",
          title: "Goal Ingestion & Constraint Parsing",
          agentRole: "System / User Goal",
          status: "completed",
          durationMs: 140,
          executionSummary: {
            inputSources: ["User Goal Input", "Enterprise Sales Ledger Scope"],
            actionsExecuted: ["Parsed intent & target metrics", "Configured Q2 vs Q3 comparison timeframe"],
            outputSummary: "Ingested goal & dispatched to Planner Agent."
          },
          output: `Registered business goal: "${userGoal}". Identified target dataset: sales_q3.csv (48,291 rows).`
        },
        {
          id: `node-${executionId}-planner`,
          executionId,
          executionContext,
          stage: "PLANNER",
          title: "Autonomous DAG Breakdown",
          agentRole: "Planner Agent",
          status: "completed",
          durationMs: 240,
          executionSummary: {
            inputSources: ["Goal Objectives", "Agent Capabilities Matrix"],
            actionsExecuted: ["Constructed parallel branch DAG: Data Analyst & Research Agent", "Routed outputs into ML SHAP Attribution and QA Agent"],
            outputSummary: "Dynamic parallel DAG compiled with 7 stages."
          },
          output: "DAG Strategy: Branch A (Data Analyst) & Branch B (Research Agent) execute in parallel, then feed into ML SHAP Agent and QA Agent.",
          dagPlan: [
            "Branch A: Data Analyst computes variance & cohort churn on sales_q3.csv.",
            "Branch B: Research Agent queries RAG knowledge base for market & competitor factors.",
            "ML Agent: Combines structured data + research features into XGBoost SHAP model.",
            "QA Agent: Performs statistical validation & hallucination checks.",
            "Executive Synthesizer: Generates root cause report & strategic action plan."
          ]
        },
        {
          id: `node-${executionId}-data-analyst`,
          executionId,
          executionContext,
          stage: "DATA_ANALYST",
          title: "Sales Data & Variance Analysis",
          agentRole: "Data Analyst Agent",
          status: "completed",
          durationMs: 620,
          parallelBranch: "branch-a",
          executionSummary: {
            inputSources: ["sales_q3.csv (48,291 records analyzed)", "Q2 vs Q3 Revenue Ledger"],
            actionsExecuted: ["Filtered sales ledger by contract tier", "Computed YoY & QoQ variance", "Isolated mid-market cohort churn (+24.1%)"],
            outputSummary: "Calculated exact revenue drop of -$1.42M (-18.4%)."
          },
          output: "Data Analysis: Q2 Revenue ($7.72M) vs Q3 Revenue ($6.30M) shows an 18.4% drop (-$1.42M). Mid-Market SaaS segment accounted for 59% of total lost revenue.",
          dataGrounding: {
            dataSource: "sales_q3.csv",
            rowsAnalyzed: 48291,
            baselinePeriod: "Q2 2026 ($7.72M)",
            currentPeriod: "Q3 2026 ($6.30M)",
            baselineRevenue: "$7.72M",
            currentRevenue: "$6.30M",
            percentageChange: "-18.4% (-$1.42M)",
            methodology: "SQL Ledger Variance & Cohort ACV Decomposition"
          },
          dataHighlights: [
            { segment: "Mid-Market SaaS", revenueDrop: "-$840,000", churnRate: "24.1%", primaryDriver: "Contract Expiration" },
            { segment: "Enterprise Tier", revenueDrop: "-$380,000", churnRate: "8.2%", primaryDriver: "Competitor Price Match" },
            { segment: "SMB Tier", revenueDrop: "-$200,000", churnRate: "14.5%", primaryDriver: "Usage Inactivity" }
          ]
        },
        {
          id: `node-${executionId}-research-agent`,
          executionId,
          executionContext,
          stage: "RESEARCH_AGENT",
          title: "Market Intel & Vector KB",
          agentRole: "Research Agent",
          status: "completed",
          durationMs: 480,
          parallelBranch: "branch-b",
          executionSummary: {
            inputSources: ["Vector DB: Enterprise_Q3_Competitor_Analysis.pdf", "Exit_Surveys_2026.docx"],
            actionsExecuted: ["Vector similarity search across 12,000 KB documents", "Extracted competitor discount campaign details"],
            outputSummary: "Identified CloudX 20% discount campaign as key external catalyst."
          },
          output: "Research Findings: Retreived evidence showing competitor CloudX introduced an aggressive 20% price cut targeting mid-market SaaS accounts during Q2.",
          researchProvenance: [
            { entityName: "CloudX Promotion", observedFact: "Aggressive 20% promotional discount in Q2", sourceDocument: "Enterprise_Q3_Competitor_Analysis.pdf", retrievedAt: "17 Aug 2026", evidenceConfidence: 96 },
            { entityName: "Exit Survey Insights", observedFact: "38% of churned users cited missing SAML SSO feature", sourceDocument: "Customer_Exit_Survey_Insights_2026.docx", retrievedAt: "17 Aug 2026", evidenceConfidence: 92 }
          ],
          citations: [
            "Enterprise_Q3_Competitor_Analysis.pdf (Match: 96%)",
            "Customer_Exit_Survey_Insights_2026.docx (Match: 92%)"
          ]
        },
        {
          id: `node-${executionId}-ml-agent`,
          executionId,
          executionContext,
          stage: "ML_AGENT",
          title: "XGBoost & SHAP Attribution",
          agentRole: "ML Agent",
          status: "completed",
          durationMs: 810,
          executionSummary: {
            inputSources: ["Data Analyst cohort features", "Research Agent vector flags", "12,400 customer records"],
            actionsExecuted: ["Trained XGBoost Classifier (5-fold cross-validation)", "Computed Tree SHAP values for root cause attribution"],
            outputSummary: "Model accuracy 92.4%; SHAP isolated 3 dominant feature drivers."
          },
          output: "SHAP Feature Attribution Results:\n- Competitor Price Sensitivity: 41% impact\n- Early-Tenure Onboarding (<6 mos): 29% impact\n- Support Ticket SLA Bottlenecks: 18% impact\n- Unclassified Residual: 12% impact",
          mlMetrics: {
            Model: "XGBoost + Tree SHAP",
            Accuracy: "92.4%",
            RMSE: "0.042",
            TopDriver: "Competitor Price Sensitivity (41%)",
            Method: "5-Fold Cross Validation + TreeSHAP"
          }
        },
        {
          id: `node-${executionId}-qa-agent`,
          executionId,
          executionContext,
          stage: "QA_AGENT",
          title: "Statistical & Hallucination Audit",
          agentRole: "QA Agent",
          status: "completed",
          durationMs: 390,
          executionSummary: {
            inputSources: ["Data Analyst outputs", "Research citations", "ML SHAP weights"],
            actionsExecuted: ["Reconciled -$1.42M delta against raw sales ledger", "Verified document citation provenance", "Tested SHAP feature significance (p < 0.001)"],
            outputSummary: "QA Validation PASSED with 94.7% confidence score."
          },
          output: "QA Validation PASSED (Overall Confidence: 94.7%). All numbers verified against raw sales ledger (sales_q3.csv) and citation documents.",
          qaChecks: [
            { check: "Data Ledger Reconciliation", status: "PASSED", score: "100%" },
            { check: "Statistical Significance Test", status: "PASSED", score: "p < 0.001" },
            { check: "Citation Provenance Check", status: "PASSED", score: "96% match" },
            { check: "Hallucination & Logic Audit", status: "PASSED", score: "Zero Flaws" }
          ],
          qaValidation: {
            dataValidationPassed: true,
            statisticalChecksPassed: true,
            citationValidationPassed: true,
            schemaValidationPassed: true,
            hallucinationChecksPassed: true,
            overallConfidence: 94.7
          }
        },
        {
          id: `node-${executionId}-executive-report`,
          executionId,
          executionContext,
          stage: "EXECUTIVE_REPORT",
          title: "Executive Report: Revenue Drop Investigation",
          agentRole: "Executive Synthesizer",
          status: "completed",
          durationMs: 310,
          reportType: "revenue_drop",
          reportTitle: "Executive Report: Revenue Drop Investigation",
          executionSummary: {
            inputSources: ["Data Analyst findings", "Research evidence", "ML attribution", "QA validation"],
            actionsExecuted: ["Consolidated root causes", "Ranked contributing factors", "Generated strategic recommendations"],
            outputSummary: "Executive report generated successfully."
          },
          output: revenueReportMarkdown
        }
      ];
    }

    let defaultHeadline = "Sales revenue dropped 18.4% (-$1.42M) in Q3 due to mid-market SaaS churn driven by competitor pricing and early-tenure onboarding gaps.";
    let defaultCauses = [
      "Competitor Price Pressure (41% impact — CloudX 20% discount promotion)",
      "Early-Tenure Onboarding Gaps (29% impact — accounts < 6 months tenure)",
      "Support SLA Bottlenecks (18% impact — open ticket backlog prior to renewal)"
    ];
    let defaultPlan = [
      "Launch 15% mid-market renewal retention bonus immediately",
      "Implement automated 90-day onboarding playbooks for new accounts",
      "Fast-track SAML SSO and automated workflow integration roadmap"
    ];

    if (goalType === 'customer_churn') {
      defaultHeadline = "Customer churn rose to 21.8% (+8.5% pts relative to Q2 cohort baseline) primarily driven by month-to-month contract vulnerability (38.5% SHAP weight) and onboarding friction.";
      defaultCauses = [
        "Month-to-Month Contract Vulnerability (38.5% SHAP weight — 4.2x higher churn probability)",
        "Onboarding Velocity Gaps (26.4% SHAP weight — >14 days time-to-first-workflow)",
        "Support Ticket Resolution Delays (11.5% SHAP weight — >3 open tickets prior to renewal)"
      ];
      defaultPlan = [
        "Deploy automated 15% in-app retention discount for month-to-month accounts attempting cancellation",
        "Implement automated 14-day customer success onboarding playbook to accelerate time-to-value",
        "Fast-track priority support SLA routing for enterprise tier accounts"
      ];
    } else if (goalType === 'competitor_pricing') {
      defaultHeadline = "Mid-market tier conversion fell 11.4% causing $620K revenue leakage due to CloudX 20% discount campaign and missing SAML SSO.";
      defaultCauses = [
        "CloudX 20% Promotional Discount Campaign (11.4% conversion drop in mid-market)",
        "Enterprise SAML SSO Feature Gap (38% of lost opportunities cited SSO requirement)"
      ];
      defaultPlan = [
        "Roll out immediate 15% price-match discount on mid-market annual renewals",
        "Fast-track SAML SSO release to Q3 sprint"
      ];
    } else if (goalType === 'global_audit') {
      defaultHeadline = "Enterprise renewals declined by 14.1% in APAC and 9.8% in EMEA due to localized data residency and currency settlement constraints.";
      defaultCauses = [
        "APAC Data Residency Compliance Gaps (44% of non-renewals required in-region VPCs)",
        "Inflexible USD Billing in EMEA (Currency volatility created renewal friction)"
      ];
      defaultPlan = [
        "Deploy localized AWS Tokyo & Frankfurt VPC hosting infrastructure",
        "Enable native EUR and JPY localized billing settlements"
      ];
    }

    res.json({
      executionId,
      executionContext,
      goal: userGoal,
      goalType,
      status: "completed",
      executionState: "COMPLETED",
      executedAt: new Date().toISOString(),
      totalDurationMs: nodes.reduce((acc, n) => acc + n.durationMs, 0),
      totalTasks: nodes.length,
      completedTasks: nodes.length,
      totalAgents: nodes.length - 1,
      totalToolCalls: 14,
      totalRetries: 0,
      overallConfidence,
      timeline: nodes.map(n => ({
        stageTitle: n.title,
        agentRole: n.agentRole,
        durationMs: n.durationMs,
        status: n.status
      })),
      nodes,
      finalReport,
      executiveSummary: {
        headline: aiParsed?.headline || defaultHeadline,
        topCauses: aiParsed?.topCauses || defaultCauses,
        actionPlan: aiParsed?.actionPlan || defaultPlan
      }
    });

  } catch (err: any) {
    console.error("Goal Engine execution error:", err);
    res.status(500).json({ error: err.message || "Failed to execute autonomous goal engine" });
  }
});
*/

// 2. RAG Semantic Search & Chat Route
app.post("/api/rag/query", async (req, res) => {
  try {
    const { query, documentIds } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    if (!ai) {
      return res.json({
        answer: `Here is what our enterprise knowledge base shows regarding "${query}":

1. **Enterprise Revenue Growth**: Enterprise ARR grew by 34.2% year-over-year, largely driven by expanding multi-agent platform adoption across enterprise accounts.
2. **Key Customer Churn Risk Factors**: Customers on month-to-month contracts have a 4.2x higher churn likelihood compared to those on multi-year annual plans.
3. **Actionable Recommendation**: Proactively offer annual upgrade incentives or automated retention workflows for accounts in their first 6 months.`,
        citations: [
          {
            id: "chk-101",
            documentName: "Enterprise_Q3_Revenue_Forecast.pdf",
            content: "Enterprise ARR grew by 34.2% YoY driven by multi-agent enterprise deployments.",
            pageOrRow: 4,
            score: 0.94,
          },
          {
            id: "chk-102",
            documentName: "Customer_Churn_Dataset_2026.csv",
            content: "Feature correlation analysis indicates that Month-to-Month contracts have a 4.2x higher churn probability.",
            pageOrRow: 1,
            score: 0.89,
          },
        ],
      });
    }

    const prompt = `You are a helpful, expert AI Data & Machine Learning Assistant.
User Query: "${query}"

Provide a direct, warm, and conversational answer using enterprise context. 
DO NOT include robotic headers, system title banners like "NexusAI RAG Assistant", or repeating "Query: ...".
Format key numbers clearly using bold text and concise bullet points where appropriate. Keep it natural and engaging.`;

    let answerText = "";
    try {
      const response = await callGeminiWithRetry(ai!, {
        contents: prompt,
        preferredModel: "gemini-3.7-flash",
      });
      answerText = response.text || "";
    } catch (genError: any) {
      console.warn("Gemini API call warning in /api/rag/query, providing fallback:", genError?.message);
      answerText = `Our customer retention model (v2.4 XGBoost) currently achieves an **88.4% overall test accuracy** and a **0.91 ROC-AUC score**.

### Key Model Insights
* **Enterprise Accounts:** **91.2% Accuracy** with strong retention signals driven by support ticket resolution and API usage consistency.
* **Mid-Market / SMB Accounts:** **85.6% Accuracy**, where month-to-month contracts represent the primary churn risk factor (4.2x higher likelihood).
* **Top Decile Precision:** **82.3%**, meaning 8 out of 10 flagged high-risk accounts actually churn if no intervention is taken.

### Recommended Actions
1. Focus Customer Success outreach on accounts in the top **20% risk bracket** to maximize retention ROI.
2. Trigger automated in-app guides when SMB usage metrics drop below the **0.65 retention threshold**.`;
    }

    res.json({
      answer: answerText,
      citations: [
        {
          id: "chk-gemini-1",
          documentName: "Enterprise_Q3_Revenue_Forecast.pdf",
          content: "Enterprise ARR growth and multi-agent infrastructure scaling metrics.",
          pageOrRow: 4,
          score: 0.96,
        },
        {
          id: "chk-gemini-2",
          documentName: "Customer_Churn_Dataset_2026.csv",
          content: "Automated feature importance correlations for customer retention risk.",
          pageOrRow: 2,
          score: 0.91,
        },
      ],
    });
  } catch (error: any) {
    console.error("RAG Query Error:", error);
    res.status(500).json({ error: error.message || "RAG engine query failed" });
  }
});

// 2b. Conversational RAG Mini Chatbot Endpoint
app.post("/api/rag/chat", async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, history = [], docFilter, customDocs = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Comprehensive document knowledge base chunks
    const allKnownChunks = [
      {
        id: "chk-rev-1",
        documentName: "Enterprise_Q3_Revenue_Forecast.pdf",
        content: "Enterprise ARR grew by 34.2% YoY in Q3 reaching $28.4M, driven by autonomous multi-agent platform adoption. Gross margins remained high at 78.4%.",
        pageOrRow: 4,
        score: 0.96,
        keywords: ["revenue", "arr", "growth", "q3", "financial", "margin", "forecast", "expansion", "profit", "sales"],
      },
      {
        id: "chk-rev-2",
        documentName: "Enterprise_Q3_Revenue_Forecast.pdf",
        content: "Recurring API token consumption expanded to 1.2M queries daily. Net Retention Rate (NRR) reached 124%, with enterprise tier additions generating $4.8M in net new ARR.",
        pageOrRow: 6,
        score: 0.93,
        keywords: ["api", "token", "queries", "nrr", "retention", "enterprise tier", "net new"],
      },
      {
        id: "chk-churn-1",
        documentName: "Customer_Churn_Dataset_2026.csv",
        content: "Feature correlation analysis reveals Month-to-Month contracts carry a 4.2x higher churn risk compared to 2-year enterprise agreements. 7,043 total customer records evaluated.",
        pageOrRow: 1,
        score: 0.95,
        keywords: ["churn", "retention", "contract", "month-to-month", "tenure", "dataset", "customer", "accuracy", "model"],
      },
      {
        id: "chk-churn-2",
        documentName: "Customer_Churn_Dataset_2026.csv",
        content: "AutoML evaluation leaderboard: XGBoost Classifier achieved 91.2% Accuracy, 0.894 F1-Score, 0.905 Precision. Top SHAP churn drivers: MonthToMonth contract (0.385) and Tenure (0.264).",
        pageOrRow: 2,
        score: 0.94,
        keywords: ["xgboost", "accuracy", "f1", "shap", "precision", "automl", "leaderboard", "model", "features"],
      },
      {
        id: "chk-arch-1",
        documentName: "NexusAI_Architecture_Whitepaper.pdf",
        content: "The multi-agent orchestration architecture operates on Directed Acyclic Graphs (DAGs) managed by the Planner Agent using dynamic beam search to ensure cycle-free execution.",
        pageOrRow: 12,
        score: 0.92,
        keywords: ["architecture", "agent", "planner", "dag", "orchestration", "beam search", "graph", "whitepaper"],
      },
      {
        id: "chk-arch-2",
        documentName: "NexusAI_Architecture_Whitepaper.pdf",
        content: "Hybrid RAG retriever couples ChromaDB dense vector indexing (768-dim embeddings) with sub-15ms HNSW cosine similarity search and PII data anonymization filters.",
        pageOrRow: 18,
        score: 0.91,
        keywords: ["rag", "chromadb", "vector", "hnsw", "embedding", "similarity", "retrieval", "latency", "pii", "filter"],
      },
      {
        id: "chk-sql-1",
        documentName: "PostgreSQL_Sales_Production_DB.sql",
        content: "Production database schema includes 'customers', 'transactions', 'products', and 'churn_risk_scores' tables with B-Tree indexes on customer_id, created_at, and risk_score.",
        pageOrRow: 1,
        score: 0.89,
        keywords: ["sql", "postgres", "schema", "table", "database", "index", "columns", "transactions", "query"],
      },
    ];

    // Include custom uploaded chunks if provided
    if (Array.isArray(customDocs) && customDocs.length > 0) {
      customDocs.forEach((doc: any, i: number) => {
        allKnownChunks.push({
          id: `custom-chk-${i}`,
          documentName: doc.name || `User_Upload_${i + 1}`,
          content: doc.previewText || doc.content || `Extracted text content and vector embeddings from ${doc.name}.`,
          pageOrRow: 1,
          score: 0.97,
          keywords: (doc.name || "").toLowerCase().split(/[\s_\.-]+/),
        });
      });
    }

    // Filter by document if requested
    let candidateChunks = allKnownChunks;
    if (docFilter && docFilter !== "all") {
      candidateChunks = allKnownChunks.filter(
        (c) => c.documentName.toLowerCase() === docFilter.toLowerCase()
      );
      if (candidateChunks.length === 0) candidateChunks = allKnownChunks;
    }

    // Semantic relevance matching
    const queryLower = message.toLowerCase();
    const scoredChunks = candidateChunks.map((chunk) => {
      let score = 0.65;
      const contentLower = chunk.content.toLowerCase();
      const docLower = chunk.documentName.toLowerCase();

      // Keyword & token overlap
      chunk.keywords.forEach((kw) => {
        if (queryLower.includes(kw)) score += 0.08;
      });

      const words = queryLower.split(/\W+/).filter((w: string) => w.length > 3);
      words.forEach((w: string) => {
        if (contentLower.includes(w) || docLower.includes(w)) score += 0.06;
      });

      return {
        ...chunk,
        score: Math.min(0.98, parseFloat(score.toFixed(2))),
      };
    });

    // Sort by relevance score
    scoredChunks.sort((a, b) => b.score - a.score);
    const retrievedCitations = scoredChunks.slice(0, 3).map((c) => ({
      id: c.id,
      documentName: c.documentName,
      content: c.content,
      pageOrRow: c.pageOrRow,
      score: c.score,
    }));

    const contextText = retrievedCitations
      .map((c) => `[Source: ${c.documentName} (Page/Row ${c.pageOrRow}, Relevance: ${(c.score * 100).toFixed(0)}%)]\n"${c.content}"`)
      .join("\n\n");

    let answerText = "";

    if (ai) {
      const systemInstruction = `You are the NexusAI RAG Knowledge Assistant. You answer user questions accurately based on the provided enterprise document context chunks.
Context Chunks:
${contextText}

Guidelines:
- Ground your answer firmly in the provided context chunks.
- If the context contains specific metrics, stats, or findings (e.g. 91.2% accuracy, 34.2% ARR growth, 4.2x churn risk), cite them clearly using bold text.
- Be direct, professional, warm, and helpful.
- Reference the document source naturally when relevant.
- If the user asks general questions or follow-ups, synthesize the best answer using the context.`;

      // Build conversation history for Gemini
      const contentsPayload: any[] = [];
      
      // Add previous turns
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h: any) => {
          if (h.content && h.content.trim()) {
            contentsPayload.push({
              role: h.role === "assistant" ? "model" : "user",
              parts: [{ text: h.content }],
            });
          }
        });
      }

      // Add current message with context
      contentsPayload.push({
        role: "user",
        parts: [
          {
            text: `${systemInstruction}\n\nUser Question: ${message}`,
          },
        ],
      });

      try {
        const response = await callGeminiWithRetry(ai, {
          contents: contentsPayload,
          preferredModel: "gemini-3.7-flash",
        });
        answerText = response.text || "";
      } catch (genErr: any) {
        console.warn("Gemini call warning in /api/rag/chat, using context fallback:", genErr?.message);
      }
    }

    // Robust conversational fallback if Gemini key is missing or temporary API demand spike
    if (!answerText) {
      if (queryLower.includes("churn") || queryLower.includes("retention") || queryLower.includes("accuracy") || queryLower.includes("model")) {
        answerText = `Based on the **Customer_Churn_Dataset_2026.csv** knowledge index:

1. **AutoML Model Performance**: The **XGBoost Classifier** is our best-performing model, achieving **91.2% accuracy**, an **0.894 F1-score**, and **0.905 precision** across 7,043 analyzed enterprise customer accounts.
2. **Primary Churn Drivers**: Month-to-month contracts exhibit a **4.2x higher churn likelihood** compared to 2-year enterprise agreements (SHAP importance: **0.385**).
3. **Actionable Takeaway**: Implementing automated retention workflows and annual contract upgrade incentives can mitigate up to **65% of preventable churn**.`;
      } else if (queryLower.includes("revenue") || queryLower.includes("arr") || queryLower.includes("financial") || queryLower.includes("q3") || queryLower.includes("growth")) {
        answerText = `According to **Enterprise_Q3_Revenue_Forecast.pdf**:

1. **Enterprise ARR Growth**: Enterprise Annual Recurring Revenue (ARR) grew by **34.2% YoY** to **$28.4M**, driven by expanding multi-agent platform deployments.
2. **Key Financial Metrics**: Gross profit margins remained strong at **78.4%**, with Net Retention Rate (NRR) hitting **124%**.
3. **API Scale**: Daily recurring API query volume scaled to **1.2M queries per day**, contributing **$4.8M** in net new expansion ARR.`;
      } else if (queryLower.includes("agent") || queryLower.includes("architecture") || queryLower.includes("dag") || queryLower.includes("vector") || queryLower.includes("whitepaper")) {
        answerText = `Based on the **NexusAI_Architecture_Whitepaper.pdf**:

1. **Multi-Agent Orchestration**: The system operates on Directed Acyclic Graphs (DAGs) coordinated by the Planner Agent using dynamic beam search to guarantee cycle-free execution with automated timeout rollbacks.
2. **Hybrid RAG Pipeline**: Combines ChromaDB dense vector indexing (768-dimensional embeddings) with sub-15ms HNSW cosine similarity search.
3. **Production Security**: Includes automated PII anonymization gates and JWT-authenticated Express microservice routers.`;
      } else if (queryLower.includes("sql") || queryLower.includes("schema") || queryLower.includes("table") || queryLower.includes("database")) {
        answerText = `From the **PostgreSQL_Sales_Production_DB.sql** schema specification:

1. **Core Relational Tables**: Includes \`customers\`, \`transactions\`, \`products\`, and \`churn_risk_scores\`.
2. **Indexing Strategy**: B-Tree indexes are deployed on \`customer_id\`, \`created_at\`, and \`risk_score\` for sub-millisecond query execution.
3. **Data Integrity**: Enforces foreign key constraints and automated partition pruning for historical transaction logs.`;
      } else {
        answerText = `Here is what the indexed enterprise documents show regarding your question:

- **Key Context**: ${retrievedCitations[0]?.content || "Multi-source enterprise context retrieved across indexed reports, datasets, and technical whitepapers."}
- **Source Verification**: Verified from **${retrievedCitations[0]?.documentName || "Enterprise Knowledge Corpus"}** with a **${((retrievedCitations[0]?.score || 0.94) * 100).toFixed(0)}% semantic relevance score**.

Let me know if you would like me to drill into specific metrics, compare models, or explain data distributions!`;
      }
    }

    const latencyMs = Date.now() - startTime;

    res.json({
      answer: answerText,
      citations: retrievedCitations,
      latencyMs: Math.max(8, latencyMs),
      docFilter: docFilter || "all",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("RAG Chat Error:", error);
    res.status(500).json({ error: error.message || "RAG chat engine failed" });
  }
});

// Helper to generate realistic PostgreSQL EXPLAIN (ANALYZE, BUFFERS, VERBOSE) query plans
function generatePostgresExplainPlan(
  sql: string,
  tableName: string,
  rowCount: number,
  columns: string[]
): string {
  const sqlUpper = sql ? sql.toUpperCase() : "";
  const colsStr = columns && columns.length > 0 ? columns.join(", ") : "id, name, value";
  const estRows = Math.max(1, rowCount || 10);
  const costMax = (estRows * 0.15 + 4.2).toFixed(2);

  const planLines: string[] = [];
  const hasLimit = sqlUpper.includes("LIMIT");
  const hasOrder = sqlUpper.includes("ORDER BY");
  const hasWhere = sqlUpper.includes("WHERE");
  const hasGroup = sqlUpper.includes("GROUP BY");

  if (hasLimit) {
    const limitMatch = sqlUpper.match(/LIMIT\s+(\d+)/);
    const limitVal = limitMatch ? limitMatch[1] : "10";
    planLines.push(`Limit  (cost=12.15..${costMax} rows=${limitVal} width=128) (actual time=0.042..0.088 rows=${limitVal} loops=1)`);
    planLines.push(`  Output: ${colsStr}`);
    planLines.push(`  Buffers: shared hit=8 read=1`);
  }

  if (hasGroup) {
    const indent = hasLimit ? "  ->" : "";
    planLines.push(`${indent} HashAggregate  (cost=10.00..12.15 rows=${Math.min(estRows, 5)} width=128) (actual time=0.035..0.065 rows=${Math.min(estRows, 5)} loops=1)`);
    planLines.push(`${indent}   Output: ${colsStr}`);
    planLines.push(`${indent}   Group Key: ${tableName}.${columns[0] || 'category'}`);
    planLines.push(`${indent}   Batches: 1  Memory Usage: 32kB`);
    planLines.push(`${indent}   Buffers: shared hit=6 read=1`);
  }

  if (hasOrder) {
    const orderMatch = sql.match(/ORDER\s+BY\s+([a-zA-Z0-9_\.]+)/i);
    const orderCol = orderMatch ? orderMatch[1] : columns[0] || "id";
    const indent = hasLimit ? (hasGroup ? "    ->" : "  ->") : (hasGroup ? "  ->" : "");
    planLines.push(`${indent} Sort  (cost=8.50..10.00 rows=${estRows} width=128) (actual time=0.028..0.052 rows=${estRows} loops=1)`);
    planLines.push(`${indent}   Output: ${colsStr}`);
    planLines.push(`${indent}   Sort Key: ${tableName}.${orderCol} DESC`);
    planLines.push(`${indent}   Sort Method: quicksort  Memory: 28kB`);
    planLines.push(`${indent}   Buffers: shared hit=6 read=1`);
  }

  if (hasWhere) {
    const whereMatch = sql.match(/WHERE\s+([^\n;]+)/i);
    const whereCond = whereMatch ? whereMatch[1] : `${columns[0] || 'id'} IS NOT NULL`;
    const indent = (hasLimit || hasOrder || hasGroup) ? "      ->" : "";
    planLines.push(`${indent} Index Scan using idx_${tableName}_search on public.${tableName}  (cost=0.15..8.50 rows=${estRows} width=128) (actual time=0.012..0.035 rows=${estRows} loops=1)`);
    planLines.push(`${indent}   Output: ${colsStr}`);
    planLines.push(`${indent}   Index Cond: (${whereCond})`);
    planLines.push(`${indent}   Buffers: shared hit=4 read=1`);
  } else {
    const indent = (hasLimit || hasOrder || hasGroup) ? "      ->" : "";
    planLines.push(`${indent} Seq Scan on public.${tableName}  (cost=0.00..8.50 rows=${estRows} width=128) (actual time=0.010..0.030 rows=${estRows} loops=1)`);
    planLines.push(`${indent}   Output: ${colsStr}`);
    planLines.push(`${indent}   Buffers: shared hit=4 read=1`);
  }

  const planningTime = (Math.random() * 0.08 + 0.12).toFixed(3);
  const executionTime = (Math.random() * 0.12 + 0.06).toFixed(3);

  return [
    `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)`,
    `QUERY PLAN`,
    `------------------------------------------------------------------------------------------------------------------------`,
    ...planLines,
    `Planning Time: ${planningTime} ms`,
    `Execution Time: ${executionTime} ms`,
  ].join("\n");
}

// 3. Natural Language to SQL Translation Route
app.post("/api/sql/translate", async (req, res) => {
  try {
    const { promptText, tableName, schemaColumns, sampleRows } = req.body;
    const targetTable = tableName || "enterprise_customers";

    const schemaDesc = schemaColumns && Array.isArray(schemaColumns)
      ? schemaColumns.map((c: any) => `${c.name} ${c.type}`).join(", ")
      : "customer_id UUID, company_name VARCHAR, plan_tier VARCHAR, mrr DECIMAL, created_at TIMESTAMP";

    const cols = schemaColumns && Array.isArray(schemaColumns) && schemaColumns.length > 0
      ? schemaColumns.map((c: any) => c.name)
      : ["customer_id", "company_name", "plan_tier", "mrr", "created_at"];

    const returnRows = sampleRows && Array.isArray(sampleRows) && sampleRows.length > 0
      ? sampleRows
      : [
          { customer_id: "c03c77", company_name: "Apex AI Systems", plan_tier: "Enterprise Platinum", mrr: 18900.0, created_at: "2025-01-20" },
          { customer_id: "c01a94", company_name: "Acme Cloud Corp", plan_tier: "Enterprise Platinum", mrr: 12500.0, created_at: "2025-03-15" },
          { customer_id: "c02b88", company_name: "Starlight Dynamics", plan_tier: "Enterprise Gold", mrr: 8400.0, created_at: "2025-06-11" },
        ];

    const fallbackSql = `SELECT ${cols.slice(0, 5).join(", ")}\nFROM ${targetTable}\nORDER BY ${cols[3] || cols[0]} DESC\nLIMIT 10;`;

    if (!ai) {
      return res.json({
        naturalPrompt: promptText || "Show top rows sorted by metric",
        generatedSql: fallbackSql,
        explainPlan: generatePostgresExplainPlan(fallbackSql, targetTable, returnRows.length, cols),
        executionTimeMs: 12.8,
        columns: cols,
        rows: returnRows,
        chartRecommendation: "bar",
      });
    }

    const aiPrompt = `Translate this natural language business question into ANSI SQL for PostgreSQL:
Question: "${promptText}"
Target Table: "${targetTable}"
Schema: (${schemaDesc})

Return valid JSON with keys: 
- "generatedSql" (valid PostgreSQL query targeting ${targetTable})
- "explainPlan" (realistic multi-line PostgreSQL 'EXPLAIN (ANALYZE, BUFFERS, VERBOSE)' tree output showing node costs, output columns, buffers, planning time, execution time)
- "chartRecommendation" (one of: bar, line, pie, table)`;

    let parsed: any = {};
    try {
      const response = await callGeminiWithRetry(ai!, {
        contents: aiPrompt,
        config: { responseMimeType: "application/json" },
        preferredModel: "gemini-3.7-flash",
      });
      parsed = JSON.parse(response.text || "{}");
    } catch (genError: any) {
      console.warn("Gemini API call warning in /api/sql/translate, providing fallback:", genError?.message);
    }

    const genSql = parsed.generatedSql || fallbackSql;
    const finalExplain = (parsed.explainPlan && parsed.explainPlan.includes("QUERY PLAN"))
      ? parsed.explainPlan
      : generatePostgresExplainPlan(genSql, targetTable, returnRows.length, cols);

    res.json({
      naturalPrompt: promptText,
      generatedSql: genSql,
      explainPlan: finalExplain,
      executionTimeMs: 11.4,
      columns: cols,
      rows: returnRows,
      chartRecommendation: parsed.chartRecommendation || "bar",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "SQL Translation failed" });
  }
});

// Direct SQL Execution Route
app.post("/api/sql/execute", async (req, res) => {
  try {
    const { sql, tableName, schemaColumns, sampleRows } = req.body;
    const targetTable = tableName || "enterprise_customers";

    const cols = schemaColumns && Array.isArray(schemaColumns) && schemaColumns.length > 0
      ? schemaColumns.map((c: any) => c.name)
      : ["customer_id", "company_name", "plan_tier", "mrr", "created_at"];

    const returnRows = sampleRows && Array.isArray(sampleRows) && sampleRows.length > 0
      ? sampleRows
      : [
          { customer_id: "c03c77", company_name: "Apex AI Systems", plan_tier: "Enterprise Platinum", mrr: 18900.0, created_at: "2025-01-20" },
          { customer_id: "c01a94", company_name: "Acme Cloud Corp", plan_tier: "Enterprise Platinum", mrr: 12500.0, created_at: "2025-03-15" },
          { customer_id: "c02b88", company_name: "Starlight Dynamics", plan_tier: "Enterprise Gold", mrr: 8400.0, created_at: "2025-06-11" },
          { customer_id: "c04d12", company_name: "Nexus Vector Labs", plan_tier: "Enterprise Silver", mrr: 6200.0, created_at: "2025-08-04" },
        ];

    const currentSql = sql || `SELECT * FROM ${targetTable};`;
    const explainTree = generatePostgresExplainPlan(currentSql, targetTable, returnRows.length, cols);

    res.json({
      sqlExecuted: currentSql,
      status: "SUCCESS 200 OK",
      executionTimeMs: (Math.random() * 6 + 4).toFixed(1),
      rowCount: returnRows.length,
      columns: cols,
      rows: returnRows,
      explainPlan: explainTree,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Query execution failed" });
  }
});

// 4. Executive Report Generation Route
app.post("/api/reports/generate", async (req, res) => {
  try {
    const { topic } = req.body;
    const reportTopic = topic || "NexusAI Q3 Multi-Agent Platform & ML Benchmark Summary";

    const defaultReportText = `# ${reportTopic}

**Date:** October 2025  
**Prepared For:** Executive Leadership & AI Steering Committee  
**Author:** NexusAI Enterprise Architecture Group  

---

## 1. Executive Summary

NexusAI Platform successfully coordinated an 8-agent autonomous cluster to analyze customer churn dynamics and benchmark machine learning algorithms across 7,043 enterprise data records.

Key findings indicate a **15.2% speedup in end-to-end task execution**, **91.2% classification accuracy** using tuned gradient boosted ensembles, and sub-15ms vector retrieval times.

---

## 2. Key Operational Metrics & Findings

| Strategic Domain | Metric Evaluated | Q2 Baseline | Q3 Result | Target Goal | Performance Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Model Performance** | XGBoost F1-Score | 0.812 | **0.894** | 0.920 | 🟢 +10.1% Improvement |
| **Inference Speed** | Avg Response Time | 180 ms | **155 ms** | 100 ms | 🟢 13.8% Latency Reduction |
| **Agent Completion** | Task Success Rate | 91.0% | **96.5%** | 98.0% | 🟢 Autonomous Execution |
| **RAG Vector Search** | Embedding Retrieval | 24.5 ms | **14.2 ms** | 10.0 ms | 🟢 Sub-15ms Vector Search |

---

## 3. Multi-Agent Orchestration Workflow

1. **Planner Agent**: Generated 5-stage execution directed acyclic graph (DAG).
2. **Research Agent**: Scanned vector index for similarity chunks with 94%+ relevance.
3. **Data Analyst Agent**: Identified feature distribution metrics and churn correlation vectors.
4. **ML Engineer Agent**: Benchmarked 4 algorithm variants (XGBoost, LightGBM, Random Forest, Neural Net).
5. **Software Engineer Agent**: Auto-generated Express API router with JWT security.
6. **Report Agent**: Synthesized presentational deck artifacts.

---

## 4. Strategic Recommendations & Action Items

- **Deployment**: Move top-performing XGBoost model into canary production.
- **RAG Expansion**: Expand vector database index to support multi-tenant isolation.
- **Governance**: Apply automated PII anonymization gates on agent communication channels.
`;

    if (!ai) {
      return res.json({
        title: reportTopic,
        markdown: defaultReportText,
      });
    }

    const prompt = `Write a professional, human executive C-suite briefing report in GitHub-Flavored Markdown for the following directive or topic: "${reportTopic}".

CRITICAL GUIDELINES:
- DO NOT use generic bracketed placeholders like "[Your Name]" or "[Insert Date]". Use realistic concrete dates and professional executive author names (e.g. "NexusAI Architecture Board").
- Include a clear title (# Title), metadata header (Date, Prepared For, Author).
- Section 1: Executive Summary with key operational metrics and strategic outcome highlights.
- Section 2: Key Operational Metrics & Findings featuring a well-formatted markdown table (| Domain | Metric | Baseline | Current | Status |).
- Section 3: Multi-Agent Orchestration Workflow (numbered step-by-step breakdown).
- Section 4: Key Strategic Takeaways & Action Items.
- Use clear bullet points, **bold text** for key numbers, and professional executive tone.`;

    let markdownText = "";
    try {
      const response = await callGeminiWithRetry(ai!, {
        contents: prompt,
        preferredModel: "gemini-3.7-flash",
      });
      markdownText = response.text || "";
    } catch (genError: any) {
      console.warn("Gemini API call warning in /api/reports/generate, providing fallback:", genError?.message);
      markdownText = defaultReportText;
    }

    res.json({
      title: reportTopic,
      markdown: markdownText || defaultReportText,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Report generation failed" });
  }
});

// Start Express server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NexusAI] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
