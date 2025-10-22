'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [earlyAccessForm, setEarlyAccessForm] = useState({
    email: '',
    name: '',
    firm: '',
    message: ''
  });
  const [earlyAccessLoading, setEarlyAccessLoading] = useState(false);
  const [earlyAccessMessage, setEarlyAccessMessage] = useState('');
  
  const router = useRouter();

  const handleDemo = () => {
    router.push('/dashboard');
  };

  const handleEarlyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setEarlyAccessLoading(true);
    setEarlyAccessMessage('');

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(earlyAccessForm),
      });

      const data = await response.json();

      if (data.success) {
        setEarlyAccessMessage('✅ Thank you! We\'ll be in touch within 24 hours.');
        setEarlyAccessForm({ email: '', name: '', firm: '', message: '' });
      } else {
        setEarlyAccessMessage(`❌ ${data.error || 'Something went wrong. Please try again.'}`);
      }
    } catch (error) {
      setEarlyAccessMessage('❌ Failed to submit request. Please try again.');
    } finally {
      setEarlyAccessLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="px-8 md:px-20 py-24 min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                ⚖️
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live Demo Available</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
              Justice.
              <br />
              <span className="text-4xl md:text-5xl">Automated.</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              SmartProBono Lite helps small law firms and legal aid offices 
              <span className="font-semibold text-blue-600"> automate intake</span> and 
              <span className="font-semibold text-purple-600"> document drafting</span> with AI — 
              so attorneys can focus on <span className="font-semibold text-green-600">clients, not paperwork</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDemo}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-semibold text-lg"
            >
              <span className="flex items-center justify-center gap-2">
                🚀 Try the Demo
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
            <button
              onClick={() => document.getElementById('early-access-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
            >
              <span className="flex items-center justify-center gap-2">
                ✨ Request Early Access
                <span className="group-hover:rotate-12 transition-transform">📧</span>
              </span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Trusted by 500+ attorneys</p>
              <p className="text-xs text-gray-500">Join the legal tech revolution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Form */}
      <section id="early-access-form" className="px-8 md:px-20 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-10 border border-blue-100 shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6">
                🎯 Join the Waitlist
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Request Early Access</h3>
              <p className="text-xl text-gray-600">
                Join the waitlist and be among the first to experience SmartProBono Lite.
              </p>
            </div>

            <form onSubmit={handleEarlyAccess} className="max-w-2xl mx-auto space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-3">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={earlyAccessForm.name}
                    onChange={(e) => setEarlyAccessForm({...earlyAccessForm, name: e.target.value})}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="firm" className="block text-sm font-bold text-gray-700 mb-3">
                    Law Firm / Organization
                  </label>
                  <input
                    type="text"
                    id="firm"
                    value={earlyAccessForm.firm}
                    onChange={(e) => setEarlyAccessForm({...earlyAccessForm, firm: e.target.value})}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                    placeholder="Your firm name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={earlyAccessForm.email}
                  onChange={(e) => setEarlyAccessForm({...earlyAccessForm, email: e.target.value})}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                  placeholder="your.email@lawfirm.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-3">
                  Tell us about your practice (optional)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={earlyAccessForm.message}
                  onChange={(e) => setEarlyAccessForm({...earlyAccessForm, message: e.target.value})}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg resize-none"
                  placeholder="What types of cases do you handle? How many attorneys in your firm? Any specific needs?"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={earlyAccessLoading}
                  className="group px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg hover:shadow-2xl"
                >
                  {earlyAccessLoading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      ✨ Request Early Access
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  )}
                </button>
              </div>

              {earlyAccessMessage && (
                <div className={`text-center p-6 rounded-2xl ${
                  earlyAccessMessage.startsWith('✅') 
                    ? 'bg-green-50 text-green-700 border-2 border-green-200' 
                    : 'bg-red-50 text-red-700 border-2 border-red-200'
                }`}>
                  <div className="text-2xl mb-2">
                    {earlyAccessMessage.startsWith('✅') ? '🎉' : '⚠️'}
                  </div>
                  <p className="font-semibold">{earlyAccessMessage}</p>
                </div>
              )}
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-500 font-medium">
                We'll follow up within 24 hours with early access instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              ⚖️
            </div>
            <div className="text-2xl font-bold">SmartProBono</div>
          </div>
          <p className="text-xl text-blue-200 mb-8">
            Built in Rhode Island with purpose · Powered by Ermi AI
          </p>
          <div className="mt-8 text-blue-400">
            <p>&copy; 2025 SmartProBono. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}