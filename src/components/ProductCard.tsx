/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Carousel, Dropdown } from "flowbite-react";
import { useState } from "react";
import { FaHeart, FaRegHeart, FaShare } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Product } from "../pages/Home";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index: number;
}
export const share = async (product_id: any, product_name: any) => {
  const productUrl = `${window.location.origin}/product/${product_id}`;
  const shareText = `Check out this awesome TJ Bazaar product: ${product_name}!\nHere at \n► ${productUrl} ◄\n`;
  await navigator.clipboard.writeText(shareText);

  if (navigator.share) {
    try {
      await navigator.share({
        title: `TJ Bazaar 🛒 ${product_name}`,
        text: shareText,
      });
      return;
    } catch (err) {
      console.error('Error sharing with Web Share API:', err);
    }
  }

}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const user = useSelector((state: any) => state.user);
  const navigate = useNavigate();

  const addToWishlist = async () => {
    if (!inWishlist && user) {
      try {
        const response = await axiosInstance.post("/wishlist/add", {
          product_id: product._id
        });
        if (response.data.status) {
          setInWishlist(true);
          toast.success(response.data.message);
        }
      } catch (error: any) {
        const error_msg = error.data?.message || "Server Error";
        toast.error(error_msg);
      }
    } else if (!user) {
      navigate("../user/login");
    } else if (inWishlist) {
      navigate("../user/dashboard");
    }
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-3xl border-t-2 border-b-2 border-yellow-400 `}
      key={product._id}
    >
      <Card className="relative w-full h-full m-0 bg-transparent shadow-lg rounded-3xl z-1 dark:bg-transparent hover:shadow-2xl">
        <div className="flex flex-col w-full h-full pt-2">
          {/* Dropdown at top-right corner */}
          <div className="absolute top-0 right-0 p-2 rounded-full shadow-2xl">
            <Dropdown label={
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
              </svg>
            } inline={true} arrowIcon={false}>
              <Dropdown.Item
                icon={(inWishlist) ? FaHeart : FaRegHeart}
                onClick={addToWishlist}
              >
                {(inWishlist) ? "Added" : "Wishlist"}
              </Dropdown.Item>
              <Dropdown.Item
                icon={FaShare}
                onClick={() => share(product._id, product.name)}>
                Share
              </Dropdown.Item>

            </Dropdown>
          </div>

          {/* Image/Carousel Section */}
          <div className="flex-grow h-[20em] backdrop-blur-3xl shadow-md rounded-xl">
            <Carousel slideInterval={3000} className="h-[20em] p-0 transition-all duration-700 ease-in-out">
              {product.media.map((image: string, index: number) => (
                <div key={index} className="relative w-full h-full">
                  <Link to={`../product/${product._id}`}>
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      loading="lazy"
                      onError={(e: any) => {
                        e.target.src = "../bazaar.gif"
                      }}
                      className="absolute inset-0 object-contain w-full h-full transition-all duration-700 ease-in-out"
                    />
                  </Link>
                </div>
              ))}
            </Carousel>
          </div>
          <Link to={`../product/${product._id}`}>
            {/* Text/Description Section */}
            <div className="flex-grow pt-5">
              <h5 className="mb-2 text-2xl font-semibold text-center">
                {product.name.slice(0, 50) + "..."}
              </h5>
              <div className="flex items-center justify-center mt-4">
                <p className="mb-2 text-2xl font-semibold text-center">
                  ₹{product.price}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-6 text-white">
                {product.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-xs bg-blue-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </motion.div>

  );
}

