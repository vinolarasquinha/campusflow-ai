import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useStudent } from '../context/StudentContext';
import { motion } from 'framer-motion';
import {
  User,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

export default function OnboardingPage() {
  const { register } = useStudent();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm({
    defaultValues: {
      year: 1,
    }
  });

  const handleAddSubject = (e) => {
    e.preventDefault();
    const trimmed = newSubject.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      const updated = [...subjects, trimmed];
      setSubjects(updated);
      setValue('subjects', updated);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subToRemove) => {
    const updated = subjects.filter((s) => s !== subToRemove);
    setSubjects(updated);
    setValue('subjects', updated);
  };

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      branch: data.branch,
      year: Number(data.year),
      email: data.email,
      phone: data.phone,
      subjects: subjects,
      google_email: data.google_email || data.email,
    };
    
    const result = await register(payload);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-brand-purple/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-brand-cyan/10 blur-[80px] pointer-events-none" />

      {/* Back button */}
      <div className="w-full max-w-xl mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Landing</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl glass-panel p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple" />
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
            <GraduationCap className="h-6 w-6 text-background" />
          </div>
          <h2 className="text-2xl font-black text-white">Create Student Profile</h2>
          <p className="text-sm text-gray-400 mt-1">Configure your dashboard notifications, alerts, and calendar links.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Rohith Kumar"
                className="input-field pl-12"
                {...formRegister('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
          </div>

          {/* Branch & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Branch / Major</label>
              <input
                type="text"
                placeholder="Computer Science (CSE)"
                className="input-field"
                {...formRegister('branch', { required: 'Branch is required' })}
              />
              {errors.branch && <p className="text-red-500 text-xs mt-1.5">{errors.branch.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Year</label>
              <select
                className="input-field"
                {...formRegister('year', { required: true })}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>

          {/* Email (Primary) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Primary Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="email"
                placeholder="student@university.edu"
                className="input-field pl-12"
                {...formRegister('email', { 
                  required: 'Primary email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          {/* Google Email (For Google Calendar Sync) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Google Email <span className="text-gray-600 font-normal">(For Calendar Sync)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="email"
                placeholder="your.google.account@gmail.com (defaults to primary)"
                className="input-field pl-12"
                {...formRegister('google_email')}
              />
            </div>
          </div>

          {/* WhatsApp Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              WhatsApp Phone Number <span className="text-gray-600 font-normal">(Include country code, e.g. +91)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="tel"
                placeholder="+919876543210"
                className="input-field pl-12"
                {...formRegister('phone', { 
                  required: 'Phone number is required',
                  pattern: { value: /^\+?[1-9]\d{1,14}$/, message: 'Invalid phone format (include +countrycode)' }
                })}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone.message}</p>}
          </div>

          {/* Subjects (Dynamic tags) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Current Semester Subjects
            </label>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Data Structures, DBMS, etc."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="input-field pl-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject(e)}
                />
              </div>
              <button
                type="button"
                onClick={handleAddSubject}
                className="bg-gray-800 text-white hover:bg-gray-700 px-4 rounded-xl border border-gray-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Subject Badges */}
            <div className="flex flex-wrap gap-2">
              {subjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-gray-900 border border-gray-850 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-cyan"
                >
                  {sub}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {subjects.length === 0 && (
                <p className="text-xs text-gray-600 italic">No subjects added. Add some for syllabus-specific AI tasks.</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-background border-t-transparent rounded-full" />
                  Saving Profile...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-background" />
                  <span>Onboard Student Profile</span>
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
