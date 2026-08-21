import React, { useState } from 'react';
import { Bot, Sparkles, Send, X, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '../services/api.js';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your Klaytor Health Guide. I can help explain medical terms, guide you through booking appointments, explain how to log vitals, or help formulate questions to discuss with your doctor.\n\n*Note: I am an educational guide, not a medical professional. I cannot diagnose conditions or prescribe medications.*',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    const newMsgs = [...messages, { role: 'user' as const, text: query }];
    setMessages(newMsgs);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.askAi(query);
      setMessages([...newMsgs, { role: 'assistant', text: res.reply }]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: 'I apologize, I encountered an issue generating a response. Please consult your physician for healthcare inquiries.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'What do systolic and diastolic blood pressure numbers mean?',
    'What questions should I ask my doctor about high blood pressure?',
    'How do I book a cardiology consultation in Klaytor?',
    'What is a normal resting heart rate for an adult?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[620px] shadow-2xl border border-slate-200 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Klaytor AI Health Assistant</h3>
              <p className="text-[11px] text-slate-500">Educational Guidance & Consultation Preparation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Disclaimer Warning */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>Safety Notice:</strong> AI Guide is for educational exploration only. Not for diagnosis, prescription, or emergencies (call 911 for emergencies).
          </span>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs bg-slate-50/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
              <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Consulting verified health guidance engine...</span>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-semibold text-slate-400 shrink-0">Suggestions:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 rounded-lg text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a general health question or how to use Klaytor..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
