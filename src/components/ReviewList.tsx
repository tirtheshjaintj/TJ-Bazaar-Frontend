import React, { useState } from 'react';
import { FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa'; // Import sort icons from react-icons
import StarRating from './StarRating';

interface Review {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  username: string;
  updatedAt: string;
}

interface ReviewListProps {
  reviews: Review[];
}

const timeAgo = (dateString: string) => {
  const now = new Date();
  const then = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  else if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const [sortCriteria, setSortCriteria] = useState<string>('time'); // Default sort by time
  const [isAscending, setIsAscending] = useState<boolean>(true); // Default ascending order

  // Sorting logic based on selected criteria and order
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortCriteria === 'rating') {
      return isAscending ? a.rating - b.rating : b.rating - a.rating;
    } else {
      return isAscending
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="p-4 mt-4">

      <h2 className="mb-4 text-xl font-semibold">Reviews ({reviews.length})</h2>

      {/* Sorting Controls */}
      <div className="flex items-center mb-4 space-x-4">
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className="p-2 text-black border border-gray-400 rounded"
        >
          <option value="time">Time</option>
          <option value="rating">Rating</option>
        </select>

        <button
          onClick={() => setIsAscending(!isAscending)}
          className="p-2"
        >
          {isAscending ? <FaSortAmountUp /> : <FaSortAmountDown />}
        </button>
      </div>

      {sortedReviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        sortedReviews.map((review) => (
          <div key={review._id} className="p-4 mb-4 border-b border-gray-300 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">{review.username}</span>
              <span className="text-sm">{timeAgo(review.updatedAt)}</span>
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
