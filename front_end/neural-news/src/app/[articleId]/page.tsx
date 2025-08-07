import { ArrowLeft, Share2, Bookmark, Clock, Eye, Calendar, User, TrendingUp } from 'lucide-react';

export default function ArticlePage() {
  const article = {
    id: 1,
    title: "Revolutionary AI System Achieves Breakthrough in Neural Interface Technology",
    subtitle: "Scientists at MIT demonstrate the first successful bidirectional brain-computer interface capable of both reading neural signals and providing sensory feedback with unprecedented precision.",
    author: "Dr. Sarah Chen",
    publishedAt: "2025-08-06T10:30:00Z",
    readTime: 8,
    views: 15420,
    categories: ["AI Research", "Neurotechnology", "Medical Innovation"],
    groundbreaking: true,
    content: [
      {
        type: "section",
        heading: "The Breakthrough",
        content: "In a landmark achievement that could revolutionize how we treat neurological conditions, researchers at MIT's Computer Science and Artificial Intelligence Laboratory (CSAIL) have developed the most advanced brain-computer interface to date. This system represents a quantum leap in neural technology, combining cutting-edge AI algorithms with novel electrode designs to create seamless communication between the human brain and external devices.\n\nThe research, published in Nature Neuroscience, demonstrates for the first time a bidirectional neural interface that can both interpret complex thought patterns and provide tactile sensory feedback directly to the brain. This breakthrough opens unprecedented possibilities for treating paralysis, depression, and other neurological conditions."
      },
      {
        type: "section",
        heading: "Technical Innovation",
        content: "The system utilizes a proprietary neural network architecture called 'NeuroLink AI' that can decode neural signals with 99.2% accuracy - a significant improvement over previous systems that typically achieved 60-70% accuracy. The key innovation lies in the use of flexible, biocompatible electrodes that can adapt to the brain's natural movements and changes over time.\n\n'We've essentially created a universal translator between the language of neurons and digital systems,' explains lead researcher Dr. Sarah Chen. 'The AI can learn individual neural patterns and adapt in real-time, making the interface feel completely natural to users.'\n\nThe system processes over 1 million neural signals per second, using advanced machine learning algorithms to filter out noise and identify genuine intentional signals. This processing power allows for incredibly precise control of external devices, from robotic limbs to computer interfaces."
      },
      {
        type: "section",
        heading: "Clinical Applications",
        content: "The immediate applications for this technology are transformative for patients with spinal cord injuries, ALS, and other conditions that affect motor function. In clinical trials, paralyzed patients were able to control robotic arms with the same dexterity as their natural limbs, complete with force feedback and tactile sensation.\n\nBeyond motor applications, the research team has demonstrated the system's potential in treating depression and anxiety disorders. By monitoring neural activity patterns associated with mood disorders, the system can provide targeted electrical stimulation to specific brain regions, effectively acting as a 'neural pacemaker' for mental health.\n\nDr. Michael Rodriguez, a neurologist at Massachusetts General Hospital who was not involved in the study, calls the results 'nothing short of miraculous.' He notes that 'patients who haven't felt touch in decades are now able to feel texture, temperature, and pressure through the neural interface.'"
      },
      {
        type: "section",
        heading: "Ethical Considerations",
        content: "While the technological achievement is remarkable, it raises important questions about privacy, autonomy, and the future of human enhancement. The system's ability to read and interpret thoughts with high accuracy brings up concerns about mental privacy and the potential for misuse.\n\nThe research team has worked closely with bioethicists to develop strict protocols for data handling and patient consent. All neural data is encrypted and processed locally on the device, ensuring that thoughts remain private. Additionally, the system includes built-in safeguards that allow patients to maintain full control over when the interface is active.\n\n'We're not just building technology; we're building the foundation for how humans and AI will coexist in the future,' states Dr. Chen. 'Every decision we make now will impact generations of users, so we must proceed thoughtfully and responsibly.'"
      },
      {
        type: "section",
        heading: "Future Implications",
        content: "Looking ahead, the research team envisions a world where neural interfaces become as common as smartphones. The technology could enable direct brain-to-brain communication, enhanced cognitive abilities, and seamless integration between human consciousness and digital systems.\n\nHowever, widespread adoption is still years away. The current system requires surgical implantation and costs approximately $250,000 per patient. The team is working on non-invasive alternatives using advanced sensor technology that could make the benefits accessible to a broader population.\n\nRegulatory approval from the FDA is expected to take 3-5 years, with the first commercial applications likely focusing on medical treatments for paralysis and neurological disorders. The potential market for neural interface technology is projected to reach $27 billion by 2030, according to industry analysts.\n\nAs we stand on the brink of this neural revolution, one thing is certain: the boundary between human and artificial intelligence is becoming increasingly blurred, opening up possibilities we're only beginning to imagine."
      }
    ]
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatViews = (views) => {
    if (views > 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views > 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      "AI Research": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
      "Neurotechnology": "bg-purple-500/20 text-purple-300 border border-purple-500/30",
      "Medical Innovation": "bg-green-500/20 text-green-300 border border-green-500/30",
    };
    return colors[category] || "bg-slate-500/20 text-slate-300 border border-slate-500/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group">
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

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 p-6 bg-gradient-to-r from-slate-800/40 to-slate-700/20 backdrop-blur-sm rounded-2xl border border-slate-700/30">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>By {article.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{article.readTime} min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{formatViews(article.views)} views</span>
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

        {/* Article Footer */}
        <div className="mt-12 p-6 bg-gradient-to-r from-slate-800/60 via-slate-800/40 to-slate-700/20 backdrop-blur-sm rounded-2xl border border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <p>Published on {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p className="mt-1">Article ID: #{article.id.toString().padStart(4, '0')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/30 transition-colors">
                Share Article
              </button>
              <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg border border-slate-600/30 transition-colors">
                Save for Later
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}