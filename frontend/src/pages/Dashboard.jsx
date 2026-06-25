import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { motion } from 'framer-motion';
import { dashboardService, taskService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  Sparkles,
  Zap,
  Plus,
  ArrowRight,
  ClipboardList,
  AlertCircle,
  FileText,
  Activity,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow, isAfter, parseISO } from 'date-fns';

export default function Dashboard() {
  const { activeStudent } = useStudent();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!activeStudent) return;
    try {
      setLoading(true);
      const res = await dashboardService.get(activeStudent.id);
      if (res.success) {
        setData(res.dashboard);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeStudent) {
      // If no active student, redirect to landing
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [activeStudent]);

  const handleToggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const res = await taskService.update(task.id, { status: newStatus });
      if (res.success) {
        toast.success(`Task marked as ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-900 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-900 rounded-2xl"></div>
          <div className="h-32 bg-gray-900 rounded-2xl"></div>
          <div className="h-32 bg-gray-900 rounded-2xl"></div>
        </div>
        <div className="h-24 bg-gray-900 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-900 rounded-2xl lg:col-span-2"></div>
          <div className="h-64 bg-gray-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, upcomingDeadlines, recentNotices, aiTip } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight m-0">
            Welcome Back, <span className="gradient-text">{activeStudent.name}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here is a summary of your workspace activities today.</p>
        </div>
        <Link to="/tasks" className="btn-primary py-2 px-4 text-sm shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Link>
      </div>

      {/* AI Daily Tip Banner */}
      {aiTip && (
        <div className="glass-panel p-5 bg-gradient-to-r from-brand-purple/10 via-brand-magenta/5 to-transparent border-brand-purple/20 flex gap-4 items-start relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brand-purple/10 blur-xl pointer-events-none" />
          <div className="p-2 bg-brand-purple/20 text-brand-magenta rounded-xl">
            <Sparkles className="h-5 w-5 animate-float" />
          </div>
          <div>
            <h4 className="text-white text-sm font-bold flex items-center gap-1.5">
              <span>AI Academic Tip</span>
            </h4>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed italic">
              "{aiTip}"
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="glass-panel p-6 border-gray-800 bg-gradient-to-br from-white/[0.01] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.totalTasks}</p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-6 border-brand-blue/20 bg-gradient-to-br from-brand-blue/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-brand-blue">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.pendingTasks}</p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.completedTasks}</p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Quick Productivity Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/ai-buddy" className="glass-panel p-4 text-center hover:border-brand-purple/40 hover:bg-brand-purple/5 transition-all group">
            <Sparkles className="h-6 w-6 text-brand-purple mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block">AI Study Buddy</span>
          </Link>
          <Link to="/attendance" className="glass-panel p-4 text-center hover:border-brand-cyan/40 hover:bg-brand-cyan/5 transition-all group">
            <Activity className="h-6 w-6 text-brand-cyan mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block">Attendance Risk</span>
          </Link>
          <Link to="/notices" className="glass-panel p-4 text-center hover:border-brand-blue/40 hover:bg-brand-blue/5 transition-all group">
            <FileText className="h-6 w-6 text-brand-blue mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block">Summarize Notice</span>
          </Link>
          <Link to="/automation-logs" className="glass-panel p-4 text-center hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group">
            <Zap className="h-6 w-6 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block">Automation Logs</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Deadlines and Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-brand-cyan" />
              <span>Upcoming Deadlines</span>
            </h3>
            <Link to="/tasks" className="text-xs text-brand-cyan hover:underline flex items-center gap-1">
              <span>View All Tasks</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="glass-panel p-6 border-gray-800 space-y-4">
            {upcomingDeadlines.length > 0 ? (
              <div className="divide-y divide-gray-850">
                {upcomingDeadlines.map((task) => {
                  const isCompleted = task.status === 'completed';
                  const deadlineDate = parseISO(task.deadline);
                  const isOverdue = !isCompleted && !isAfter(deadlineDate, new Date());
                  
                  return (
                    <div key={task.id} className="flex items-start justify-between py-3.5 first:pt-0 last:pb-0 gap-4 group">
                      <div className="flex items-start min-w-0 gap-3">
                        <button
                          onClick={() => handleToggleTaskStatus(task)}
                          className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isCompleted
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : isOverdue
                              ? 'border-red-500/40 hover:border-red-500 text-transparent bg-red-500/5'
                              : 'border-gray-700 hover:border-brand-cyan text-transparent'
                          }`}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors truncate ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-900 border border-gray-800 px-2 py-0.5 rounded text-gray-400">
                              {task.subject || 'General'}
                            </span>
                            <span className={`text-[10px] flex items-center gap-1 ${
                              isCompleted
                                ? 'text-gray-500'
                                : isOverdue
                                ? 'text-red-400 font-bold'
                                : 'text-gray-400'
                            }`}>
                              <Calendar className="h-3 w-3" />
                              {isCompleted 
                                ? 'Completed' 
                                : isOverdue 
                                ? 'Overdue!' 
                                : `Due ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Priority Badge */}
                      {task.priority && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-3 animate-float" />
                <p className="text-sm text-gray-500">All caught up! No upcoming deadlines found.</p>
                <Link to="/tasks" className="btn-secondary w-fit mx-auto mt-4 text-xs py-1.5 px-3">
                  Create a task
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Board Notices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-purple" />
              <span>Campus Notices</span>
            </h3>
            <Link to="/notices" className="text-xs text-brand-purple hover:underline flex items-center gap-1">
              <span>Broadcaster</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="glass-panel p-6 border-gray-800 space-y-4">
            {recentNotices.length > 0 ? (
              <div className="space-y-4">
                {recentNotices.map((notice) => (
                  <div key={notice.id} className="p-3 bg-background-deep/40 border border-gray-850 hover:border-brand-purple/35 rounded-xl transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{notice.title}</h4>
                      {notice.event_date && (
                        <span className="text-[9px] text-brand-purple shrink-0 font-semibold bg-brand-purple/10 px-1.5 py-0.5 rounded border border-brand-purple/20">
                          {new Date(notice.event_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {notice.summary || notice.notice_text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-3 animate-float" />
                <p className="text-sm text-gray-500">No college board notices posted yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
