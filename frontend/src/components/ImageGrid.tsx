import React, { useState } from 'react';
import type { ImageItem } from '../types';
import { ImageCard } from './ImageCard';
import { ImageModal } from './ImageModal';
import { Spinner } from './Spinner';


interface ImageGridProps {
  images: ImageItem[];
  scores?: { [imageId: string]: number };
  loading?: boolean;
  error?: string;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  scores, 
  loading, 
  error 
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (loading) {
    return <Spinner text="Loading images..." />;
  }

  if (images.length === 0) {
    return <div className="empty-state">No images found</div>;
  }

  return (
    <>
      <div className="image-grid">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            score={scores?.[image.id]}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={true}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};