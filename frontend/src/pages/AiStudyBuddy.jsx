import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { aiService, taskService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  FileText,
  Clock,
  HelpCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AiStudyBuddy() {
  const { activeStudent } = useStudent();
  const [activeTab, setActiveTab] = useState('study-plan');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STUDY PLAN STATES ---
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [planSubject, setPlanSubject] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planDeadline, setPlanDeadline] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');

  // --- FLASHCARD STATES ---
  const [flashcardNotes, setFlashcardNotes] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- MCQ STATES ---
  const [mcqNotes, setMcqNotes] = useState('');
  const [mcqs, setMcqs] = useState([]);
  const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // 'A', 'B', 'C', 'D'
  const [isAnswered, setIsAnswered] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Fetch student's tasks for study plan dropdown picker
  useEffect(() => {
    const loadTasks = async () => {
      if (!activeStudent) return;
      try {
        const res = await taskService.getAll();
        if (res.success) {
          const userTasks = (res.tasks || []).filter(
            (t) => t.student_id === activeStudent.id && t.status === 'pending'
          );
          setTasks(userTasks);
        }
      } catch (err) {
        console.error('Error fetching tasks for AI:', err);
      }
    };
    loadTasks();
  }, [activeStudent]);

  // Pre-fill fields when task selected
  const handleTaskChange = (taskId) => {
    setSelectedTaskId(taskId);
    if (!taskId) {
      setPlanSubject('');
      setPlanTitle('');
      setPlanDeadline('');
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setPlanSubject(task.subject || 'General');
      setPlanTitle(task.title);
      // Format deadline to date format for backend: YYYY-MM-DD
      setPlanDeadline(task.deadline ? format(parseISO(task.deadline), 'yyyy-MM-dd') : '');
    }
  };

  // --- GENERATE STUDY PLAN ---
  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!planSubject || !planDeadline || !planTitle) {
      toast.error('Please fill in all plan requirements');
      return;
    }
    try {
      setLoading(true);
      setGeneratedPlan('');
      const res = await aiService.generateStudyPlan(planSubject, planDeadline, planTitle);
      if (res.success) {
        setGeneratedPlan(res.studyPlan);
        toast.success('Study plan generated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  // Parses AI generated study plan days into nice blocks
  const parseStudyPlanDays = (text) => {
    if (!text) return [];
    // Day-wise parsing
    const sections = text.split(/(?=Day \d+:|Day \d+\s*-)/i);
    return sections.map(sec => {
      const lines = sec.split('\n').map(l => l.trim()).filter(Boolean);
      const header = lines[0] || 'Timeline Checkpoint';
      const bullets = lines.slice(1).map(l => l.replace(/^[-*+]\s*/, ''));
      return { header, bullets };
    }).filter(s => s.bullets.length > 0 || s.header !== 'Timeline Checkpoint');
  };

  // --- GENERATE FLASHCARDS ---
  const handleGenerateFlashcards = async (e) => {
    e.preventDefault();
    if (!flashcardNotes.trim()) {
      toast.error('Please input some notes content');
      return;
    }
    try {
      setLoading(true);
      setFlashcards([]);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      const res = await aiService.generateFlashcards(flashcardNotes);
      if (res.success) {
        const parsed = parseFlashcardsText(res.flashcards);
        if (parsed.length > 0) {
          setFlashcards(parsed);
          toast.success('Flashcards generated!');
        } else {
          toast.error('Failed to format flashcards, try inputting different text.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error generating flashcards');
    } finally {
      setLoading(false);
    }
  };

  const parseFlashcardsText = (text) => {
    const cards = [];
    const regex = /Q:\s*(.*?)\s*A:\s*(.*?)(?=(?:Q:|$))/gs;
    let match;
    while ((match = regex.exec(text)) !== null) {
      cards.push({
        question: match[1].trim(),
        answer: match[2].trim()
      });
    }
    // Fallback split if regex fails
    if (cards.length === 0) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      let tempCard = null;
      for (let line of lines) {
        if (line.toLowerCase().startsWith('q:')) {
          if (tempCard) cards.push(tempCard);
          tempCard = { question: line.substring(2).trim(), answer: '' };
        } else if (line.toLowerCase().startsWith('a:') && tempCard) {
          tempCard.answer = line.substring(2).trim();
        }
      }
      if (tempCard) cards.push(tempCard);
    }
    return cards.slice(0, 5);
  };

  // --- GENERATE MCQS ---
  const handleGenerateMCQs = async (e) => {
    e.preventDefault();
    if (!mcqNotes.trim()) {
      toast.error('Please input notes to generate questions');
      return;
    }
    try {
      setLoading(true);
      setMcqs([]);
      setCurrentMcqIdx(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setMcqScore(0);
      setQuizFinished(false);
      const res = await aiService.generateMCQs(mcqNotes);
      if (res.success) {
        const parsed = parseMCQsText(res.mcqs);
        if (parsed.length > 0) {
          setMcqs(parsed);
          toast.success('Quiz generated!');
        } else {
          toast.error('Failed to parse MCQs, please try alternative notes.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error generating MCQs');
    } finally {
      setLoading(false);
    }
  };

  const parseMCQsText = (text) => {
    const questions = [];
    const blocks = text.split(/(?=\d+\.|\n\d+\.)/);
    
    for (let block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 5) continue;
      
      let optionStartIdx = lines.findIndex(l => /^[A-Da-d]\)/.test(l));
      if (optionStartIdx === -1) continue;
      
      const questionText = lines.slice(0, optionStartIdx).join(' ').replace(/^\d+\.\s*/, '');
      const options = {};
      let correctAnswer = '';
      
      for (let i = optionStartIdx; i < lines.length; i++) {
        const line = lines[i];
        const matchOpt = line.match(/^([A-D])\)\s*(.*)/i);
        if (matchOpt) {
          options[matchOpt[1].toUpperCase()] = matchOpt[2];
        } else {
          const matchAns = line.match(/(?:Correct Answer|Answer|Correct):\s*([A-D])/i);
          if (matchAns) {
            correctAnswer = matchAns[1].toUpperCase();
          }
        }
      }
      
      if (questionText && Object.keys(options).length >= 4 && correctAnswer) {
        questions.push({
          question: questionText,
          options,
          correctAnswer
        });
      }
    }
    
    // Simple line-by-line fallback parser
    if (questions.length === 0) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      let currentQ = null;
      for (let line of lines) {
        if (line.match(/^\d+\./) || (!line.startsWith('A)') && !line.startsWith('B)') && !line.startsWith('C)') && !line.startsWith('D)') && !line.toLowerCase().startsWith('correct'))) {
          if (currentQ && Object.keys(currentQ.options).length >= 4 && currentQ.correctAnswer) {
            questions.push(currentQ);
          }
          currentQ = { question: line.replace(/^\d+\.\s*/, ''), options: {}, correctAnswer: '' };
        } else {
          const matchOpt = line.match(/^([A-D])\)\s*(.*)/i);
          if (matchOpt && currentQ) {
            currentQ.options[matchOpt[1].toUpperCase()] = matchOpt[2];
          } else {
            const matchAns = line.match(/(?:Correct Answer|Answer|Correct):\s*([A-D])/i);
            if (matchAns && currentQ) {
              currentQ.correctAnswer = matchAns[1].toUpperCase();
            }
          }
        }
      }
      if (currentQ && Object.keys(currentQ.options).length >= 4 && currentQ.correctAnswer) {
        questions.push(currentQ);
      }
    }
    return questions.slice(0, 5);
  };

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    const currentQuestion = mcqs[currentMcqIdx];
    if (opt === currentQuestion.correctAnswer) {
      setMcqScore(prev => prev + 1);
    }
  };

  const handleNextMcq = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentMcqIdx + 1 < mcqs.length) {
      setCurrentMcqIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white m-0">AI Study Buddy</h1>
        <p className="text-gray-400 text-sm mt-1">Utilize Gemini to parse notes, construct revision tests, or layout tasks timelines.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => { setActiveTab('study-plan'); setGeneratedPlan(''); }}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'study-plan'
              ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="h-4.5 w-4.5" />
          <span>Timeline Study Plan</span>
        </button>

        <button
          onClick={() => { setActiveTab('flashcards'); setFlashcards([]); }}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'flashcards'
              ? 'border-brand-purple text-brand-purple bg-brand-purple/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="h-4.5 w-4.5" />
          <span>Revision Flashcards</span>
        </button>

        <button
          onClick={() => { setActiveTab('mcqs'); setMcqs([]); }}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'mcqs'
              ? 'border-brand-blue text-brand-blue bg-brand-blue/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="h-4.5 w-4.5" />
          <span>Interactive Quiz (MCQs)</span>
        </button>
      </div>

      {/* Loading overlay if fetching */}
      {loading && (
        <div className="glass-panel p-16 text-center border-gray-805">
          <Sparkles className="h-10 w-10 text-brand-cyan animate-spin mx-auto mb-4" />
          <h3 className="text-white text-base font-bold">Consulting Gemini AI...</h3>
          <p className="text-gray-500 text-xs mt-1">Parsing academic material, generating response format.</p>
        </div>
      )}

      {/* --- TAB CONTENT: STUDY PLAN --- */}
      {!loading && activeTab === 'study-plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="glass-panel p-6 border-gray-800 bg-gradient-to-b from-white/[0.01] to-transparent h-fit">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-cyan" />
              Plan Parameters
            </h3>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              {/* Optional task pick */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Select Existing Task <span className="text-gray-600 font-normal">(Optional autofill)</span>
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => handleTaskChange(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">-- Choose Task --</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.subject || 'General'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Task / Assignment Title</label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Build React App, Solve OS Paper, etc."
                  className="input-field text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={planSubject}
                    onChange={(e) => setPlanSubject(e.target.value)}
                    placeholder="Operating Systems"
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Deadline Date</label>
                  <input
                    type="date"
                    value={planDeadline}
                    onChange={(e) => setPlanDeadline(e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3 mt-2">
                <span>Create Study Plan</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          {/* Generated Plan Output */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-white font-bold text-base">Plan Timeline</h3>
            {generatedPlan ? (
              <div className="glass-panel p-6 border-gray-800 space-y-6 relative">
                {/* Timeline line */}
                <div className="absolute left-9 top-12 bottom-12 w-0.5 bg-gray-850 pointer-events-none" />

                {parseStudyPlanDays(generatedPlan).map((day, idx) => (
                  <div key={idx} className="flex gap-4 relative group">
                    {/* Bullet circle */}
                    <div className="h-6 w-6 rounded-full bg-background-deep border-2 border-brand-cyan text-brand-cyan flex items-center justify-center shrink-0 z-10 font-black text-[9px]">
                      {idx + 1}
                    </div>

                    <div className="flex-1 bg-background-deep/30 border border-gray-850 hover:border-brand-cyan/20 p-4 rounded-xl transition-all">
                      <h4 className="text-white text-sm font-bold">{day.header}</h4>
                      <ul className="list-disc pl-5 mt-2 text-xs text-gray-400 space-y-1">
                        {day.bullets.map((bullet, bidx) => (
                          <li key={bidx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-16 text-center border-gray-850">
                <Calendar className="h-10 w-10 text-gray-700 mx-auto mb-4 animate-float" />
                <h4 className="text-white text-base font-bold">No plan generated yet</h4>
                <p className="text-gray-500 text-xs mt-1">Configure inputs on the left panel to fetch Gemini timelines.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: FLASHCARDS --- */}
      {!loading && activeTab === 'flashcards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notes Input */}
          <div className="glass-panel p-6 border-gray-800 bg-gradient-to-b from-white/[0.01] to-transparent h-fit">
            <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-purple" />
              Notes Material
            </h3>
            <p className="text-xs text-gray-500 mb-4">Paste paragraphs of textbook notes, definitions, or slide content below.</p>

            <form onSubmit={handleGenerateFlashcards} className="space-y-4">
              <textarea
                value={flashcardNotes}
                onChange={(e) => setFlashcardNotes(e.target.value)}
                placeholder="Paste revision text here... (Minimum 50 words recommended)"
                rows={8}
                className="input-field text-xs resize-none"
                required
              />

              <button type="submit" className="btn-accent w-full py-3 mt-2">
                <span>Create Flashcards</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          {/* Flashcard Player */}
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-center items-center">
            <div className="w-full flex justify-between items-center">
              <h3 className="text-white font-bold text-base">Flashcard Deck</h3>
              {flashcards.length > 0 && (
                <span className="text-xs font-semibold text-gray-500 bg-gray-900 border border-gray-850 px-2.5 py-1 rounded-lg">
                  Card {currentCardIdx + 1} of {flashcards.length}
                </span>
              )}
            </div>

            {flashcards.length > 0 ? (
              <div className="w-full max-w-md space-y-6">
                {/* 3D Flipping Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="h-64 w-full cursor-pointer relative group"
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className={`h-full w-full relative rounded-2xl border transition-all duration-500 transform ${
                      isFlipped
                        ? 'rotate-y-180 border-brand-purple bg-gradient-to-tr from-brand-purple/10 to-transparent'
                        : 'border-gray-800 bg-glass-bg'
                    } shadow-glass-shadow`}
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  >
                    {/* FRONT SIDE (Question) */}
                    <div
                      className="absolute inset-0 p-6 flex flex-col justify-between items-center text-centerBack"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <span className="text-[10px] bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Question
                      </span>
                      <p className="text-white font-semibold text-sm sm:text-base leading-relaxed max-w-xs mt-4">
                        {flashcards[currentCardIdx].question}
                      </p>
                      <span className="text-[10px] text-gray-500 mt-4 uppercase">
                        Click card to flip
                      </span>
                    </div>

                    {/* BACK SIDE (Answer) */}
                    <div
                      className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Answer
                      </span>
                      <p className="text-gray-200 text-sm leading-relaxed max-w-xs mt-4">
                        {flashcards[currentCardIdx].answer}
                      </p>
                      <span className="text-[10px] text-gray-500 mt-4 uppercase">
                        Click card to flip
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deck Controls */}
                <div className="flex justify-between items-center gap-4">
                  <button
                    disabled={currentCardIdx === 0}
                    onClick={() => { setCurrentCardIdx(prev => prev - 1); setIsFlipped(false); }}
                    className="btn-secondary py-2 flex-1 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    disabled={currentCardIdx === flashcards.length - 1}
                    onClick={() => { setCurrentCardIdx(prev => prev + 1); setIsFlipped(false); }}
                    className="btn-secondary py-2 flex-1 disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full glass-panel p-16 text-center border-gray-850">
                <BookOpen className="h-10 w-10 text-gray-700 mx-auto mb-4 animate-float" />
                <h4 className="text-white text-base font-bold">No flashcards deck created</h4>
                <p className="text-gray-500 text-xs mt-1">Paste textbook concepts on the left panel to load flashcards.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: MCQS --- */}
      {!loading && activeTab === 'mcqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notes Input */}
          <div className="glass-panel p-6 border-gray-800 bg-gradient-to-b from-white/[0.01] to-transparent h-fit">
            <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-blue" />
              Source Material
            </h3>
            <p className="text-xs text-gray-500 mb-4">Paste notes material to construct multiple-choice revision quiz questions.</p>

            <form onSubmit={handleGenerateMCQs} className="space-y-4">
              <textarea
                value={mcqNotes}
                onChange={(e) => setMcqNotes(e.target.value)}
                placeholder="Paste textbook notes here... (Minimum 50 words recommended)"
                rows={8}
                className="input-field text-xs resize-none"
                required
              />

              <button type="submit" className="btn-primary w-full py-3 mt-2 bg-gradient-to-r from-brand-blue to-brand-cyan">
                <span>Generate MCQs Quiz</span>
                <ArrowRight className="h-4.5 w-4.5 text-background" />
              </button>
            </form>
          </div>

          {/* MCQ Quiz Game Board */}
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-center items-center w-full">
            <h3 className="text-white font-bold text-base w-full text-left">Interactive Exam Game</h3>

            {mcqs.length > 0 ? (
              <div className="w-full max-w-xl space-y-6">
                {!quizFinished ? (
                  <div className="glass-panel p-6 border-gray-805 space-y-6 bg-gradient-to-b from-brand-blue/5 to-transparent">
                    {/* Header Tracker */}
                    <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-850 pb-3">
                      <span>Question {currentMcqIdx + 1} of {mcqs.length}</span>
                      <span>Score: {mcqScore} / {mcqs.length}</span>
                    </div>

                    {/* Question text */}
                    <p className="text-white text-sm sm:text-base font-semibold leading-relaxed">
                      {mcqs[currentMcqIdx].question}
                    </p>

                    {/* Options list */}
                    <div className="space-y-3">
                      {Object.entries(mcqs[currentMcqIdx].options).map(([key, value]) => {
                        const isCorrect = key === mcqs[currentMcqIdx].correctAnswer;
                        const isSelected = key === selectedOption;
                        
                        let optionStyle = 'border-gray-800 bg-background-deep/40 text-gray-300 hover:border-gray-700 hover:bg-background-deep/80';
                        if (isAnswered) {
                          if (isCorrect) {
                            optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                          } else if (isSelected) {
                            optionStyle = 'border-red-500 bg-red-500/10 text-red-400';
                          } else {
                            optionStyle = 'border-gray-850 bg-background-deep/10 text-gray-550 cursor-not-allowed';
                          }
                        }

                        return (
                          <button
                            key={key}
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(key)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${optionStyle}`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`h-6 w-6 rounded-lg flex items-center justify-center border font-bold text-xs ${
                                isAnswered && isCorrect
                                  ? 'bg-emerald-500 border-emerald-400 text-background'
                                  : isAnswered && isSelected
                                  ? 'bg-red-500 border-red-400 text-white'
                                  : 'bg-gray-900 border-gray-800'
                              }`}>
                                {key}
                              </span>
                              <span>{value}</span>
                            </span>
                            
                            {/* Option Icon markers */}
                            {isAnswered && isCorrect && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                            {isAnswered && isSelected && !isCorrect && <X className="h-4 w-4 text-red-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Controls Footer */}
                    {isAnswered && (
                      <div className="flex justify-end pt-2 border-t border-gray-850">
                        <button onClick={handleNextMcq} className="btn-primary py-2 px-6 text-xs">
                          <span>{currentMcqIdx + 1 === mcqs.length ? 'Finish Quiz' : 'Next Question'}</span>
                          <ChevronRight className="h-4 w-4 text-background" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Quiz End Score Card */
                  <div className="glass-panel p-8 text-center border-brand-cyan/20 bg-gradient-to-b from-brand-cyan/5 to-transparent space-y-6">
                    <div className="h-16 w-16 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center mx-auto animate-float">
                      <HelpCircle className="h-8 w-8" />
                    </div>

                    <div>
                      <h4 className="text-white text-lg font-bold">Quiz Session Finished!</h4>
                      <p className="text-gray-400 text-xs mt-1">Excellent revision session. Here is your scorecard:</p>
                    </div>

                    <div className="p-4 bg-background-deep border border-gray-850 rounded-2xl w-fit mx-auto px-10">
                      <p className="text-3xl font-black text-white">{mcqScore} / {mcqs.length}</p>
                      <span className="text-[10px] uppercase font-bold text-gray-500 mt-1 block">Final Score</span>
                    </div>

                    <button
                      onClick={() => {
                        setMcqs([]);
                        setQuizFinished(false);
                      }}
                      className="btn-secondary w-fit mx-auto text-xs py-2 px-6"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Restart Session</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full glass-panel p-16 text-center border-gray-850">
                <HelpCircle className="h-10 w-10 text-gray-700 mx-auto mb-4 animate-float" />
                <h4 className="text-white text-base font-bold">No MCQs Quiz generated</h4>
                <p className="text-gray-500 text-xs mt-1">Paste textbook content on the left panel to trigger revision questions.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
