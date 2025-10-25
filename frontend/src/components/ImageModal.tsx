import React from 'react';
import type { ImageItem } from '../types';
import { formatDate } from '../utils/dateUtils';

interface ImageModalProps {
  image: ImageItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-layout">
          <div className="modal-image-section">
            <img src={image.preview_url} alt={image.title} className="modal-image" />
          </div>
          
          <div className="modal-info-section">
            <div className="modal-header">
              <h2 className="modal-title">{image.title}</h2>
              {image.date_created && (
                <div className="modal-date">{formatDate(image.date_created)}</div>
              )}
            </div>
            
            {image.description && (
              <div className="modal-description-container">
                <p className="modal-description">{image.description}</p>
              </div>
            )}
            

          </div>
        </div>
      </div>
    </div>
  );
};