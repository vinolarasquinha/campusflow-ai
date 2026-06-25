import React, { useState, useEffect } from 'react';
import { automationService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Logs,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Zap
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AutomationLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // UI state for expanding log detail
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await automationService.getLogs();
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      toast.error('Failed to load automation audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  useEffect(() => {
    let result = [...logs];
    
    if (search.trim()) {
      result = result.filter(
        (log) =>
          log.workflow_name.toLowerCase().includes(search.toLowerCase()) ||
          (log.details && log.details.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((log) => log.status === statusFilter);
    }

    setFilteredLogs(result);
  }, [logs, search, statusFilter]);

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'SUCCESS':
        return {
          icon: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />,
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: 'Success'
        };
      case 'FAILED':
        return {
          icon: <XCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />,
          badge: 'bg-red-500/10 text-red-400 border-red-500/20',
          label: 'Failed'
        };
      default:
        return {
          icon: <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0" />,
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: status || 'Config Warning'
        };
    }
  };

  // Format JSON code details nicely
  const formatJSONDetails = (detailsStr) => {
    if (!detailsStr) return 'No payload details available.';
    try {
      // If it is JSON parseable, format it nicely
      const parsed = JSON.parse(detailsStr);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return detailsStr;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-900 rounded-xl w-1/4"></div>
        <div className="h-14 bg-gray-900 rounded-xl"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-900 rounded-xl"></div>
          <div className="h-20 bg-gray-900 rounded-xl"></div>
          <div className="h-20 bg-gray-900 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white m-0">Automation Logs</h1>
          <p className="text-gray-400 text-sm mt-1">Audit active webhook workflows connecting calendar syncing, notifications, and Twilio alerts.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 shrink-0"
          title="Refresh Logs List"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel p-4 border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search payload values or run names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-2 bg-background-deep/60 px-3 py-1.5 border border-gray-800 rounded-xl shrink-0 w-full sm:w-auto">
          <Logs className="h-3.5 w-3.5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-gray-300 focus:outline-none cursor-pointer w-full"
          >
            <option value="all">All Logs Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="CONFIG_MISSING">Missing Webhook Config</option>
          </select>
        </div>
      </div>

      {/* Logs List Timeline */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const statusInfo = getStatusDetails(log.status);

            return (
              <div
                key={log.id}
                className="glass-panel border-gray-800 bg-gradient-to-r from-white/[0.005] to-transparent overflow-hidden"
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Status Circle Icon */}
                    {statusInfo.icon}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{log.workflow_name}</h4>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-550" />
                        {log.created_at ? format(parseISO(log.created_at), 'MMM d, yyyy • h:mm:ss a') : 'Recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-gray-900 border border-gray-850 px-2 py-0.5 rounded text-gray-500 shrink-0">
                      ID: #{log.id.slice(0, 8)}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-gray-400" /> : <ChevronDown className="h-4.5 w-4.5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded run details output logs display */}
                {isExpanded && (
                  <div className="border-t border-gray-850 bg-background-deep/50 p-5 space-y-3 animate-pulse-slow">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-gray-500" />
                      Payload Execution Logs Output
                    </h5>
                    
                    <pre className="text-[11px] font-mono text-gray-400 bg-background-deep border border-gray-850 p-4 rounded-xl overflow-x-auto leading-relaxed max-w-full">
                      {formatJSONDetails(log.details)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-16 text-center border-gray-850">
          <Zap className="h-10 w-10 text-gray-700 mx-auto mb-4 animate-float" />
          <h4 className="text-white text-base font-bold">No logs record match filters</h4>
          <p className="text-gray-500 text-xs mt-1">Make sure you have triggered notice broadcasts or created tasks to log execution statuses.</p>
        </div>
      )}
    </div>
  );
}
