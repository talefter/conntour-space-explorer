import React from 'react';
import { ImageItem } from '../../types';
import { formatDate } from '../../utils/dateUtils';


interface ImageCardProps {
  image: ImageItem;
  score?: number;
  onClick?: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, score, onClick }) => {
  return (
    <div className="image-card" onClick={onClick}>
      <div className="image-card__preview">
        <img
          src={image.preview_url}
          alt={image.title}
          className="image-card__image"
          loading="lazy"
        />
        {score !== undefined && (
          <div className="image-card__confidence">
            {(score * 100).toFixed(0)}%
          </div>
        )}
      </div>
      <div className="image-card__content">
        <h3 className="image-card__title">{image.title}</h3>

        {image.keywords.length > 0 && (
          <div className="image-card__keywords">
            {image.keywords.slice(0, 6).map((keyword, index) => (
              <span key={index} className="image-card__keyword">
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};