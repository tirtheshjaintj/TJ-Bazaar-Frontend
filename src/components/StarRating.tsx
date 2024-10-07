// StarRating.tsx
import React from 'react';
import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number; // Current rating (0-5)
  setRating?: (rating: number) => void; // Optional setter function for user rating
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);
  return (
    <div className="flex items-center text-2xl">
      {stars.map((star) => (
        <FaStar
          key={star}
          className={`cursor-pointer ${star <= rating ? 'text-yellow-300' : 'text-gray-300'}`}
          onClick={() => setRating && setRating(star)} // Set rating on click
        />
      ))}
      <span className="ml-2">{rating.toFixed(1)}</span>
    </div>
  );
};

export default StarRating;
