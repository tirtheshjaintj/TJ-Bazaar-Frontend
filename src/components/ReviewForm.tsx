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
    <form onSubmit={handleSubmit} className="p-4 mt-10 border rounded-lg shadow-md min-w-screen border-gray-300/20">
      <a id="reviews"></a>
      <h2 className="mb-2 text-lg font-semibold">Leave a Review</h2>
      <StarRating rating={rating} setRating={setRating} />
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={4}
        className="w-full p-2 mt-2 text-black rounded"
        placeholder="Write your review here..."
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="p-2 mt-2 text-white transition bg-blue-600 rounded min-w-min hover:bg-blue-700"
        >
          Submit Review
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
