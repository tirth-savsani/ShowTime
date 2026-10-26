import React from 'react';
import Modal from '../common/Modal.jsx';

/**
 * Extracts and converts YouTube URLs to embed format with autoplay.
 * Supports:
 * - youtube.com/watch?v=ID
 * - youtu.be/ID
 * - youtube.com/shorts/ID
 * - youtube.com/embed/ID
 * Returns null if not a recognized YouTube URL.
 */
export const getYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  try {
    const trimmed = url.trim();
    // In case no protocol was provided
    const validUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    const parsed = new URL(validUrl);

    // youtu.be/<id>
    if (parsed.hostname === 'youtu.be' || parsed.hostname.endsWith('.youtu.be')) {
      const videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    }

    // youtube.com
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        const videoId = parsed.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
      }
      if (parsed.pathname.startsWith('/embed/')) {
        const videoId = parsed.pathname.replace('/embed/', '').split('/')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        const videoId = parsed.pathname.replace('/shorts/', '').split('/')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle = 'Trailer' }) => {
  const embedUrl = getYoutubeEmbedUrl(trailerUrl);

  if (!embedUrl) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${movieTitle} - Official Trailer`}
      maxWidth="max-w-4xl"
      className="p-4 sm:p-6"
    >
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black shadow-lg">
        {isOpen && (
          <iframe
            src={embedUrl}
            title={`${movieTitle} Trailer`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>
    </Modal>
  );
};

export default TrailerModal;
