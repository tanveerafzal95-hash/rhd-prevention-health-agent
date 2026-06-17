import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  AlertTriangle, 
  BookOpen, 
  HelpCircle, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Home, 
  Info, 
  Calendar, 
  CheckCircle2, 
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Printer,
  HeartPulse,
  Target,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Bookmark
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Define the shape of chat turning history.
interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function App() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'agent' | 'handbook' | 'quick-reference'>('agent');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [showProblemStatement, setShowProblemStatement] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  const handleSuggestClick = (suggestedText: string) => {
    setQuestion(suggestedText);
    setActiveTab('agent');
  };

  const clearChat = () => {
    setChatHistory([]);
    setErrorStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setErrorStatus(null);

    // Append user message immediately
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage: ChatMessage = {
      role: 'user',
      text: userQuestion,
      timestamp
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Map history to the compact backend payload
      const historyPayload = chatHistory.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned error rate ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || 'Unable to connect to the health assistant. Please make sure the server script is running.');
      
      // Append warning message in history for visual safety
      const systemErrorMessage: ChatMessage = {
        role: 'assistant',
        text: `⚠️ **Could not fetch a response securely.**\n\n*Error details: ${err.message || 'Network failure'}*\n\nIf you see this error repeatedly, please ensure that your \`GEMINI_API_KEY\` is correctly defined in the Secrets panel in the Google AI Studio settings, and that the backend development server has started.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, systemErrorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Predefined community recommendations & guidelines
  const sampleQuestions = [
    {
      title: "School Sores & ARF",
      text: "How do skin sores (school sores) link to acute rheumatic fever?",
      icon: <Home className="w-4 h-4 text-emerald-600" />
    },
    {
      title: "Sore Throat Care",
      text: "What should we do if a child in a remote community has a sore throat?",
      icon: <HelpCircle className="w-4 h-4 text-emerald-600" />
    },
    {
      title: "Injection Schedule (BPG)",
      text: "How often does a child need BPG preventative needles, and why is the schedule strict?",
      icon: <Calendar className="w-4 h-4 text-emerald-600" />
    },
    {
      title: "Housing & Environmental Factors",
      text: "How can improving house overcrowding and washing facilities prevent Rheumatic Fever?",
      icon: <Heart className="w-4 h-4 text-emerald-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      {/* Top Banner Accent reflecting health/care concept */}
      <div className="h-2 bg-emerald-700 w-full no-print"></div>

      {/* EMERGENCY STICKY WARNING BAR */}
      <div id="emergency-sticky-banner" className="bg-red-700 text-white py-3.5 px-4 shadow-sm relative no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 p-1.5 rounded-full block animate-pulse">
              <ShieldAlert className="w-5 h-5 text-white" />
            </span>
            <div className="leading-snug">
              <span className="font-bold uppercase tracking-wider text-red-100">Emergency & Diagnosis Disclaimer &bull;</span>{" "}
              This tool does <span className="font-semibold underline">not</span> diagnose illnesses or prescribe medication. 
              If a child has chest pain, breathing difficulty, severe fever, joint swelling, fainting, or is very unwell, **seek urgent medical care** or call <strong className="underline text-yellow-300">000</strong> in Australia immediately or visit your nearest community clinic.
            </div>
          </div>
          <a
            href="tel:000"
            className="shrink-0 bg-white text-red-900 hover:bg-red-50 transition-colors font-bold px-4 py-1.5 rounded text-xs select-none"
            id="call-000-button"
          >
            CALL 000 NOW
          </a>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 no-print relative" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100" id="brand-logo-container">
              <HeartPulse className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-display font-bold text-slate-900 tracking-tight" id="app-title">
                RHD Prevention Health Agent
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Culturally respectful, guideline-aligned education on Rheumatic Fever & Rheumatic Heart Disease
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-slate-100 p-1 rounded-lg">
            <button
              id="tab-btn-agent"
              onClick={() => setActiveTab('agent')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'agent' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ask the Assistant
            </button>
            <button
              id="tab-btn-handbook"
              onClick={() => setActiveTab('handbook')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'handbook' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Education Guidebook
            </button>
            <button
              id="tab-btn-quick"
              onClick={() => setActiveTab('quick-reference')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'quick-reference' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinical Quick Facts
            </button>
          </div>
        </div>
      </header>

      {/* CULTURAL SAFE RESPECT STATEMENT */}
      <section className="bg-emerald-50/50 border-b border-emerald-100 py-3 px-4 no-print text-center text-xs text-emerald-900/90 font-medium" id="respect-statement">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span>🌿</span>
          <span>We respectfully acknowledge the Traditional Custodians of remote communities across Australia and pay respects to Elders past, present and future.</span>
        </div>
      </section>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PRIMARY WORKSPACE & ASK INTERFACE (SPAN 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6" id="left-main-column">
              {/* ACADEMIC PROJECT OVERVIEW / PROBLEM STATEMENT CARD */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden" id="project-problem-statement-card">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50/20 border-b border-slate-100 flex items-center justify-between" id="problem-statement-header">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-emerald-200 bg-white text-emerald-800 rounded-lg shadow-sm">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-display font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Project Problem Statement
                    <span className="text-[9px] md:text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Academic Presentation Report
                    </span>
                  </h2>
                  <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">Primary alignment: Culturally respectful, guideline-aligned ARF/RHD community prevention education</p>
                </div>
              </div>
            </div>

            {/* Permanent Content panel holding separate structured boxes */}
            <div className="p-5 md:p-6 space-y-5" id="problem-statement-body">
              
              {/* Visual Grid: Goal & Target Population */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Project Goal */}
                <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-100/80 space-y-2">
                  <div className="flex items-center gap-2 text-teal-905 font-bold text-[10px] uppercase tracking-wider">
                    <Target className="w-4 h-4 text-teal-750 shrink-0" />
                    <span>Project Goal</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                    Improve access to culturally respectful, guideline-based acute rheumatic fever (ARF) and rheumatic heart disease (RHD) prevention education.
                  </p>
                </div>

                {/* 2. Target Population */}
                <div className="p-4 rounded-xl bg-amber-50/35 border border-amber-100/60 space-y-2">
                  <div className="flex items-center gap-2 text-amber-955 font-bold text-[10px] uppercase tracking-wider">
                    <Users className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Target Population</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                    Aboriginal and Torres Strait Islander children aged 5-14 years and their families in remote Australian communities.
                  </p>
                </div>
              </div>

              {/* 3. Evidence Gap - Styled clinically */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Evidence Gap</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ARF and RHD remain preventable diseases but continue to disproportionately affect Aboriginal and Torres Strait Islander children in remote Australia due to delayed treatment of sore throat and skin infections, overcrowding, and barriers to healthcare access.
                </p>
              </div>

              {/* 4. USER STORY section - fully visible and prominent */}
              <div className="border border-emerald-250 p-4 rounded-xl bg-emerald-50/20 space-y-2.5" id="user-story-section">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                  <Bookmark className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>USER STORY</span>
                </div>
                <p className="text-xs text-slate-900 font-medium leading-relaxed bg-white p-3.5 rounded-lg border border-emerald-100 italic shadow-sm">
                  "As a community health worker, Aboriginal health practitioner, parent, or caregiver in a remote Australian community, I want a simple AI assistant that explains ARF and RHD prevention using a trusted Australian guideline so that children at risk receive timely health education and appropriate advice".
                </p>
              </div>

              {/* 5. SYSTEM INSTRUCTION section - fully visible, prominent and guideline-compliant */}
              <div className="border border-slate-300 p-4 rounded-xl bg-slate-50 space-y-3" id="system-instruction-section">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-emerald-800 shrink-0 animate-pulse" />
                  <span>SYSTEM INSTRUCTION</span>
                </div>
                <div className="text-xs text-slate-800 leading-relaxed bg-white p-4 rounded-lg border border-slate-205 shadow-sm space-y-2">
                  <p className="font-semibold text-emerald-900">
                    You are a cautious public health education assistant for ARF and RHD prevention.
                  </p>
                  <p>
                    You provide culturally respectful, evidence-based education only.
                  </p>
                  <p>
                    Your Golden Source is the uploaded Australian ARF/RHD Guideline.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 mt-1">
                    <li>Do not diagnose disease.</li>
                    <li>Do not prescribe medication.</li>
                    <li>Do not replace doctors, nurses, or Aboriginal health practitioners.</li>
                    <li>If symptoms suggest an emergency, advise urgent medical care or call 000 in Australia.</li>
                    <li>If information is not available in the guideline, clearly state that the question is outside the scope of the guideline and cannot be answered safely.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {activeTab === 'agent' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden" id="agent-workspace-card">
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                  <h2 className="text-sm font-semibold text-slate-900">Preventative Education Consultation</h2>
                </div>
                <div className="flex items-center gap-2">
                  {chatHistory.length > 0 && (
                    <button 
                      onClick={clearChat}
                      className="text-xs text-slate-500 hover:text-red-700 flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-all font-medium"
                      id="reset-chat-button"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear History
                    </button>
                  )}
                  <button 
                    onClick={() => window.print()}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-all font-medium"
                    id="print-chat-button"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-grow p-4 md:p-6 space-y-6 overflow-y-auto max-h-[500px]" id="chat-messages-container">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <Sparkles className="w-7 h-7 text-emerald-700 animate-pulse" />
                    </div>
                    <div className="max-w-md">
                      <h3 className="text-base font-semibold text-slate-950">How can I help you support community health today?</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Ask about acute rheumatic fever symptoms, penicillin BPG injection schedules, skin sores, sore throats, or safe housing principles in remote communities. 
                      </p>
                      <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 p-2.5 rounded-lg mt-4 font-medium">
                        🛡️ Answers are strictly aligned with the solid guidelines of **RHD Australia**.
                      </p>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div 
                      key={index}
                      id={`chat-msg-${index}`}
                      className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0">
                          RHD
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-slate-50 text-slate-800 border border-slate-150 rounded-tl-none font-sans'
                      }`}>
                        {/* Render role label */}
                        <div className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${
                          msg.role === 'user' ? 'text-slate-300' : 'text-emerald-700'
                        }`}>
                          {msg.role === 'user' ? 'You (Health Worker / Parent)' : 'RHD Prevention Health Agent'}
                        </div>
                        
                        {/* Render body with structured markdown styling */}
                        <div className="markdown-body prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>

                        <div className={`text-[9px] mt-2.5 text-right font-mono ${
                          msg.role === 'user' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {msg.timestamp}
                        </div>
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                          U
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {loading && (
                  <div className="flex gap-3.5 justify-start" id="chat-loading-turn">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-250 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0 animate-bounce">
                      RHD
                    </div>
                    <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-slate-55 text-slate-800 border border-slate-150 rounded-tl-none flex items-center gap-3">
                      <div className="flex space-x-1.5 items-center">
                        <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                      <span className="text-xs font-medium text-slate-650 font-mono">Formulating guideline-safe education guidance...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <form onSubmit={handleSubmit} className="flex gap-2.5" id="chat-submit-form">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your question about rheumatic fever, skin infects, or BPG injections..."
                      disabled={loading}
                      maxLength={400}
                      className="w-full text-slate-900 bg-slate-50 border border-slate-300 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-60"
                      id="chat-input-textbox"
                    />
                    <div className="absolute right-3 top-2.5 text-slate-400 text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded font-mono">
                      {question.length}/400
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!question.trim() || loading}
                    className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-5 rounded-xl hover:shadow-sm active:transform active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shrink-0 select-none"
                    id="chat-submit-btn"
                  >
                    <span>Ask Agent</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                
                {/* Emergency quick warning on submit container */}
                <p className="text-[10px] text-slate-500 mt-2 text-center md:text-left flex items-center justify-center md:justify-start gap-1">
                  <span>⚠️ Strictly educational feedback based on Australian guidelines. Never replace emergency care.</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'handbook' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm" id="handbook-container">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <BookOpen className="w-6 h-6 text-emerald-700" />
                <div>
                  <h2 className="text-lg font-display font-semibold text-slate-900">Prevention & Care Education Guidebook</h2>
                  <p className="text-xs text-slate-500">Essential standard information based on RHD Australia standards</p>
                </div>
              </div>

              {/* Guidebook Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section 1 */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Stage 1: Streptococcus Prevention
                  </span>
                  <h4 className="font-semibold text-sm text-slate-900">Sore Throats & Skin Sores</h4>
                  <p className="text-xs leading-relaxed text-slate-600">
                    A bacteria called Group A Streptococcus (or Strep) causes sore throats and skin infections (commonly called school sores in remote areas). If untreated, the immune response can progress to Acute Rheumatic Fever.
                  </p>
                  <button 
                    onClick={() => handleSuggestClick("What is the difference between Strep A sore throats and regular sore throats in children?")}
                    className="text-xs select-none font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 mt-2 transition-colors"
                  >
                    Ask about Sore Throats <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Section 2 */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Stage 2: Preventing Heart Valve Harm
                  </span>
                  <h4 className="font-semibold text-sm text-slate-900">Secondary Prophylaxis (BPG)</h4>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Once a child has suffered acute rheumatic fever, they must receive regular Benzathine Penicillin G (BPG) injections. This prevents Streptococcus from returning and protects the delicate heart valves from scarring.
                  </p>
                  <button 
                    onClick={() => handleSuggestClick("Why does code RHD Australia mandate 4-weekly BPG injections, and what can we do if a child misses a date?")}
                    className="text-xs select-none font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 mt-2 transition-colors"
                  >
                    Ask about BPG Schedule <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Section 3 */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                    Healthy Homes
                  </span>
                  <h4 className="font-semibold text-sm text-slate-900">Environmental Health Factors</h4>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Strep bacteria spreads rapidly in conditions of house overcrowding, lack of hot running water, or broken showers and washing machines. Keeping facilities operational is a powerful non-medical shield.
                  </p>
                  <button 
                    onClick={() => handleSuggestClick("What household environmental modifications help reduce the spread of Strep skin cores in remote community houses?")}
                    className="text-xs select-none font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 mt-2 transition-colors"
                  >
                    Ask about Healthy Homes <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Section 4 */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full inline-block">
                    Community Action
                  </span>
                  <h4 className="font-semibold text-sm text-slate-900">Role of Health Practitioners</h4>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Aboriginal Health Practitioners (AHPs) and local community clinics provide trusted, daily safe care. Regular checking programs, school-based health skins checks, and clinical tracking systems are key assets.
                  </p>
                  <button 
                    onClick={() => handleSuggestClick("How can Aboriginal Health Practitioners lead programs in remote clinics to support families with kids on BPG injection registers?")}
                    className="text-xs select-none font-semibold text-emerald-700 hover:text-emerald-950 flex items-center gap-0.5 mt-2 transition-colors"
                  >
                    Ask about Clinic Support <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quick-reference' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6" id="quick-ref-content">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-750" />
                <div>
                  <h2 className="text-lg font-display font-semibold text-slate-900 font-bold">RHD Australia Guideline Essentials</h2>
                  <p className="text-xs text-slate-500">Quick clinical factsheets for remote health teams</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-650"></span>
                    Minor Strep Infection Management
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-slate-650 space-y-1.5 mt-2">
                    <li><strong>Sore throat:</strong> High-risk populations (Aboriginal kids 5-14 in remote areas) require throat swabs and immediate empirical antibiotic therapy (BPG or oral).</li>
                    <li><strong>Skin sores:</strong> Multiple sores or crusted school sores must be examined. Treat promptly under community protocols to clear bacteria before Rheumatic Fever triggers.</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    Preventative Needle Schedule (BPG Injections)
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-slate-650 space-y-1.5 mt-2">
                    <li><strong>Injection Agent:</strong> Benzathine Penicillin G (BPG) is intramuscular and protects for up to 4 weeks.</li>
                    <li><strong>Target Schedule:</strong> Administered every 28 days (4 weeks). 3-weekly administrations (every 21 days) are advised for patients with recurrent ARF or severe heart damage.</li>
                    <li><strong>Strict Tracking:</strong> Every day delayed past 28 days increases the vulnerable margin of exposure. Let the register system prompt families.</li>
                  </ul>
                </div>

                <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl">
                  <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Education & Social Determinants of Health
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed mt-2 font-medium">
                    "Safe bathroom structures, functional laundry systems, and decreasing crowded living rates are just as high value as medication registers." RHD prevention relies heavily on working infrastructure and household support. Use culturally protective family strategies to encourage clinical trust.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Predefined Sample Questions Area */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm no-print" id="predefined-samples-panel">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Suggested Topics based on RHD Australia Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="sample-questions-grid">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  id={`suggested-q-${idx}`}
                  onClick={() => handleSuggestClick(q.text)}
                  className="p-3 text-left border border-slate-100 hover:border-emerald-250 hover:bg-emerald-50/30 rounded-xl transition-all flex items-start gap-2.5 group"
                >
                  <span className="shrink-0 p-1 bg-slate-100 group-hover:bg-emerald-100 rounded-md transition-colors">
                    {q.icon}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {q.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {q.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: DISCLAIMERS, RESOURCES, SAFETY RULES (SPAN 4) */}
        <div className="lg:col-span-4 space-y-6" id="right-sidebar">
          
          {/* SAFETY RULES BANNER */}
          <div className="bg-white rounded-2xl border-2 border-emerald-700/30 p-5 shadow-sm" id="safety-compliance-box">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-3">
              <span className="bg-emerald-100 p-1 rounded-md text-emerald-800">
                🛡️
              </span>
              <h3>Safety & Compliance Rules</h3>
            </div>
            <p className="text-[11px] text-slate-650 leading-relaxed mb-4">
              This system strictly upholds the safety boundaries defined below to ensure respect for remote clinical community frameworks.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-755 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-xs shrink-0 select-none">🚨</span>
                <div>
                  <strong className="text-slate-950 block">Do Not Diagnose</strong>
                  The agent does not check individual sore cases or decide if a symptom means a child has ARF. It only provides general guideline education.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs shrink-0 select-none">💊</span>
                <div>
                  <strong className="text-slate-950 block">Do Not Prescribe Medicine</strong>
                  The system does not mandate drug dosages or administer courses. Specific courses must be prescribed strictly by certified practitioners.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs shrink-0 select-none">👩‍⚕️</span>
                <div>
                  <strong className="text-slate-950 block">Clinician Support Overrides AI</strong>
                  This advisor is purely educational and never overrides a doctor, nurse, or Aboriginal health practitioner.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs shrink-0 select-none">🛑</span>
                <div>
                  <strong className="text-slate-950 block">Severe Symptoms Referral</strong>
                  If dangerous or urgent circumstances are raised, the agent will direct the family to call 000 immediately.
                </div>
              </li>
            </ul>
          </div>

          {/* BRONZE SOURCE STAGED CARD */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden" id="golden-source-card">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full transform translate-x-8 -translate-y-8"></div>
            
            <div className="relative space-y-3.5">
              <div className="text-[10px] tracking-widest font-mono font-extrabold text-emerald-300 uppercase">
                Golden Source of Truth
              </div>
              
              <h3 className="text-base font-display font-bold leading-snug">
                RHD Australia ARF/RHD Guideline
              </h3>
              
              <p className="text-xs text-emerald-150 leading-relaxed">
                The answers given by the RHD Prevention Health Agent are backed directly by the most recent released edition of:
              </p>
              
              <div className="bg-white/10 p-3 rounded-lg border border-white/5 text-xs text-emerald-55">
                <strong>The Australian guideline for prevention, diagnosis and management of acute rheumatic fever and rheumatic heart disease</strong>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] font-medium text-emerald-250 mt-1 select-none">
                <span>RHD Australia Reference</span>
                <span className="flex items-center gap-0.5 hover:underline cursor-pointer" onClick={() => window.open('https://www.rhdaustralia.org.au/', '_blank')}>
                  Visit Site <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* PERMANENT MEDICAL DISCLAIMER BOX */}
          <div className="bg-slate-200/50 border border-slate-350 p-4 rounded-xl text-[10.5px] text-slate-600 leading-relaxed space-y-2.5" id="permanent-medical-disclaimer-card">
            <h4 className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5" id="disclaimer-header">
              <Info className="w-3.5 h-3.5 text-slate-650 shrink-0" />
              Permanent Medical Disclaimer
            </h4>
            <p>
              This applet is created for health educational and guideline awareness purposes only. It is not designed to replace clinical observation, laboratory throat swab diagnostics, or official register systems. 
            </p>
            <p>
              All clinical decisions and care plans must be evaluated by a certified medical provider (such as an Aboriginal Health Practitioner, Community Registered Nurse, or Clinic Doctor) acquainted with remote community health pathways.
            </p>
            <p className="font-medium text-slate-700">
              By using this education agent, you acknowledge that you will not defer or bypass certified physical health checkups based on educational content provided herein.
            </p>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-xs mt-12 border-t border-slate-800" id="app-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <p className="font-semibold text-slate-100 flex items-center gap-1 justify-center md:justify-start">
              <span>🩺</span> RHD Prevention Health Agent &bull; Remote Australian Health Support
            </p>
            <p>
              Primary Source: Australian guideline for prevention, diagnosis and management of acute rheumatic fever and rheumatic heart disease (RHD Australia).
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-slate-400 font-medium">
            <a href="https://www.rhdaustralia.org.au/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <span>RHD Australia</span> <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-500">Culturally respectful resources</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
