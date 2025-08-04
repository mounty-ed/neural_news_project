'use client';

import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, Eye, Share2, Bookmark } from 'lucide-react';

const NewsWebsite = () => {
  const [selectedDate, setSelectedDate] = useState('2025-08-03');
  
  // Sample newsletter dates
  const newsletterDates = [
    { date: '2025-08-03', label: 'Today', count: 8 },
    { date: '2025-08-02', label: 'Yesterday', count: 12 },
    { date: '2025-08-01', label: 'Aug 1', count: 15 },
    { date: '2025-07-31', label: 'Jul 31', count: 9 },
    { date: '2025-07-30', label: 'Jul 30', count: 11 },
    { date: '2025-07-29', label: 'Jul 29', count: 14 },
    { date: '2025-07-28', label: 'Jul 28', count: 7 },
  ];

  // Sample news data
  const newsData = {
    '2025-08-03': [
      {
        id: 1,
        title: 'Revolutionary AI Breakthrough Changes Everything We Know About Machine Learning',
        excerpt: 'Scientists at leading tech companies have unveiled a groundbreaking approach that could reshape the entire landscape of artificial intelligence development.',
        category: 'Technology',
        readTime: '5 min read',
        views: '12.4K',
        timestamp: '2 hours ago',
        featured: true
      },
      {
        id: 2,
        title: 'Global Climate Summit Reaches Historic Agreement',
        excerpt: 'World leaders unite on unprecedented climate action plan with binding commitments that experts say could actually reverse global warming trends.',
        category: 'Environment',
        readTime: '8 min read',
        views: '9.8K',
        timestamp: '4 hours ago',
        featured: false
      },
      {
        id: 3,
        title: 'Quantum Computing Achieves Major Milestone',
        excerpt: 'New quantum processor demonstrates practical applications that could revolutionize cryptography, drug discovery, and financial modeling within the next decade.',
        category: 'Science',
        readTime: '6 min read',
        views: '7.2K',
        timestamp: '6 hours ago',
        featured: false
      },
      {
        id: 4,
        title: 'Space Tourism Takes Giant Leap Forward',
        excerpt: 'Private aerospace company successfully completes first commercial mission to lunar orbit, opening new frontier for civilian space exploration.',
        category: 'Space',
        readTime: '4 min read',
        views: '15.7K',
        timestamp: '8 hours ago',
        featured: false
      }
    ],
    '2025-08-02': [
      {
        id: 5,
        title: 'Renewable Energy Storage Breakthrough',
        excerpt: 'New battery technology promises to store renewable energy for months, solving the biggest challenge facing green energy adoption worldwide.',
        category: 'Energy',
        readTime: '7 min read',
        views: '11.3K',
        timestamp: '1 day ago',
        featured: true
      }
    ]
  };

  const currentNews = newsData[selectedDate] || [];

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'text-blue-400 bg-blue-400/10',
      'Environment': 'text-green-400 bg-green-400/10',
      'Science': 'text-purple-400 bg-purple-400/10',
      'Space': 'text-indigo-400 bg-indigo-400/10',
      'Energy': 'text-yellow-400 bg-yellow-400/10'
    };
    return colors[category] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="flex h-screen">
        {/* Left Sidebar - Newsletter Dates */}
        <div className="w-80 bg-gradient-to-b from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-r border-slate-700/50 overflow-y-auto">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NeuroNews
                </h1>
                <p className="text-sm text-slate-400">Your daily news digest</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">
              Newsletter Archive
            </div>
          </div>

          <div className="p-4 space-y-2">
            {newsletterDates.map((item) => (
              <button
                key={item.date}
                onClick={() => setSelectedDate(item.date)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                  selectedDate === item.date
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'hover:bg-slate-800/50 border border-transparent hover:border-slate-600/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold ${
                    selectedDate === item.date ? 'text-blue-300' : 'text-white'
                  }`}>
                    {item.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedDate === item.date 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {item.count} {item.count == 1 ? 'article' : 'articles'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{item.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {newsletterDates.find(d => d.date === selectedDate)?.label || 'Newsletter'}
                  </h2>
                  <p className="text-slate-400 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedDate}</span>
                    <span>•</span>
                    <span>{currentNews.length} {currentNews.length == 1 ? 'article' : 'articles'}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                    <Share2 className="w-5 h-5 text-slate-300" />
                  </button>
                  <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                    <Bookmark className="w-5 h-5 text-slate-300" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* News Articles */}
          <main className="p-6">
            {currentNews.length > 0 ? (
              <div className="space-y-6">
                {currentNews.map((article, index) => (
                  <article
                    key={article.id}
                    className={`group cursor-pointer transition-all duration-500 ${
                      article.featured
                        ? 'bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-700/20'
                        : 'bg-gradient-to-br from-slate-800/40 to-slate-700/20'
                    } backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </div>
                      {article.featured && (
                        <div className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-500/30">
                          Featured
                        </div>
                      )}
                    </div>

                    <h3 className={`font-bold mb-3 group-hover:text-blue-300 transition-colors ${
                      article.featured ? 'text-xl' : 'text-lg'
                    }`}>
                      {article.title}
                    </h3>

                    <p className="text-slate-300 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.views} views</span>
                        </span>
                      </div>
                      <span>{article.timestamp}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No articles available</h3>
                <p className="text-slate-400">Check back later for updates on this date.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default NewsWebsite;