import React from 'react';
import { ImageItem } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface ImageModalProps {
  image: ImageItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-image-container">
          <img src={image.full_url} alt={image.title} className="modal-image" />
        </div>
        <div className="modal-info">
          <h2 className="modal-title">{image.title}</h2>
          {image.date_created && (
            <div className="modal-date">{formatDate(image.date_created)}</div>
          )}
          {image.description && (
            <p className="modal-description">{image.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};