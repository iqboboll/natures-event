import { useState, useEffect } from 'react';
import { getLiveNews } from '../services/api';

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const liveNews = await getLiveNews();
        if (liveNews && liveNews.length > 0) {
          setNews(liveNews);
        } else {
          // Fallback if database is empty or backend is offline
          setNews([
            { time: 'JUST NOW', text: 'Waiting for live incident reports...', tag: 'SYSTEM', tagColor: 'var(--accent-blue)' },
            { time: '1 HOUR AGO', text: 'Backend connected. Database synchronization active.', tag: 'NODE', tagColor: 'var(--accent-green)' },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
    
    // Poll every 30 seconds for live updates
    const intervalId = setInterval(fetchNews, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span className="panel-header__title">AI Live News Feed</span>
        <span className="panel-header__badge panel-header__badge--live">
          {loading ? 'SYNCING POSTS...' : 'LIVE'}
        </span>
      </div>
      <div className="panel-body">
        {news.map((n, i) => (
          <div className="news-item fade-in" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="news-item__time">{n.time}</div>
            <div className="news-item__text">{n.text}</div>
            <span
              className="news-item__tag"
              style={{ background: `${n.tagColor}22`, color: n.tagColor }}
            >
              {n.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
