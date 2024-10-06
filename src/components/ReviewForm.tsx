import React, { useState } from 'react';
import StarRating from './StarRating';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, fetchReviews }: any) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !review.trim()) {
      toast.error("Please provide a rating and a review.");
      return;
    }

    try {
      const response = await axiosInstance.post('/review/add', {
        product_id: productId,
        rating,
        review,
      });

      if (response.data.status) {
        toast.success(response.data.message);
        setRating(0);
        setReview('');
        fetchReviews(); // Refresh the review list after submission
      } else {
        toast.error(response.data.message || "Failed to submit review.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mt-10 min-w-screen border border-gray-300/20 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Leave a Review</h2>
      <StarRating rating={rating} setRating={setRating} />
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={4}
        className="mt-2 w-full p-2 rounded text-black"
        placeholder="Write your review here..."
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="mt-2 min-w-min p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Submit Review
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
