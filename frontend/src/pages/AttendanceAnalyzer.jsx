import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { aiService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

export default function AttendanceAnalyzer() {
  const { activeStudent } = useStudent();
  const [subject, setSubject] = useState('');
  const [percentage, setPercentage] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // SVG Circular Ring parameters
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numPercent = Number(percentage);
    if (!subject) {
      toast.error('Please select or specify a subject');
      return;
    }
    if (percentage === '' || numPercent < 0 || numPercent > 100) {
      toast.error('Please provide a valid percentage (0-100)');
      return;
    }

    try {
      setLoading(true);
      setAnalysis(null);
      const res = await aiService.analyzeAttendance(subject, numPercent);
      if (res.success) {
        setAnalysis(res.analysis);
        toast.success('Attendance analysis generated!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze attendance');
    } finally {
      setLoading(false);
    }
  };

  const getRiskStatus = (val) => {
    const num = Number(val);
    if (num >= 75) return { label: 'Safe', color: 'text-emerald-400', ringColor: 'stroke-emerald-500', glow: 'shadow-glow-cyan bg-emerald-500/10' };
    if (num >= 65) return { label: 'Moderate Risk', color: 'text-amber-400', ringColor: 'stroke-amber-500', glow: 'shadow-glow-purple bg-amber-500/10' };
    return { label: 'Critical Risk', color: 'text-red-400', ringColor: 'stroke-red-500', glow: 'shadow-glow-purple bg-red-500/10' };
  };

  const strokeDashoffset = percentage !== '' ? circumference - (Math.min(Math.max(Number(percentage), 0), 100) / 100) * circumference : circumference;
  const currentRisk = percentage !== '' ? getRiskStatus(percentage) : { label: 'Unknown', color: 'text-gray-400', ringColor: 'stroke-gray-800', glow: 'bg-gray-900/50' };

  // Parse text guidelines
  const parseAnalysisLines = (text) => {
    if (!text) return [];
    return text.split('\n').map(l => l.trim()).filter(Boolean);
  };

  const availableSubjects = activeStudent?.subjects || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white m-0">Attendance Risk Alerter</h1>
        <p className="text-gray-400 text-sm mt-1">Audit attendance ratios and forecast risks using Gemini intelligence.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form */}
        <div className="glass-panel p-6 border-gray-800 bg-gradient-to-b from-white/[0.01] to-transparent h-fit">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-cyan" />
            Attendance Audit
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
              {availableSubjects.length > 0 ? (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">-- Choose Subject --</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="Custom Subject">Other (Specify below)</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Data Communication"
                  className="input-field text-sm"
                  required
                />
              )}
            </div>

            {/* Custom Subject field if selected or no subjects */}
            {(subject === 'Custom Subject' || availableSubjects.length === 0) && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Specify Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Embedded Systems"
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field text-sm"
                  required
                />
              </div>
            )}

            {/* Attendance Percentage input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current Attendance %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g. 72"
                className="input-field text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-background border-t-transparent rounded-full" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-background" />
                  <span>Analyze Risk Profile</span>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Panels */}
        <div className="lg:col-span-2 space-y-6">
          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Circular gauge */}
              <div className="glass-panel p-6 border-gray-805 flex flex-col justify-center items-center text-center">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Percentage Ratio</h4>
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    {/* Track */}
                    <circle
                      className="text-gray-900 stroke-current"
                      strokeWidth={stroke}
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    {/* Fill */}
                    <circle
                      className={`stroke-current transition-all duration-500 ${currentRisk.ringColor}`}
                      strokeWidth={stroke}
                      strokeDasharray={circumference + ' ' + circumference}
                      style={{ strokeDashoffset }}
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                  </svg>
                  <span className="absolute text-2xl font-black text-white">{percentage}%</span>
                </div>
                <span className={`text-xs font-bold mt-4 px-3 py-1 rounded-full ${currentRisk.glow} ${currentRisk.color}`}>
                  {currentRisk.label}
                </span>
              </div>

              {/* Advisory Details Panel */}
              <div className="glass-panel p-6 border-gray-805 md:col-span-2 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-brand-cyan" />
                  Gemini AI Advisor Insights
                </h4>

                <div className="space-y-3">
                  {parseAnalysisLines(analysis).map((line, idx) => {
                    const isRiskHeader = line.toLowerCase().includes('risk level');
                    const isClassesNeeded = line.toLowerCase().includes('classes needed') || line.toLowerCase().includes('class needed') || line.toLowerCase().includes('approximate classes');
                    
                    let cardBg = 'bg-background-deep/30 border-gray-850';
                    let icon = <HelpCircle className="h-4 w-4 text-gray-400 shrink-0" />;

                    if (isRiskHeader) {
                      cardBg = 'bg-red-500/5 border-red-500/10';
                      icon = <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />;
                    } else if (isClassesNeeded) {
                      cardBg = 'bg-brand-blue/5 border-brand-blue/10';
                      icon = <TrendingUp className="h-4 w-4 text-brand-blue shrink-0" />;
                    } else if (line.startsWith('-') || line.startsWith('3.') || line.toLowerCase().includes('advice')) {
                      cardBg = 'bg-emerald-500/5 border-emerald-500/10';
                      icon = <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />;
                    }

                    return (
                      <div key={idx} className={`p-3 border rounded-xl flex items-start gap-3 text-xs leading-relaxed text-gray-300 ${cardBg}`}>
                        {icon}
                        <span className="whitespace-pre-wrap">{line}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-16 text-center border-gray-850 h-full flex flex-col justify-center items-center">
              <Activity className="h-10 w-10 text-gray-700 mx-auto mb-4 animate-float" />
              <h4 className="text-white text-base font-bold">Awaiting Input parameters</h4>
              <p className="text-gray-500 text-xs mt-1">Specify subject and attendance percentage values to execute calculations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
