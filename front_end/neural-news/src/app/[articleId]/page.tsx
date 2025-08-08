'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Bookmark, Clock, Eye, Calendar, User, TrendingUp } from 'lucide-react';
import { SourcesModal } from "@/components/SourcesModal";

type ArticleSection = {
  heading: string;
  content: string;
};

type Article = {
  id: number;
  title: string;
  subtitle: string;
  createdAt: string;
  readTime: number;
  views: number;
  sources: string[];
  categories: string[];
  groundbreaking: boolean;
  content: ArticleSection[];
};

const initialArticle: Article = {
  id: 0,
  title: "",
  subtitle: "",
  createdAt: new Date().toISOString(),
  readTime: 0,
  views: 0,
  categories: [],
  groundbreaking: false,
  content: [],
  sources: [],
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();

  const [article, setArticle] = useState<Article>(initialArticle);
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/articles/${params.articleId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("article: ", data);

        // Expecting { article: {...} } from API; if API returns directly, adjust accordingly
        setArticle(data.article ?? data);
      } catch (error) {
        console.error('Error fetching news for date:', error);
        // restore to initial safe article shape
        setArticle(initialArticle);
      }
    };

    if (params?.articleId) {
      fetchArticle();
    }
  }, [params?.articleId]);

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

  const formatReadTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ${remainingSeconds} sec`;
    } else if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} sec`;
    }
  };

  const handleReturn = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group"
                onClick={handleReturn}
              >
                <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    NeuroNews
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.categories.map((category, index) => (
              <div
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}
              >
                {category}
              </div>
            ))}
            {article.groundbreaking && (
              <div className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-500/30">
                Groundbreaking
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            {article.title}
          </h1>

          <p className="text-xl text-slate-300 leading-relaxed mb-6">
            {article.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/20 backdrop-blur-sm rounded-2xl border border-slate-700/30">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>
                Generated on {new Date(article.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatReadTime(article.readTime)} read</span>
            </div>

            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{formatViews(article.views)} views</span>
            </div>

            {/* Sources button added inside this info box */}
            <div className="ml-auto">
              <button
                onClick={() => setShowSources(true)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800/80 text-sm text-slate-200 border border-slate-700/40"
                aria-label="Open sources"
              >
                Sources
                <span className="text-xs text-slate-400">({(article.sources || []).length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article Sections */}
        <div className="space-y-8">
          {article.content.map((section, index) => (
            <section 
              key={index}
              className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/30"
            >
              <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-slate-700/50">
                {section.heading}
              </h2>
              <div className="prose prose-invert prose-lg max-w-none">
                {section.content.split('\n\n').map((paragraph, pIndex) => (
                  <p 
                    key={pIndex} 
                    className="text-slate-300 leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Sources modal */}
      <SourcesModal
        isOpen={showSources}
        onClose={() => setShowSources(false)}
        sources={article.sources}
      />
    </div>
  );
}
