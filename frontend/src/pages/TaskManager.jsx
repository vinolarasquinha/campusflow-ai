import React, { useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { taskService } from '../services/api';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  CheckSquare,
  Clock,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';

export default function TaskManager() {
  const { activeStudent } = useStudent();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // View & Date states
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline-asc');

  // React Hook Form for Create/Edit
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchTasks = async () => {
    if (!activeStudent) return;
    try {
      setLoading(true);
      const res = await taskService.getAll();
      if (res.success) {
        // Filter tasks belonging only to the active student
        const userTasks = (res.tasks || []).filter(
          (t) => t.student_id === activeStudent.id
        );
        setTasks(userTasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to retrieve task list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeStudent]);

  // Handle Search, Filtering, and Sorting
  useEffect(() => {
    let result = [...tasks];

    // Search
    if (search.trim()) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority Filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Subject Filter
    if (subjectFilter !== 'all') {
      result = result.filter((t) => t.subject === subjectFilter);
    }

    // Sorting
    if (sortBy === 'deadline-asc') {
      result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sortBy === 'deadline-desc') {
      result.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredTasks(result);
  }, [tasks, search, statusFilter, priorityFilter, subjectFilter, sortBy]);

  // Toggle status
  const handleToggleStatus = async (task) => {
    try {
      const updatedStatus = task.status === 'completed' ? 'pending' : 'completed';
      const res = await taskService.update(task.id, { status: updatedStatus });
      if (res.success) {
        toast.success(`Task marked as ${updatedStatus}`);
        fetchTasks();
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      toast.error('Failed to update task status');
    }
  };

  // Create Task Action
  const onCreateSubmit = async (data) => {
    try {
      const payload = {
        student_id: activeStudent.id,
        title: data.title,
        subject: data.subject || '',
        description: data.description || '',
        deadline: new Date(data.deadline).toISOString(),
        reminder_time: data.reminder_time ? new Date(data.reminder_time).toISOString() : null,
        add_to_calendar: !!data.add_to_calendar,
        whatsapp_reminder: !!data.whatsapp_reminder,
        ai_study_plan: !!data.ai_study_plan,
        priority: data.priority || 'medium',
      };

      const res = await taskService.create(payload);
      if (res.success) {
        toast.success('Task created successfully! Automation triggered.');
        setIsCreateOpen(false);
        reset();
        fetchTasks();
      }
    } catch (err) {
      console.error('Create task error:', err);
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  // Edit Task Action
  const onEditSubmit = async (data) => {
    if (!editingTask) return;
    try {
      const payload = {
        title: data.title,
        subject: data.subject || '',
        description: data.description || '',
        deadline: new Date(data.deadline).toISOString(),
        reminder_time: data.reminder_time ? new Date(data.reminder_time).toISOString() : null,
        add_to_calendar: !!data.add_to_calendar,
        whatsapp_reminder: !!data.whatsapp_reminder,
        ai_study_plan: !!data.ai_study_plan,
        priority: data.priority || 'medium',
      };

      const res = await taskService.update(editingTask.id, payload);
      if (res.success) {
        toast.success('Task updated successfully!');
        setEditingTask(null);
        fetchTasks();
      }
    } catch (err) {
      console.error('Update task error:', err);
      toast.error('Failed to update task');
    }
  };

  // Delete Task Action
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await taskService.delete(id);
      if (res.success) {
        toast.success('Task deleted successfully');
        fetchTasks();
      }
    } catch (err) {
      console.error('Delete task error:', err);
      toast.error('Failed to delete task');
    }
  };

  // Open Edit Modal
  const openEdit = (task) => {
    setEditingTask(task);
    setValue('title', task.title);
    setValue('subject', task.subject);
    setValue('description', task.description);
    // Format ISO string to datetime-local expected format: YYYY-MM-DDThh:mm
    setValue('deadline', task.deadline ? format(parseISO(task.deadline), "yyyy-MM-dd'T'HH:mm") : '');
    setValue('reminder_time', task.reminder_time ? format(parseISO(task.reminder_time), "yyyy-MM-dd'T'HH:mm") : '');
    setValue('add_to_calendar', task.add_to_calendar);
    setValue('whatsapp_reminder', task.whatsapp_reminder);
    setValue('ai_study_plan', task.ai_study_plan);
    setValue('priority', task.priority || 'medium');
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-900 rounded-xl w-1/4"></div>
        <div className="h-14 bg-gray-900 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-900 rounded-2xl"></div>
          <div className="h-48 bg-gray-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Get subjects list for filters
  const availableSubjects = activeStudent?.subjects || [];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayIndex };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + direction);
      return next;
    });
  };

  const handleDayClick = (day) => {
    reset();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setValue('deadline', `${year}-${month}-${dayStr}T12:00`);
    setIsCreateOpen(true);
  };

  const { daysInMonth, firstDayIndex } = getDaysInMonth(currentDate);
  const calendarDays = [];
  
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white m-0">Task Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Organize assignments, syllabus checkpoints, and self-studies.</p>
        </div>
        <button
          onClick={() => {
            reset();
            setIsCreateOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 text-background" />
          <span>Add Task</span>
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex bg-background-deep/45 p-1 border border-glass-border rounded-xl w-fit">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'list'
              ? 'bg-gradient-to-r from-brand-blue to-brand-cyan text-background font-bold shadow-glow-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'calendar'
              ? 'bg-gradient-to-r from-brand-blue to-brand-cyan text-background font-bold shadow-glow-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Calendar View
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel p-4 border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search task title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>

        {/* Filters Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Subject Filter */}
          <div className="flex items-center gap-1 bg-background-deep/60 px-3 py-1.5 border border-gray-800 rounded-xl shrink-0">
            <Filter className="h-3.5 w-3.5 text-gray-500" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-background-deep/60 px-3 py-1.5 border border-gray-800 rounded-xl shrink-0">
            <CheckSquare className="h-3.5 w-3.5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1 bg-background-deep/60 px-3 py-1.5 border border-gray-800 rounded-xl shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="deadline-asc">Deadline: Near First</option>
              <option value="deadline-desc">Deadline: Far First</option>
              <option value="title-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Content */}
      {viewMode === 'list' ? (
        filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const deadlineDate = parseISO(task.deadline);
              const isOverdue = !isCompleted && !isAfter(deadlineDate, new Date());

              return (
                <div
                  key={task.id}
                  className={`glass-panel p-6 border-gray-800 bg-gradient-to-b from-white/[0.01] to-transparent hover:border-gray-700/60 relative flex flex-col justify-between h-56 transition-all duration-200 ${
                    isCompleted ? 'opacity-65' : ''
                  }`}
                >
                  {/* Upper row */}
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] bg-gray-900 border border-gray-850 px-2.5 py-0.5 rounded-lg text-brand-cyan shrink-0 font-semibold uppercase">
                        {task.subject || 'General'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {task.priority && (
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
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
                    </div>

                    <h3 className={`text-base font-bold text-white line-clamp-1 truncate ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h3>
                    
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {task.description || <span className="italic text-gray-650">No description provided.</span>}
                    </p>
                  </div>

                  {/* Bottom row */}
                  <div className="border-t border-gray-850/60 pt-3.5 mt-4 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : isOverdue
                            ? 'border-red-500/40 hover:border-red-500 text-transparent bg-red-500/5'
                            : 'border-gray-700 hover:border-brand-cyan text-transparent'
                        }`}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                      <span className={`flex items-center gap-1 text-[11px] ${
                        isCompleted 
                          ? 'text-gray-500' 
                          : isOverdue 
                          ? 'text-red-450 font-bold' 
                          : 'text-gray-400'
                      }`}>
                        <Calendar className="h-3.5 w-3.5" />
                        {isCompleted 
                          ? 'Completed' 
                          : isOverdue 
                          ? 'Overdue!' 
                          : format(deadlineDate, 'MMM d, h:mm a')
                        }
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Automation Icons Indicators */}
                      {task.whatsapp_reminder && (
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-500" title="WhatsApp Automation Active" />
                      )}
                      {task.add_to_calendar && (
                        <Calendar className="h-3.5 w-3.5 text-blue-500" title="Google Calendar Export Active" />
                      )}
                      {task.ai_study_plan && (
                        <Sparkles className="h-3.5 w-3.5 text-brand-purple" title="AI Plan Active" />
                      )}

                      <button
                        onClick={() => openEdit(task)}
                        className="p-1 hover:text-white hover:bg-gray-850 rounded transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center border-gray-850">
            <CheckSquare className="h-12 w-12 text-gray-700 mx-auto mb-4 animate-float" />
            <h3 className="text-white text-base font-bold">No tasks matched your search</h3>
            <p className="text-gray-500 text-xs mt-1">Try clearing filters or add a new task to get started.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary w-fit mx-auto mt-6 text-xs"
            >
              Create First Task
            </button>
          </div>
        )
      ) : (
        /* Calendar View rendering */
        <div className="glass-panel p-6 border-gray-800 bg-gradient-to-b from-white/[0.005] to-transparent space-y-6">
          {/* Calendar Header with Navigation controls */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-850">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-cyan" />
              <span>{format(currentDate, 'MMMM yyyy')}</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-lg bg-gray-900 border border-gray-850 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-lg bg-gray-900 border border-gray-850 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Day Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 uppercase tracking-wider font-bold">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-28 rounded-xl bg-background-deep/10 border border-transparent opacity-25"
                  />
                );
              }

              // Filter tasks matching this day and active student
              const dayTasks = tasks.filter(t => {
                const d = parseISO(t.deadline);
                return d.getDate() === day &&
                       d.getMonth() === currentDate.getMonth() &&
                       d.getFullYear() === currentDate.getFullYear();
              });

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className="h-28 p-2 rounded-xl border border-gray-850/80 bg-background-deep/40 hover:border-brand-cyan/20 cursor-pointer transition-all hover:bg-background-deep/80 flex flex-col justify-between overflow-hidden group"
                >
                  <span className="text-xs font-bold text-gray-500 group-hover:text-brand-cyan transition-colors self-end">
                    {day}
                  </span>

                  {/* Tasks List */}
                  <div className="flex-1 overflow-y-auto mt-1 pr-1 space-y-1 scrollbar-thin">
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(t);
                        }}
                        className={`text-[9px] px-1.5 py-0.5 rounded truncate font-semibold border transition-all ${
                          t.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20 line-through'
                            : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 hover:border-brand-cyan/45'
                        }`}
                        title={`${format(parseISO(t.deadline), 'h:mm a')} - ${t.title}`}
                      >
                        <span className="opacity-60 mr-1 text-[8px]">
                          {format(parseISO(t.deadline), 'h:mm a')}
                        </span>
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- CREATE TASK MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 bg-background-card relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Create Task</h3>
            <p className="text-xs text-gray-450 mb-6">Create a deadline workflow including WhatsApp and Calendar reminders.</p>

            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Task Title</label>
                <input
                  type="text"
                  placeholder="AI Lab Assignment 3"
                  className="input-field text-sm"
                  {...register('title', { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
                  <select
                    className="input-field text-sm"
                    {...register('subject')}
                  >
                    <option value="">General</option>
                    {availableSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    className="input-field text-sm"
                    {...register('priority')}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Complete questions 1 to 5 regarding neural networks..."
                  rows={2}
                  className="input-field text-sm resize-none"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Deadline</label>
                  <input
                    type="datetime-local"
                    className="input-field text-xs"
                    {...register('deadline', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reminder Trigger Time</label>
                  <input
                    type="datetime-local"
                    className="input-field text-xs"
                    {...register('reminder_time')}
                  />
                </div>
              </div>

              {/* Automation Toggles */}
              <div className="pt-2 space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Automation Integrations</label>
                
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-850 hover:border-gray-800 bg-background-deep/40 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <MessageSquare className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">WhatsApp Twilio Reminder</p>
                        <p className="text-[10px] text-gray-500">Sends alerts to your registered phone number.</p>
                      </div>
                    </span>
                    <input type="checkbox" className="accent-brand-cyan h-4 w-4 rounded" {...register('whatsapp_reminder')} />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-850 hover:border-gray-800 bg-background-deep/40 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <Calendar className="h-4.5 w-4.5 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Google Calendar Sync</p>
                        <p className="text-[10px] text-gray-500">Syncs tasks as calendar events on Google Calendar.</p>
                      </div>
                    </span>
                    <input type="checkbox" className="accent-brand-cyan h-4 w-4 rounded" {...register('add_to_calendar')} />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-850 hover:border-gray-800 bg-background-deep/40 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <Sparkles className="h-4.5 w-4.5 text-brand-purple shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Generate AI Study Plan</p>
                        <p className="text-[10px] text-gray-500">Triggers Gemini to map a day-wise timeline.</p>
                      </div>
                    </span>
                    <input type="checkbox" className="accent-brand-cyan h-4 w-4 rounded" {...register('ai_study_plan')} />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-sm py-2"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT TASK MODAL --- */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 bg-background-card relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingTask(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Edit Task</h3>
            <p className="text-xs text-gray-450 mb-6">Modify task deadlines or toggle active automations.</p>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Task Title</label>
                <input
                  type="text"
                  placeholder="Task Title"
                  className="input-field text-sm"
                  {...register('title', { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
                  <select
                    className="input-field text-sm"
                    {...register('subject')}
                  >
                    <option value="">General</option>
                    {availableSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    className="input-field text-sm"
                    {...register('priority')}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Task Description"
                  rows={2}
                  className="input-field text-sm resize-none"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Deadline</label>
                  <input
                    type="datetime-local"
                    className="input-field text-xs"
                    {...register('deadline', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reminder Trigger Time</label>
                  <input
                    type="datetime-local"
                    className="input-field text-xs"
                    {...register('reminder_time')}
                  />
                </div>
              </div>

              {/* Automation Toggles */}
              <div className="pt-2 space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Automation Integrations</label>
                
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-850 hover:border-gray-800 bg-background-deep/40 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <MessageSquare className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">WhatsApp Twilio Reminder</p>
                        <p className="text-[10px] text-gray-500">Sends alerts to your registered phone number.</p>
                      </div>
                    </span>
                    <input type="checkbox" className="accent-brand-cyan h-4 w-4 rounded" {...register('whatsapp_reminder')} />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-850 hover:border-gray-800 bg-background-deep/40 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <Calendar className="h-4.5 w-4.5 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Google Calendar Sync</p>
                        <p className="text-[10px] text-gray-500">Syncs tasks as calendar events on Google Calendar.</p>
                      </div>
                    </span>
                    <input type="checkbox" className="accent-brand-cyan h-4 w-4 rounded" {...register('add_to_calendar')} />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-850 hover:border-gray-800 bg-background-deep/40 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <Sparkles className="h-4.5 w-4.5 text-brand-purple shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Generate AI Study Plan</p>
                        <p className="text-[10px] text-gray-500">Triggers Gemini to map a day-wise timeline.</p>
                      </div>
                    </span>
                    <input type="checkbox" className="accent-brand-cyan h-4 w-4 rounded" {...register('ai_study_plan')} />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-sm py-2"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
