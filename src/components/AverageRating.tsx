// AverageRating.tsx
import React from 'react';
import StarRating from './StarRating';

interface AverageRatingProps {
  averageRating: number;
  totalReviews: number;
}

const AverageRating: React.FC<AverageRatingProps> = ({ averageRating, totalReviews }) => {
  return (
    <a href="#reviews" className="flex items-center justify-end my-4" >
      <StarRating rating={averageRating} />
      <span className="ml-2">({totalReviews})</span>
    </a>
  );
};

export default AverageRating;
