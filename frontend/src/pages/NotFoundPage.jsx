import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-brand-cyan/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-cyan to-brand-purple" />
        
        <AlertCircle className="h-16 w-16 text-brand-purple mx-auto animate-float" />
        
        <div>
          <h2 className="text-3xl font-black text-white">404</h2>
          <p className="text-sm text-gray-400 mt-2">The page you are looking for does not exist or has been moved.</p>
        </div>

        <Link to="/" className="btn-primary w-fit mx-auto text-xs py-2 px-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4 text-background" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
