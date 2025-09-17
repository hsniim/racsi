import { useState, useEffect } from 'react';
import { fetchFeedbackSummary } from '../utils/api';

function FeedbackCard({ id_gedung, id_lantai }) {
  const [feedbackData, setFeedbackData] = useState({
    summary: [],
    recent_comments: []
  });
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFeedbackSummary(id_gedung, id_lantai);
        console.log('Feedback data received:', data);
        setFeedbackData(data);
      } catch (error) {
        console.error('Gagal memuat data feedback:', error);
        setError(error.message);
        setFeedbackData({ summary: [], recent_comments: [] });
      } finally {
        setLoading(false);
      }
    };

    if (id_gedung && id_lantai) {
      loadFeedbackData();
      const interval = setInterval(loadFeedbackData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [id_gedung, id_lantai]);

  useEffect(() => {
    if (feedbackData.recent_comments.length > 1) {
      const interval = setInterval(() => {
        setCurrentCommentIndex(prev => 
          (prev + 1) % feedbackData.recent_comments.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [feedbackData.recent_comments.length]);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 bg-gray-700 rounded-md animate-pulse"></div>
        <div className="flex flex-col">
          <div className="h-6 bg-gray-700 rounded animate-pulse mb-2 w-32"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-24 mb-1"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 bg-red-700 rounded-md flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold text-white leading-none">Feedback</h3>
          <p className="text-md text-red-300 mt-1">Error loading data</p>
        </div>
      </div>
    );
  }

  if (!feedbackData.summary.length && !feedbackData.recent_comments.length) {
    return null;
  }

  const currentComment = feedbackData.recent_comments[currentCommentIndex];
  const avgRating = feedbackData.summary.length > 0 
    ? (feedbackData.summary.reduce((sum, item) => sum + parseFloat(item.rata_rating || 0), 0) / feedbackData.summary.length).toFixed(1)
    : 0;

  const totalFeedback = feedbackData.summary.reduce((sum, item) => sum + item.total_feedback, 0);

  const renderStars = (rating) => {
    const stars = [];
    const ratingNum = parseFloat(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingNum) {
        stars.push(<span key={i} className="text-yellow-400 text-sm">★</span>);
      } else if (i - 0.5 <= ratingNum) {
        stars.push(<span key={i} className="text-yellow-400 text-sm">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-500 text-sm">☆</span>);
      }
    }
    return stars;
  };

  // Generate QR code placeholder (sama seperti card lainnya)
  const generateQRPlaceholder = () => {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" fill="white"/>
        {/* QR code pattern simulation */}
        {Array.from({ length: 10 }, (_, i) => 
          Array.from({ length: 10 }, (_, j) => (
            <rect 
              key={`${i}-${j}`}
              x={i * 10} 
              y={j * 10} 
              width="8" 
              height="8" 
              fill={Math.random() > 0.5 ? "#000" : "transparent"}
            />
          ))
        )}
        {/* Corner markers */}
        <rect x="0" y="0" width="20" height="20" fill="#000"/>
        <rect x="2" y="2" width="16" height="16" fill="#fff"/>
        <rect x="6" y="6" width="8" height="8" fill="#000"/>
        
        <rect x="80" y="0" width="20" height="20" fill="#000"/>
        <rect x="82" y="2" width="16" height="16" fill="#fff"/>
        <rect x="86" y="6" width="8" height="8" fill="#000"/>
        
        <rect x="0" y="80" width="20" height="20" fill="#000"/>
        <rect x="2" y="82" width="16" height="16" fill="#fff"/>
        <rect x="6" y="86" width="8" height="8" fill="#000"/>
      </svg>
    );
  };

  return (
    <div className="flex items-center gap-3">
      {/* QR Code area - konsisten dengan card lain */}
      <div className="w-20 h-20">
        <div className="rounded-md w-full h-full bg-white flex items-center justify-center">
          {generateQRPlaceholder()}
        </div>
      </div>
      
      {/* Content - menyesuaikan dengan style card lain */}
      <div className="flex flex-col">
        <h3 className="text-2xl font-semibold text-white leading-none">
          Feedback<br />Pengguna
        </h3>
        
        {totalFeedback > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {renderStars(avgRating)}
            </div>
            <span className="text-md text-gray-300">
              {avgRating}/5.0
            </span>
          </div>
        )}

        {/* Informasi tambahan - compact */}
        {currentComment && (
          <div className="mt-1">
            <p className="text-md text-gray-300">
              "{currentComment.komentar.length > 40 
                ? currentComment.komentar.substring(0, 40) + "..." 
                : currentComment.komentar}"
            </p>
          </div>
        )}
        
        {!currentComment && totalFeedback > 0 && (
          <p className="text-md text-gray-300 mt-1">
            {totalFeedback} ulasan tersedia
          </p>
        )}

        {totalFeedback === 0 && (
          <p className="text-md text-gray-300 mt-1">
            Belum ada feedback
          </p>
        )}
      </div>
    </div>
  );
}

export default FeedbackCard;