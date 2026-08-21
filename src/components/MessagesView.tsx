import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Clock, ShieldCheck, CheckCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import type { Message, User as UserType, ProviderProfile, PatientProfile } from '../types/index.js';

export const MessagesView: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async () => {
    try {
      const data = await api.getMessages();
      setMessages(data);
    } catch (err: any) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // Determine recipient: if patient, message doctor; if provider, message patient
      const receiverId = user?.role === 'PATIENT' ? 'usr_doctor_1' : 'usr_patient_1';
      await api.sendMessage({
        receiverId,
        content: newMessage,
      });
      setNewMessage('');
      loadMessages();
    } catch (err: any) {
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 text-teal-800 text-xs font-bold rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted Clinical Messaging</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Secure Healthcare Messaging</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct, non-emergency communication with your healthcare provider or patient.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
              {user?.role === 'PATIENT' ? 'Dr' : 'Pt'}
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                {user?.role === 'PATIENT' ? 'Dr. Marcus Vance (Cardiology & Internal Medicine)' : 'Jane Doe (Patient)'}
              </span>
              <span className="text-[10px] text-teal-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online & Available for Clinical Inquiries
              </span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
              <span>No messages yet. Send a message to start a conversation.</span>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">
                    {isMe ? 'You' : m.senderName}
                  </span>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl leading-relaxed text-xs shadow-xs ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-teal-600" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your secure healthcare inquiry..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
