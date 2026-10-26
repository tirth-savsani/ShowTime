import React from 'react';
import Modal from '../common/Modal.jsx';
import getYoutubeEmbedUrl from '../../utils/youtube.js';

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
