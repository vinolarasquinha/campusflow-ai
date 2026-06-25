import React, { useState, useEffect } from 'react';
import { noticeService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Bell,
  Sparkles,
  Send,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function NoticeSummarizer() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [eventDate, setEventDate] = useState('');

  // UI state for expanding cards
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await noticeService.getAll();
      if (res.success) {
        setNotices(res.notices || []);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      toast.error('Failed to load notices board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !noticeText) {
      toast.error('Notice title and text are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title,
        notice_text: noticeText,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
      };

      const res = await noticeService.create(payload);
      if (res.success) {
        toast.success(`Notice broadcasted successfully to ${res.totalRecipients || 0} students!`);
        setTitle('');
        setNoticeText('');
        setEventDate('');
        fetchNotices();
      }
    } catch (err) {
      console.error('Broadcast notice error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit notice');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedNoticeId(expandedNoticeId === id ? null : id);
  };

  const formatBulletPoints = (text) => {
    if (!text) return [];
    return text.split('\n')
      .map(l => l.trim().replace(/^[-*+•\d+\.]\s*/, ''))
      .filter(Boolean);
  };

  if (loading && notices.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-900 rounded-xl w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-gray-900 rounded-2xl"></div>
          <div className="h-96 bg-gray-900 rounded-2xl lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white m-0">Notice Board & Summarizer</h1>
        <p className="text-gray-400 text-sm mt-1">Submit raw college notices to generate AI summaries and broadcast them immediately.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Broadcast Form Panel */}
        <div className="glass-panel p-6 border-gray-800 bg-gradient-to-b from-white/[0.01] to-transparent h-fit">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-purple" />
            Post & Broadcast Notice
          </h3>
          <p className="text-xs text-gray-500 mb-6">Posting runs Gemini to summarize key facts and sends WhatsApp alerts to students.</p>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notice Title</label>
              <input
                type="text"
                placeholder="End Sem Practical Exam Schedule"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Event / Deadline Date <span className="text-gray-650 font-normal">(Optional)</span></label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Raw Notice Text</label>
              <textarea
                placeholder="Paste the full, long text of your notice here..."
                rows={6}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="input-field text-xs resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-accent w-full py-3.5 mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Broadcasting & Summarizing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4.5 w-4.5" />
                  <span>Summarize & Broadcast</span>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Notice Board List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-white font-bold text-base">Active Notice Board</h3>
          
          {notices.length > 0 ? (
            <div className="space-y-4">
              {notices.map((notice) => {
                const isExpanded = expandedNoticeId === notice.id;
                const bulletPoints = formatBulletPoints(notice.summary);

                return (
                  <div
                    key={notice.id}
                    className="glass-panel p-6 border-gray-800 bg-gradient-to-br from-white/[0.005] to-transparent hover:border-gray-700/60 transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className="text-white text-base font-bold truncate">{notice.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notice.created_at ? format(parseISO(notice.created_at), 'MMM d, yyyy') : 'Recently'}
                          </span>
                          {notice.event_date && (
                            <span className="flex items-center gap-1 text-brand-purple">
                              <Calendar className="h-3 w-3" />
                              Event: {format(parseISO(notice.event_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(notice.id)}
                        className="p-1 text-gray-500 hover:text-white rounded bg-gray-900 border border-gray-850"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* AI Summary Block (Always visible) */}
                    {notice.summary && (
                      <div className="mt-4 p-4 rounded-xl border border-brand-purple/15 bg-brand-purple/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-10 w-10 text-brand-purple/10 pointer-events-none">
                          <Sparkles className="h-full w-full" />
                        </div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
                          AI Summary Highlights
                        </h5>
                        <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1.5 leading-relaxed">
                          {bulletPoints.map((pt, pidx) => (
                            <li key={pidx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Expandable Raw Text Block */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-850/60 space-y-2 animate-pulse-slow">
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-gray-500" />
                          Full Original Text
                        </h5>
                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                          {notice.notice_text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-16 text-center border-gray-850">
              <Bell className="h-10 w-10 text-gray-700 mx-auto mb-4 animate-float" />
              <h4 className="text-white text-base font-bold">No active notices found</h4>
              <p className="text-gray-500 text-xs mt-1">Use the broadcaster tool to generate and sync the first notice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
