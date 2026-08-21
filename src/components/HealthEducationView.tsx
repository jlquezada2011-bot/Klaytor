import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Clock, User, AlertCircle, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { api } from '../services/api.js';
import type { HealthArticle } from '../types/index.js';

export const HealthEducationView: React.FC = () => {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingArticle, setReadingArticle] = useState<HealthArticle | null>(null);

  const categories = [
    'All',
    'Nutrition',
    'Common health information',
    'Hygiene',
    'Preventive care',
    'Vaccination and immunizations',
    'Mental well-being and stress',
    'First aid awareness',
  ];

  const loadArticles = async () => {
    try {
      const res = await api.getArticles(selectedCategory, searchQuery);
      setArticles(res.articles);
      setDisclaimer(res.disclaimer);
    } catch (err: any) {
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadArticles();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Health Education & Preventive Library</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Clinically verified healthcare awareness articles, wellness guides, and preventive practices.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-900">Educational Notice: </strong>
          {disclaimer || 'Articles published here are intended for educational and informational purposes only and do not replace personalized professional medical advice.'}
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search topics (e.g. blood pressure, hydration, vaccine schedule)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg text-xs hover:bg-teal-700 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => setReadingArticle(art)}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-400 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded uppercase">
                {art.category}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">{art.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{art.summary}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[120px]">{art.author}</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {art.readTime}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Article Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setReadingArticle(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded uppercase">
              {readingArticle.category}
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3 leading-tight">
              {readingArticle.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 pb-4 border-b border-slate-100">
              <span>Author: {readingArticle.author}</span>
              <span>•</span>
              <span>{readingArticle.readTime}</span>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-900 flex items-start gap-2 border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Educational disclaimer: This article provides general health knowledge. Consult a qualified physician for individual health diagnosis.
              </span>
            </div>

            <div className="mt-6 text-sm text-slate-700 space-y-4 leading-relaxed font-sans">
              <p className="font-semibold text-slate-900 text-base">{readingArticle.summary}</p>
              <div className="whitespace-pre-line leading-loose text-slate-700">
                {readingArticle.content}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setReadingArticle(null)}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
