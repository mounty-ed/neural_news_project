'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Eye, Share2, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Type definitions
interface NewsletterDate {
  date: string;
  articleCount: number;
}

const CATEGORIES = ["Technology", "Science", "Entertainment", "Politics", "Business"] as const;

type Category = typeof CATEGORIES[number];

interface NewsArticle {
  id: string;
  categories: Category[];
  createdAt: string;
  date: string;
  subtitle: string;
  groundbreaking: boolean;
  readTime: number;
  title: string;
  views: number;
}

const NewsWebsite: React.FC = () => {
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newsletterDates, setNewsletterDates] = useState<NewsletterDate[]>([]);
  const [currentNews, setCurrentNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch newsletter dates from API
  useEffect(() => {
    const fetchNewsletterDates = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/news');
        const data = await response.json();
        console.log(data)
        setNewsletterDates(data);
        setSelectedDate(data[0].date);
      } catch (error) {
        console.error('Error fetching newsletter dates:', error);
        // Fallback to empty array if fetch fails
        setNewsletterDates([]);
      }
    };

    fetchNewsletterDates();
  }, []);

  // Fetch news articles for selected date
  useEffect(() => {
    const fetchNewsForDate = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/news/${selectedDate}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("current news json: ", data);

        setCurrentNews(data);
      } catch (error) {
        console.error('Error fetching news for date:', error);
        setError('Failed to load news articles');
        setCurrentNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsForDate();
  }, [selectedDate]);

  const handleArticleClick = (articleId: string) => {
    router.push(`/${articleId}`)
  }

  // Function to generate dynamic label from date
  const getDynamicLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for accurate comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMs = now.getTime() - created.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    }
  };

  // Function to format view count
  const formatViews = (views: number): string => {
    if (views < 1000) {
      return views.toString();
    } else if (views < 10000) {
      return (views / 1000).toFixed(1) + 'K';
    } else if (views < 1000000) {
      return Math.floor(views / 1000) + 'K';
    } else {
      return (views / 1000000).toFixed(1) + 'M';
    }
  };

  // Function to format read time from seconds to "X mins Y seconds"
  const formatReadTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ${remainingSeconds} sec${remainingSeconds > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} sec${remainingSeconds > 1 ? 's' : ''}`;
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Technology': 'text-blue-400 bg-blue-400/10',
      'Entertainment': 'text-rose-400 bg-rose-400/10',
      'Science': 'text-purple-400 bg-purple-400/10',
      'Politics': 'text-green-400 bg-green-400/10',
      'Business': 'text-yellow-400 bg-yellow-400/10 '
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
                    {getDynamicLabel(item.date)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedDate === item.date 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {item.articleCount} {item.articleCount == 1 ? 'article' : 'articles'}
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
                    {newsletterDates.find(d => d.date === selectedDate) ? getDynamicLabel(selectedDate) : 'Newsletter'}
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
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Loading articles...</h3>
                <p className="text-slate-400">Please wait while we fetch the latest news.</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-red-300 mb-2">Error loading articles</h3>
                <p className="text-slate-400">{error}</p>
              </div>
            ) : currentNews.length > 0 ? (
              <div className="space-y-6">
                {currentNews.map((article, index) => (
                  <article
                    onClick={() => handleArticleClick(article.id)}
                    key={article.id}
                    className={`group cursor-pointer transition-all duration-500 ${
                      article.groundbreaking
                        ? 'bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-700/20'
                        : 'bg-gradient-to-br from-slate-800/40 to-slate-700/20'
                    } backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-wrap gap-2">
                        {article.categories.map((category, categoryIndex) => (
                          <div
                            key={categoryIndex}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                      {article.groundbreaking && (
                        <div className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-500/30">
                          Groundbreaking
                        </div>
                      )}
                    </div>

                    <h3 className={`font-bold mb-3 group-hover:text-blue-300 transition-colors ${
                      article.groundbreaking ? 'text-xl' : 'text-lg'
                    }`}>
                      {article.title}
                    </h3>

                    <p className="text-slate-300 mb-4 leading-relaxed">
                      {article.subtitle}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatReadTime(article.readTime)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatViews(article.views)} views</span>
                        </span>
                      </div>
                      <span>{formatTimeAgo(article.createdAt)}</span>
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