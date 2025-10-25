import React, { useState } from 'react';
import type { ImageItem } from '../types';

interface ImageCardProps {
  image: ImageItem;
  score?: number;
  onClick?: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, score, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`image-card ${imageLoaded ? 'image-card--loaded' : ''}`} onClick={onClick}>
      <div className="image-card__image-container">
        <img
          src={image.preview_url}
          alt={image.title}
          className="image-card__image"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {!imageLoaded && !imageError && (
          <div className="image-card__placeholder">
            <div className="image-card__skeleton"></div>
          </div>
        )}
        
        {imageError && (
          <div className="image-card__error">
            <span>📷</span>
            <p>Image unavailable</p>
          </div>
        )}
        
        <div className="image-card__overlay" />
      </div>
      
      {score !== undefined && (
        <div className="image-card__confidence">
          {(score * 100).toFixed(0)}%
        </div>
      )}
      
      <div className="image-card__content">
        <h3 className="image-card__title" title={image.title.length > 60 ? image.title : undefined}>
          {image.title.length > 60 ? `${image.title.substring(0, 60)}...` : image.title}
        </h3>
      </div>
    </div>
  );
};