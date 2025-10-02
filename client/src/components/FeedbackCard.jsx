import { useState, useEffect } from 'react';
import { QrCode, Star } from 'lucide-react';

// Updated API function untuk mengambil feedback summary
const fetchFeedbackSummary = async (id_gedung, id_lantai) => {
  try {
    const API_BASE_URL = "http://localhost:5000/api";
    const url = `${API_BASE_URL}/feedback/summary?id_gedung=${id_gedung}&id_lantai=${id_lantai}`;
    console.log(`Fetching feedback summary from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch feedback summary: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Feedback summary response:', data);
    
    return {
      summary: Array.isArray(data.summary) ? data.summary : [],
      recent_comments: Array.isArray(data.recent_comments) 
        ? data.recent_comments
        : []
    };
  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    return { 
      summary: [], 
      recent_comments: []
    };
  }
};

// Fungsi untuk mengambil QR code feedback gedung dari endpoint yang sudah ada
const fetchGedungFeedbackQR = async (id_gedung) => {
  try {
    const API_BASE_URL = "http://localhost:5000";
    const url = `${API_BASE_URL}/api/gedung/${id_gedung}/qr-feedback`;
    console.log(`Fetching gedung feedback QR code from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`No gedung feedback QR code found for gedung ${id_gedung} or error occurred:`, response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('Gedung feedback QR response:', data);
    
    // Convert path to full URL if it's a relative path
    let qrPath = data.qrcodepath_feedback;
    if (qrPath && !qrPath.startsWith('http') && !qrPath.startsWith('data:image')) {
      // Jika path dimulai dengan '/', gunakan langsung dengan base URL
      // Jika tidak, tambahkan '/' di depan
      qrPath = `${API_BASE_URL}${qrPath.startsWith('/') ? '' : '/'}${qrPath}`;
    }
    
    console.log('Final QR URL:', qrPath);
    return qrPath || null;
  } catch (error) {
    console.error('Error fetching gedung feedback QR code:', error);
    return null;
  }
};

// Function to check if string is a URL (for handling both generated QR and local paths)
const isUrl = (string) => {
  if (!string) return false;
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

function FeedbackCard({ id_gedung, id_lantai }) {
  const [feedbackData, setFeedbackData] = useState({
    summary: [],
    recent_comments: []
  });
  const [gedungQRCode, setGedungQRCode] = useState(null);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrImageError, setQrImageError] = useState(false);

  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        setError(null);
        
        console.log(`[${new Date().toISOString()}] FeedbackCard: Loading data for gedung=${id_gedung}, lantai=${id_lantai}`);
        
        // Ambil data feedback summary
        const feedbackSummary = await fetchFeedbackSummary(id_gedung, id_lantai);
        
        // Ambil QR code feedback gedung secara terpisah
        const gedungFeedbackQR = await fetchGedungFeedbackQR(id_gedung);
        
        console.log(`[${new Date().toISOString()}] FeedbackCard: Raw feedback data:`, feedbackSummary);
        console.log(`[${new Date().toISOString()}] FeedbackCard: Gedung Feedback QR Code:`, gedungFeedbackQR);

        // Pastikan selalu ada array
        const processedData = {
          summary: Array.isArray(feedbackSummary?.summary) ? feedbackSummary.summary : [],
          recent_comments: Array.isArray(feedbackSummary?.recent_comments) ? feedbackSummary.recent_comments : []
        };
        
        // Set state terpisah untuk QR code
        setGedungQRCode(gedungFeedbackQR);
        
        // DEBUG: Log per-room data
        console.log(`[${new Date().toISOString()}] FeedbackCard: Processed data:`, processedData);
        if (processedData.summary.length > 0) {
          console.log(`[${new Date().toISOString()}] FeedbackCard: Summary per room:`, processedData.summary.map(s => ({
            nama_ruang: s.nama_ruang,
            rata_rating: s.rata_rating,
            total_feedback: s.total_feedback
          })));
        }
        
        setFeedbackData(processedData);
        setCurrentCommentIndex(0);
        setQrImageError(false); // Reset QR error state
        
      } catch (error) {
        console.error(`[${new Date().toISOString()}] FeedbackCard: Error loading data:`, error);
        setError(error.message);
        setFeedbackData({ summary: [], recent_comments: [] });
        setGedungQRCode(null);
      } finally {
        setLoading(false);
      }
    };

    if (id_gedung && id_lantai) {
      setLoading(true);
      loadFeedbackData();
      // Reload setiap 30 detik untuk real-time updates
      const interval = setInterval(() => {
        console.log(`[${new Date().toISOString()}] FeedbackCard: Auto-refreshing data...`);
        loadFeedbackData();
      }, 30000);
      return () => {
        console.log('FeedbackCard: Cleaning up interval');
        clearInterval(interval);
      };
    } else {
      console.warn('FeedbackCard: Missing id_gedung or id_lantai', { id_gedung, id_lantai });
      setLoading(false);
    }
  }, [id_gedung, id_lantai]);

  // Rotasi komentar
  useEffect(() => {
    if (feedbackData.recent_comments?.length > 1) {
      const interval = setInterval(() => {
        setCurrentCommentIndex(prev => {
          const newIndex = (prev + 1) % feedbackData.recent_comments.length;
          return newIndex;
        });
      }, 8000); // Ganti komentar setiap 8 detik
      return () => clearInterval(interval);
    }
  }, [feedbackData.recent_comments?.length]);

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
    console.error('FeedbackCard: Displaying error:', error);
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 bg-red-700 rounded-md flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold text-white leading-none">Feedback</h3>
          <p className="text-md text-red-300 mt-1">Error loading</p>
          <p className="text-xs text-red-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const currentComment = feedbackData.recent_comments?.[currentCommentIndex];
  
  // Cari data rating berdasarkan nama ruangan dari komentar yang sedang ditampilkan
  let currentRoom = null;
  let avgRating = 0;
  let totalFeedback = 0;
  let roomName = 'Belum ada ruangan';

  if (currentComment?.nama_ruang) {
    currentRoom = feedbackData.summary?.find(room => 
      room.nama_ruang === currentComment.nama_ruang
    );
    
    if (currentRoom) {
      avgRating = typeof currentRoom.rata_rating === 'number' 
        ? currentRoom.rata_rating 
        : parseFloat(currentRoom.rata_rating) || 0;
      totalFeedback = parseInt(currentRoom.total_feedback) || 0;
      roomName = currentRoom.nama_ruang || 'Unknown Room';
      
      console.log(`FeedbackCard: Room "${roomName}" has ${totalFeedback} total feedback with avg rating ${avgRating}. Currently showing comment: "${currentComment.komentar}"`);
    } else {
      roomName = currentComment.nama_ruang;
      console.log(`FeedbackCard: No rating data found for room: ${roomName}, showing comment only`);
    }
  } else if (feedbackData.summary?.length > 0) {
    // Fallback: jika tidak ada komentar, ambil data pertama dari summary
    currentRoom = feedbackData.summary[0];
    avgRating = typeof currentRoom.rata_rating === 'number' 
      ? currentRoom.rata_rating 
      : parseFloat(currentRoom.rata_rating) || 0;
    totalFeedback = parseInt(currentRoom.total_feedback) || 0;
    roomName = currentRoom.nama_ruang || 'Unknown Room';
    console.log(`FeedbackCard: Using fallback data - Room: ${roomName}`);
  }

  // Star component
  const StarIcon = ({ filled = false, className = "" }) => (
    <Star 
      className={`w-6 h-6 ${filled ? 'text-yellow-400 fill-current' : 'text-gray-500'} ${className}`}
      style={{ minWidth: '24px', minHeight: '24px' }}
    />
  );

  // Render single star dengan rating
  const renderSingleStar = (rating) => {
    let ratingNum = 0;
    if (typeof rating === 'number') {
      ratingNum = rating;
    } else if (typeof rating === 'string') {
      ratingNum = parseFloat(rating) || 0;
    }
    
    ratingNum = Math.max(0, Math.min(5, ratingNum));
    
    return (
      <div className="flex items-center gap-1">
        <StarIcon filled={ratingNum > 0} />
        <span className="text-xl text-gray-300 font-medium">
          {ratingNum.toFixed(1)}
        </span>
      </div>
    );
  };

  // Handle QR image error
  const handleQRImageError = () => {
    console.log('QR Image error detected for:', gedungQRCode);
    setQrImageError(true);
  };

  // Generate "No QR" placeholder
  const generateNoQRPlaceholder = () => (
    <div className="w-full h-full bg-gray-600 rounded-md flex items-center justify-center">
      <span className="text-gray-400 text-sm">No QR</span>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      {/* QR Code - GUNAKAN QR GEDUNG UNTUK FEEDBACK dengan dukungan auto-generated */}
      <div className="w-24 h-24 flex-shrink-0 relative">
        <div className="rounded-md w-full h-full bg-white flex items-center justify-center overflow-hidden">
          {gedungQRCode && !qrImageError ? (
            <>
              <img 
                src={gedungQRCode} 
                alt="Feedback QR Code untuk Gedung" 
                className="w-full h-full object-cover rounded-md"
                onError={handleQRImageError}
                onLoad={() => {
                  console.log('QR Image loaded successfully:', gedungQRCode);
                  console.log('QR Type:', isUrl(gedungQRCode) ? 'URL' : 'Data URL or Path');
                }}
              />
              {/* QR Code indicator with type info */}
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 rounded-full p-1">
                <QrCode className="w-3 h-3 text-white" />
              </div>
            </>
          ) : (
            generateNoQRPlaceholder()
          )}
        </div>
      </div>
      
      <div className="flex flex-col min-w-0">
        {/* Judul */}
        <h3 className="text-3xl font-semibold text-white leading-tight mb-1">
          Feedback Pengguna
        </h3>
        
        {/* Rating Section */}
        {currentRoom && totalFeedback > 0 ? (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl text-gray-300 truncate max-w-[200px]">
              {roomName}
            </span>
            <span className="text-gray-400 flex-shrink-0">|</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {renderSingleStar(avgRating)}
            </div>
            {totalFeedback > 1 && (
              <span className="text-xl text-gray-400 flex-shrink-0">
                ({totalFeedback} ulasan)
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl text-gray-300 truncate max-w-[200px]">
              {roomName}
            </span>
            <span className="text-gray-400 flex-shrink-0">|</span>
            <span className="text-xl text-gray-300 flex-shrink-0">
              Belum ada rating
            </span>
          </div>
        )}

        {/* Komentar dengan animasi transisi */}
        <div className="relative overflow-hidden">
          {currentComment ? (
            <div className="transition-all duration-500 ease-in-out">
              <p className="text-xl text-gray-300 leading-tight">
                "{currentComment.komentar?.length > 35 
                  ? currentComment.komentar.substring(0, 35) + "..." 
                  : currentComment.komentar}"
              </p>
              {currentComment.nama_pengguna && (
                <p className="text-sm text-gray-400 mt-1">
                  - {currentComment.nama_pengguna}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xl text-gray-300 leading-tight">
              {totalFeedback > 0 ? `${totalFeedback} ulasan tersedia` : 'Belum ada komentar'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackCard;