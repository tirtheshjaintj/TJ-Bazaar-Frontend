import { Card, Carousel, Dropdown } from "flowbite-react";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Product {
  _id: string;
  category_id: Category;
  seller_id: string;
  name: string;
  description: string;
  tags: string[];
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  media: string[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({product}: ProductCardProps) {
  const [inWishlist,setInWishlist]=useState<boolean>(false);
  const user=useSelector((state:any)=>state.user);
  const navigate=useNavigate();

  const addToWishlist=async()=>{
    if(!inWishlist && user){
       try {
          const response=await axiosInstance.post("/wishlist/add",{
            product_id:product._id
          });
          if(response.data.status){
          setInWishlist(true);
          toast.success(response.data.message);
          }
       } catch (error:any) {
        const error_msg=error.data?.message || "Server Error";
        toast.error(error_msg);
       }
    }else if(!user){
        navigate("../user/login");
    }else if(inWishlist){
      navigate("../user/dashboard");
    }
  }
  return (
    <Card className="w-full shadow-lg rounded-3xl z-1 m-0 bg-transparent dark:bg-transparent relative hover:shadow-2xl">
      <div className="flex flex-col w-full h-full pt-2">
        {/* Dropdown at top-right corner */}
        <div className="absolute top-0 right-0 shadow-2xl rounded-full p-2">
          <Dropdown label={
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
              <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
          </svg>
          } inline={true} arrowIcon={false}>
           <Dropdown.Item
              icon={(inWishlist)?FaHeart:FaRegHeart}
              onClick={addToWishlist}
            >
              {(inWishlist)?"Added":"Wishlist"}
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
                  onError={(e:any)=>{
                    e.target.src="../bazaar.gif"
                  }}
                  className="absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out"
                />
                </Link>
              </div>
            ))}
          </Carousel>
        </div>
        <Link to={`../product/${product._id}`}>
        {/* Text/Description Section */}
        <div className="pt-5 flex-grow">
          <h5 className="mb-2 text-2xl font-semibold  text-center">
            {product.name.slice(0, 50) + "..."}
          </h5>
          <div className="mt-4 flex justify-center items-center">
            <p className="mb-2 text-2xl font-semibold  text-center">
              ₹{product.price}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 justify-center text-white">
            {product.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-block bg-blue-600  text-xs px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        </Link>
      </div>
    </Card>
  );
}
