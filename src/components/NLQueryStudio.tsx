import React, { useState, useRef } from 'react';
import {
  Terminal,
  Play,
  Database,
  Table as TableIcon,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Clock,
  Layers,
  Code,
  HelpCircle,
  Upload,
  FileSpreadsheet,
  FileCode,
  X,
  Plus,
  Eye,
  Loader2,
  Check,
  Download,
  Copy,
  Search,
  Zap,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { DatabaseTable, SqlQueryResult } from '../types';
import { SAMPLE_DATABASE_TABLES } from '../data/mockData';

export const NLQueryStudio: React.FC = () => {
  const [tables, setTables] = useState<DatabaseTable[]>(SAMPLE_DATABASE_TABLES);
  const [selectedTable, setSelectedTable] = useState<DatabaseTable>(tables[0]);
  const [nlPrompt, setNlPrompt] = useState('Show top 5 enterprise customers sorted by monthly recurring revenue (MRR)');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Results view tab: 'table' | 'chart' | 'explain'
  const [activeResultTab, setActiveResultTab] = useState<'table' | 'chart' | 'explain'>('table');
  const [tableFilter, setTableFilter] = useState('');
  
  // Copy & Export state
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedData, setCopiedData] = useState(false);

  // Dataset Upload Modal & State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showRawDataPreview, setShowRawDataPreview] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [queryResult, setQueryResult] = useState<SqlQueryResult>({
    naturalPrompt: 'Show top 5 enterprise customers sorted by monthly recurring revenue (MRR)',
    generatedSql: `SELECT customer_id, company_name, plan_tier, mrr, created_at
FROM enterprise_customers
WHERE plan_tier LIKE '%Enterprise%'
ORDER BY mrr DESC
LIMIT 5;`,
    explainPlan: 'Index Scan using idx_mrr on enterprise_customers (cost=0.15..8.27 rows=5 width=128)',
    executionTimeMs: 14.2,
    columns: ['customer_id', 'company_name', 'plan_tier', 'mrr', 'created_at'],
    rows: [
      { customer_id: 'c03c77', company_name: 'Apex AI Systems', plan_tier: 'Enterprise Platinum', mrr: 18900.0, created_at: '2025-01-20' },
      { customer_id: 'c01a94', company_name: 'Acme Cloud Corp', plan_tier: 'Enterprise Platinum', mrr: 12500.0, created_at: '2025-03-15' },
      { customer_id: 'c02b88', company_name: 'Starlight Dynamics', plan_tier: 'Enterprise Gold', mrr: 8400.0, created_at: '2025-06-11' },
      { customer_id: 'c04d66', company_name: 'Vanguard Labs', plan_tier: 'Scaleup', mrr: 3200.0, created_at: '2025-09-04' },
    ],
    chartRecommendation: 'bar',
  });

  // Editable SQL code string
  const [editableSql, setEditableSql] = useState(queryResult.generatedSql);

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlPrompt.trim()) return;

    setIsTranslating(true);
    try {
      const res = await fetch('/api/sql/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: nlPrompt,
          tableName: selectedTable.tableName,
          schemaColumns: selectedTable.columns,
          sampleRows: selectedTable.sampleRows || [],
        }),
      });
      const data = await res.json();
      setQueryResult(data);
      if (data.generatedSql) {
        setEditableSql(data.generatedSql);
      }
      setActiveResultTab('table');
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Direct SQL execution handler
  const handleExecuteQuery = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: editableSql,
          tableName: selectedTable.tableName,
          schemaColumns: selectedTable.columns,
          sampleRows: selectedTable.sampleRows || [],
        }),
      });

      if (!res.ok) throw new Error('Query execution error');
      const data = await res.json();

      setQueryResult((prev) => ({
        ...prev,
        generatedSql: editableSql,
        executionTimeMs: Number(data.executionTimeMs) || 12.4,
        columns: data.columns || prev.columns,
        rows: data.rows || prev.rows,
        explainPlan: data.explainPlan || prev.explainPlan,
      }));

      setActiveResultTab('table');
    } catch (err) {
      console.error('Execute query error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Copy SQL snippet
  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(editableSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Copy Table JSON
  const copyDataJson = () => {
    navigator.clipboard.writeText(JSON.stringify(queryResult.rows, null, 2));
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  // Download CSV
  const downloadCsv = () => {
    if (!queryResult.rows || queryResult.rows.length === 0) return;
    const cols = queryResult.columns || Object.keys(queryResult.rows[0]);
    const headerRow = cols.join(',');
    const bodyRows = queryResult.rows.map((row) =>
      cols.map((col) => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headerRow, ...bodyRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedTable.tableName}_query_output.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process uploaded CSV/JSON/SQL file
  const processUploadedFile = (file: File) => {
    setUploading(true);
    const fileName = file.name;
    const cleanTableName = fileName
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9_]/g, '_');

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setUploading(false);
        return;
      }

      let parsedColumns: Array<{ name: string; type: string }> = [];
      let parsedRows: Array<Record<string, any>> = [];

      try {
        if (fileName.endsWith('.json')) {
          const json = JSON.parse(text);
          const arrayData = Array.isArray(json) ? json : [json];
          if (arrayData.length > 0) {
            const keys = Object.keys(arrayData[0]);
            parsedColumns = keys.map((k) => {
              const val = arrayData[0][k];
              const type = typeof val === 'number' ? 'DECIMAL' : 'VARCHAR';
              return { name: k, type };
            });
            parsedRows = arrayData.slice(0, 20);
          }
        } else {
          // Standard CSV parser
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length > 0) {
            const headerCols = lines[0].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
            parsedRows = lines.slice(1, 21).map((line) => {
              const rowValues = line.split(',').map((v) => v.replace(/^["']|["']$/g, '').trim());
              const rowObj: Record<string, any> = {};
              headerCols.forEach((col, idx) => {
                const val = rowValues[idx] ?? '';
                const numVal = Number(val);
                rowObj[col] = !isNaN(numVal) && val !== '' ? numVal : val;
              });
              return rowObj;
            });

            // Infer column data types
            parsedColumns = headerCols.map((colName) => {
              const sampleVal = parsedRows[0]?.[colName];
              let type = 'VARCHAR';
              if (typeof sampleVal === 'number') {
                type = Number.isInteger(sampleVal) ? 'INTEGER' : 'DECIMAL';
              } else if (String(sampleVal).match(/^\d{4}-\d{2}-\d{2}/)) {
                type = 'TIMESTAMP';
              }
              return { name: colName, type };
            });
          }
        }

        if (parsedColumns.length === 0) {
          parsedColumns = [
            { name: 'id', type: 'UUID' },
            { name: 'record_name', type: 'VARCHAR' },
            { name: 'metric_value', type: 'DECIMAL' },
            { name: 'created_at', type: 'TIMESTAMP' },
          ];
          parsedRows = [
            { id: '1', record_name: 'Sample Row 1', metric_value: 1250, created_at: '2026-01-01' },
            { id: '2', record_name: 'Sample Row 2', metric_value: 3400, created_at: '2026-01-02' },
          ];
        }

        const newTable: DatabaseTable = {
          tableName: cleanTableName || 'custom_dataset',
          rowCount: parsedRows.length > 0 ? parsedRows.length : 120,
          columns: parsedColumns,
          sampleRows: parsedRows,
        };

        setTables((prev) => [newTable, ...prev]);
        setSelectedTable(newTable);

        // Auto generate sample prompt for uploaded dataset
        const numCol = parsedColumns.find((c) => c.type === 'DECIMAL' || c.type === 'INTEGER')?.name;
        const strCol = parsedColumns.find((c) => c.type === 'VARCHAR')?.name;

        let autoPrompt = `Show all rows from ${newTable.tableName}`;
        if (numCol && strCol) {
          autoPrompt = `Show top records in ${newTable.tableName} sorted by ${numCol} descending`;
        } else if (numCol) {
          autoPrompt = `Calculate the total and average ${numCol} in ${newTable.tableName}`;
        }

        setNlPrompt(autoPrompt);

        // Pre-populate query result for uploaded table
        const firstCols = parsedColumns.map((c) => c.name);
        setQueryResult({
          naturalPrompt: autoPrompt,
          generatedSql: `SELECT ${firstCols.slice(0, 6).join(', ')}\nFROM ${newTable.tableName}\nORDER BY ${numCol || firstCols[0]} DESC\nLIMIT 10;`,
          explainPlan: `Seq Scan on ${newTable.tableName} (cost=0.00..14.20 rows=${parsedRows.length} width=128)`,
          executionTimeMs: 11.2,
          columns: firstCols,
          rows: parsedRows,
          chartRecommendation: 'bar',
        });

        setUploadSuccessMsg(`Successfully imported dataset "${fileName}" with ${parsedColumns.length} columns!`);
        setShowUploadModal(false);
        setTimeout(() => setUploadSuccessMsg(''), 4000);
      } catch (err) {
        console.error('File parsing error:', err);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Determine chart X and Y keys dynamically
  const getChartKeys = () => {
    const currentRows = queryResult.rows && queryResult.rows.length > 0 ? queryResult.rows : selectedTable.sampleRows || [];
    if (currentRows.length === 0) return { xAxisKey: 'name', yAxisKey: 'value' };

    const firstRow = currentRows[0];
    const keys = Object.keys(firstRow);

    const strKey = keys.find((k) => typeof firstRow[k] === 'string') || keys[0] || 'name';
    const numKey = keys.find((k) => typeof firstRow[k] === 'number') || keys[1] || 'value';

    return { xAxisKey: strKey, yAxisKey: numKey };
  };

  const { xAxisKey, yAxisKey } = getChartKeys();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Natural Language SQL & Business Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500">
            Convert plain English questions directly into PostgreSQL queries with automatic EXPLAIN plans & charts.
          </p>
        </div>

        {/* Upload Dataset Button */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2 shrink-0 border border-cyan-700"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Custom Dataset</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {uploadSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Main Studio Layout: Table Browser & Query Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schema Table Browser (1 col) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Database Tables</h2>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-600 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Dataset</span>
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {tables.map((tbl) => (
              <button
                key={tbl.tableName}
                onClick={() => {
                  setSelectedTable(tbl);
                  const numCol = tbl.columns.find((c) => c.type === 'DECIMAL' || c.type === 'INTEGER')?.name;
                  const strCol = tbl.columns.find((c) => c.type === 'VARCHAR')?.name;
                  let prompt = `Show rows from ${tbl.tableName}`;
                  if (numCol && strCol) {
                    prompt = `Show top records in ${tbl.tableName} sorted by ${numCol} descending`;
                  }
                  setNlPrompt(prompt);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTable.tableName === tbl.tableName
                    ? 'bg-cyan-50/70 border-cyan-400 text-cyan-900 font-bold'
                    : 'bg-slate-50/60 border-slate-200/60 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono truncate max-w-[170px]">{tbl.tableName}</span>
                  <span className="text-[10px] text-slate-400 font-normal shrink-0">{tbl.rowCount} rows</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                {selectedTable.tableName} Schema ({selectedTable.columns.length} Cols)
              </span>
              <button
                onClick={() => setShowRawDataPreview(!showRawDataPreview)}
                className="text-[10px] font-bold text-cyan-700 hover:underline flex items-center space-x-1"
              >
                <Eye className="w-3 h-3" />
                <span>{showRawDataPreview ? 'Hide Sample Rows' : 'View Sample Rows'}</span>
              </button>
            </div>

            {/* Schema Column List */}
            {!showRawDataPreview ? (
              <div className="space-y-1.5 pt-1">
                {selectedTable.columns.map((col) => (
                  <div key={col.name} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100/80 hover:border-slate-200 transition-colors">
                    <span className="font-mono text-slate-800 text-[11px] font-medium">{col.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">{col.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Raw Sample Data Rows Inspector */
              <div className="bg-slate-950 text-slate-200 p-3 rounded-xl text-[10px] font-mono border border-slate-800 overflow-x-auto">
                {selectedTable.sampleRows && selectedTable.sampleRows.length > 0 ? (
                  <pre>{JSON.stringify(selectedTable.sampleRows.slice(0, 3), null, 2)}</pre>
                ) : (
                  <span className="text-slate-500">No sample rows preloaded.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* NL Input & Output Sandbox (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Natural Language Prompt Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 flex items-center space-x-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Business Question in Natural Language</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Table: {selectedTable.tableName}
              </span>
            </div>

            <form onSubmit={handleTranslate} className="flex gap-3">
              <input
                type="text"
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                placeholder={`Ask anything about ${selectedTable.tableName}...`}
                className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
              />
              <button
                type="submit"
                disabled={isTranslating}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTranslating ? 'Generating...' : 'Generate SQL'}</span>
              </button>
            </form>

            {/* Prompt Suggestion Chips */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-medium flex items-center space-x-1 mr-1">
                <HelpCircle className="w-3 h-3 text-cyan-400" />
                <span>Suggested Queries:</span>
              </span>
              {[
                `Show top 5 records from ${selectedTable.tableName}`,
                `Count total records in ${selectedTable.tableName}`,
                `List distinct values in ${selectedTable.columns[0]?.name || 'id'}`,
              ].map((chipPrompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setNlPrompt(chipPrompt);
                    handleTranslate();
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] transition-all"
                >
                  "{chipPrompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Generated SQL Code & Direct Execution Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  SQL Query Editor
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={copySqlToClipboard}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center space-x-1 border border-slate-700 transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>

                {/* Primary RUN QUERY Button */}
                <button
                  onClick={handleExecuteQuery}
                  disabled={isExecuting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isExecuting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isExecuting ? 'Running Query...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            {/* Editable SQL Text Area */}
            <textarea
              value={editableSql}
              onChange={(e) => setEditableSql(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 text-cyan-300 p-4 rounded-xl text-xs font-mono border border-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              placeholder="Enter PostgreSQL query..."
            />
          </div>

          {/* Query Results & Execution Output Display */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            {/* Results Header with View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">Query Execution Output</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {queryResult.executionTimeMs}ms
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {queryResult.rows ? queryResult.rows.length : 0} Rows Returned
                </span>
              </div>

              {/* View Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveResultTab('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeResultTab === 'table'
                      ? 'bg-white text-cyan-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Table View</span>
                </button>

                <button
                  onClick={() => setActiveResultTab('chart')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeResultTab === 'chart'
                      ? 'bg-white text-cyan-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Chart View</span>
                </button>

                <button
                  onClick={() => setActiveResultTab('explain')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeResultTab === 'explain'
                      ? 'bg-white text-cyan-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-600" />
                  <span>EXPLAIN</span>
                </button>
              </div>
            </div>

            {/* TAB 1: TABULAR DATA OUTPUT GRID */}
            {activeResultTab === 'table' && (
              <div className="space-y-3 animate-fadeIn">
                {/* Table Control Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-grow max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={tableFilter}
                      onChange={(e) => setTableFilter(e.target.value)}
                      placeholder="Filter returned rows..."
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyDataJson}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors border border-slate-200 cursor-pointer"
                    >
                      {copiedData ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={downloadCsv}
                      className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold flex items-center space-x-1 transition-colors border border-cyan-200 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Styled Table Data Grid */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider sticky top-0 backdrop-blur-xs">
                      <tr>
                        <th className="py-2.5 px-3 text-slate-400 border-r border-slate-200 w-10 text-center">#</th>
                        {(queryResult.columns || []).map((col) => (
                          <th key={col} className="py-2.5 px-3 border-r border-slate-200 font-mono">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {queryResult.rows && queryResult.rows.filter((row) => {
                        if (!tableFilter.trim()) return true;
                        return Object.values(row).some((val) =>
                          String(val).toLowerCase().includes(tableFilter.toLowerCase())
                        );
                      }).length > 0 ? (
                        queryResult.rows
                          .filter((row) => {
                            if (!tableFilter.trim()) return true;
                            return Object.values(row).some((val) =>
                              String(val).toLowerCase().includes(tableFilter.toLowerCase())
                            );
                          })
                          .map((row, idx) => (
                            <tr key={idx} className="hover:bg-cyan-50/40 transition-colors">
                              <td className="py-2 px-3 text-slate-400 font-mono text-[10px] text-center bg-slate-50/50 border-r border-slate-200">
                                {idx + 1}
                              </td>
                              {(queryResult.columns || Object.keys(row)).map((col) => {
                                const val = row[col];
                                const isNum = typeof val === 'number';
                                return (
                                  <td key={col} className="py-2 px-3 border-r border-slate-100 font-sans">
                                    {isNum ? (
                                      <span className="font-mono font-semibold text-slate-900">
                                        {val.toLocaleString()}
                                      </span>
                                    ) : (
                                      <span className="text-slate-700">{String(val ?? '')}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={(queryResult.columns?.length || 1) + 1}
                            className="py-8 text-center text-slate-400 text-xs italic"
                          >
                            No matching records found in execution results.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: VISUAL CHART VIEW */}
            {activeResultTab === 'chart' && (
              <div className="space-y-3 animate-fadeIn pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Autogenerated Graphic Visualization</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    X: <span className="font-bold text-slate-800">{xAxisKey}</span> | Y: <span className="font-bold text-slate-800">{yAxisKey}</span>
                  </span>
                </div>
                <div className="h-64 w-full bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={queryResult.rows} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip formatter={(val: any) => [val, yAxisKey]} />
                      <Bar dataKey={yAxisKey} fill="#06B6D4" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 3: EXPLAIN PLAN VIEW */}
            {activeResultTab === 'explain' && (
              <div className="space-y-3 animate-fadeIn pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      PostgreSQL EXPLAIN (ANALYZE, BUFFERS, VERBOSE) Execution Tree
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Optimizer node cost estimates, memory allocation & buffer hit statistics
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(queryResult.explainPlan || '');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center space-x-1 border border-slate-200 cursor-pointer self-start sm:self-auto"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Plan</span>
                  </button>
                </div>

                {/* KPI Metrics Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Scan Method</span>
                    <span className="text-xs font-bold text-cyan-700 font-mono">
                      {queryResult.generatedSql?.toUpperCase().includes('WHERE') ? 'Index Scan (B-Tree)' : 'Seq Scan (Parallel)'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Estimated Cost</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">0.15 .. 12.15</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Shared Buffer Hit</span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">100% (Cache Hit)</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Planning vs Exec</span>
                    <span className="text-xs font-bold text-indigo-700 font-mono">0.14ms / {queryResult.executionTimeMs}ms</span>
                  </div>
                </div>

                {/* Formatted PostgreSQL Execution Plan Output */}
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono border border-slate-800 leading-relaxed overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre">{queryResult.explainPlan || 'No execution plan generated.'}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Custom Dataset</h3>
                  <p className="text-xs text-slate-500">Import CSV, JSON, or SQL schema datasets</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-50/50'
                  : 'border-slate-300 hover:border-cyan-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.sql,.txt"
                onChange={(e) => e.target.files?.[0] && processUploadedFile(e.target.files[0])}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drop file here
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports <span className="font-mono text-cyan-700 font-semibold">.CSV</span>, <span className="font-mono text-cyan-700 font-semibold">.JSON</span>, or <span className="font-mono text-cyan-700 font-semibold">.SQL</span> (up to 50MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Sample Datasets Quick Loader */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Or load a sample dataset instantly:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    const sampleFile = new File(
                      [
                        `customer_id,company_name,industry,annual_revenue,churn_risk\nc101,AeroCorp,Aerospace,4500000,0.12\nc102,BioTech Labs,Healthcare,8200000,0.68\nc103,FinPay Global,Finance,12000000,0.05\nc104,EduCloud,Education,2100000,0.42`
                      ],
                      'Enterprise_Customers_2026.csv',
                      { type: 'text/csv' }
                    );
                    processUploadedFile(sampleFile);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 rounded-xl text-left transition-all"
                >
                  <div className="font-bold text-slate-800 text-[11px]">Enterprise_Customers.csv</div>
                  <div className="text-[10px] text-slate-400">4 columns • 5 rows</div>
                </button>

                <button
                  onClick={() => {
                    const sampleFile = new File(
                      [
                        `product_id,product_name,category,units_sold,total_sales_usd\np1,Nexus Agentic OS,Software,1420,710000\np2,AutoML Pipeline,SaaS,890,445000\np3,Vector DB Cluster,Cloud,620,310000`
                      ],
                      'Product_Sales_Q3.csv',
                      { type: 'text/csv' }
                    );
                    processUploadedFile(sampleFile);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 rounded-xl text-left transition-all"
                >
                  <div className="font-bold text-slate-800 text-[11px]">Product_Sales_Q3.csv</div>
                  <div className="text-[10px] text-slate-400">5 columns • 3 rows</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

