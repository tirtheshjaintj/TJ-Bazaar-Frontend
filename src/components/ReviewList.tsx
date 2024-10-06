// ReviewList.tsx
import React from 'react';
import StarRating from './StarRating';

interface Review {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  username: string;
}

interface ReviewListProps {
  reviews: Review[];
}

const timeAgo = (dateString: string) => {
  const now = new Date();
  const then = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="p-4 border-b border-gray-300 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">{review.username}</span>
              <span className="text-sm">{timeAgo(review.createdAt)}</span>
            </div>
            <div className="flex items-center mt-2">
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-2">{review.review}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList;
