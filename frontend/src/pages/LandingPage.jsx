import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { motion } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const { students, switchStudent, activeStudent } = useStudent();
  const navigate = useNavigate();

  const handleQuickLogin = (id) => {
    if (switchStudent(id)) {
      navigate('/dashboard');
    }
  };

  const features = [
    {
      title: 'WhatsApp Automation',
      description: 'Receive real-time reminders about task deadlines, exams, and attendance risks directly on your WhatsApp.',
      icon: MessageSquare,
      color: 'from-green-500/20 to-emerald-500/5',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Google Calendar Sync',
      description: 'Automatically export notice dates and assignment deadlines straight into your Google Calendar without lifting a finger.',
      icon: Calendar,
      color: 'from-blue-500/20 to-indigo-500/5',
      textColor: 'text-blue-400',
    },
    {
      title: 'Gemini AI Study Buddy',
      description: 'Generate customized day-wise study plans, interactive flipping study flashcards, and MCQ quizzes from your study notes.',
      icon: Sparkles,
      color: 'from-purple-500/20 to-pink-500/5',
      textColor: 'text-purple-400',
    },
    {
      title: 'Automation Engine',
      description: 'Powered by n8n workflows connecting Supabase events with Twilio and Google Calendar for sub-second notifications.',
      icon: Zap,
      color: 'from-amber-500/20 to-orange-500/5',
      textColor: 'text-amber-400',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-between py-12">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand-cyan/10 blur-[80px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-purple/10 blur-[90px] animate-pulse-slow pointer-events-none" />

      {/* Hero Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 text-center mt-12 sm:mt-20"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan text-xs font-semibold tracking-wider uppercase mb-6 animate-float"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Next-Gen Student Hub
        </motion.div>
        
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto"
        >
          Your Academic Journey. <br />
          <span className="gradient-text">Fully Automated.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          CampusFlow brings your schedule to life by linking WhatsApp alerts, Google Calendar syncs, and Gemini AI study planning into a unified, zero-friction interface.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16"
        >
          {activeStudent ? (
            <Link to="/dashboard" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <Link to="/onboard" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto font-semibold">
              Register Student Profile
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
          <a href="#features" className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
            Explore Features
          </a>
        </motion.div>
      </motion.div>

      {/* Quick Access Switcher for Judges */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 15 }}
        className="max-w-4xl mx-auto px-4 w-full mb-20"
      >
        <div className="glass-panel p-6 border-brand-blue/20 bg-gradient-to-b from-brand-blue/5 to-transparent relative">
          <div className="absolute top-3 right-3 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
          </div>

          <h3 className="text-white text-base font-bold mb-2 flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-blue" />
            Hackathon Demo Switcher
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Skip filling forms! Click on a previously registered student profile below to instantly load their personal calendar, tasks, and notifications.
          </p>

          {students.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {students.map((student) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={student.id}
                  onClick={() => handleQuickLogin(student.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-800 hover:border-brand-cyan/40 bg-background-deep/60 hover:bg-background-deep transition-all duration-200 group text-left"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-brand-cyan transition-colors">{student.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{student.branch} • Yr {student.year}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-brand-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-gray-800 rounded-xl">
              <p className="text-xs text-gray-500">No student profiles registered yet. Click "Register Student Profile" above to create the first profile!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Features Grid */}
      <div id="features" className="max-w-6xl mx-auto px-4 w-full mb-20 scroll-mt-6">
        <h2 className="text-white font-bold text-2xl text-center mb-10">Intelligent Integration Core</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                key={feat.title}
                className={`glass-panel p-6 bg-gradient-to-br ${feat.color} border-gray-800/80`}
              >
                <div className={`p-3 w-fit rounded-xl bg-background/60 mb-4 ${feat.textColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-glass-border pt-6 text-center text-xs text-gray-600">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-brand-cyan/60" />
          <span>CampusFlow Student Portal • Hackathon Special Edition</span>
        </div>
        <p>© 2026. Made with Tailwind, Framer Motion, and Google Gemini.</p>
      </footer>
    </div>
  );
}
