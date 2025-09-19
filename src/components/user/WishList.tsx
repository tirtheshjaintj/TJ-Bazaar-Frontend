import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaTrash, FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import Swal from "sweetalert2";
import { AiFillHeart } from "react-icons/ai";

interface Product {
  _id: string;
  category_id: string;
  seller_id: string;
  name: string;
  description: string;
  tags: string[];
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface WishListItem {
  _id: string;
  product_id: Product;
  user_id: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function WishList({ getWishlistCount }: any) {
  const [wishlist, setWishlist] = useState<WishListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  const getWishList = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/wishlist");
      if (Array.isArray(response.data.data)) {
        setWishlist(response.data.data);
        console.log(response.data.data);
      } else {
        toast.error("Unexpected data format received.");
      }
    } catch (error: any) {
      console.error("Error fetching wishlist:", error);
      toast.error(error?.response?.data?.message || "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/wishlist/remove/${itemId}`);
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.product_id._id !== itemId)
        );
        getWishlistCount();
        toast.success("Item removed from wishlist.");
      } catch (error: any) {
        console.error("Error removing item:", error);
        toast.error(error?.response?.data?.message || "Failed to remove item from wishlist.");
      }
    }
  };

  useEffect(() => {
    getWishList();
  }, []);

  // Filter and sort logic
  const filteredWishlist = wishlist.filter(item => {
    const matchesSearch = item.product_id.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = (statusFilter === 'all' ||
      (statusFilter === 'in-stock' && item.product_id.quantity > 0) ||
      (statusFilter === 'out-of-stock' && item.product_id.quantity === 0));
    return matchesSearch && matchesStatus;
  });

  const sortedWishlist = [...filteredWishlist].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'price') {
      comparison = a.product_id.price - b.product_id.price;
    } else if (sortField === 'date') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

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

  useEffect(() => {
    document.title = `TJ Bazaar🛒: User Wishlist`;
  }, []);

  if (loading) {
    return (<div className="flex flex-col space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border w-full rounded-lg shadow-lg p-4 animate-pulse bg-gray-200">
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
        </div>
      ))}
    </div>);
  }



  if (wishlist.length === 0) {
    return <>
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <AiFillHeart className="text-red-500 w-16 h-16 animate-bounce" />
        <h2 className="text-2xl font-bold">Your wishlist is empty</h2>
      </div>
    </>;
  }

  return (
    <div className="pt-6 min-h-screen">
      <div className='flex w-full flex-col lg:flex-row gap-4 justify-between items-center mb-6'>
        <div className="flex w-full gap-2 items-center justify-start">
          <input
            type="text"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 w-full border border-gray-300 rounded-md shadow-sm lg:w-1/3 dark:bg-gray-700 dark:text-white focus:ring focus:ring-blue-300"
          />
          <FaSearch className="text-gray-600 dark:text-gray-300" />
        </div>

        <div className="flex gap-4 items-center">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'in-stock' | 'out-of-stock')}
              className="border text-black border-gray-300 rounded-lg p-2 shadow-sm"
            >
              <option value="all">All</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          <div className="flex items-center">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as 'price' | 'date')}
              className="border text-black border-gray-300 rounded-lg p-2 shadow-sm"
            >
              <option value="price">Price</option>
              <option value="date">Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center border border-gray-300 rounded-lg p-2 ml-2 shadow-sm hover:bg-blue-500 hover:text-white transition-colors duration-300"
            >
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-6 justify-items-center grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mx-auto">
        {sortedWishlist.map((item) => (
          <div key={item._id} className="border border-gray-300/20 w-full rounded-lg shadow-lg p-4">
            <Link to={`../product/${item.product_id._id}`} className="block mb-4">
              <img
                src={item.image || '../bazaar.gif'}
                alt={item.product_id.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h3 className="font-bold text-lg">{item.product_id.name.substr(0, 30) + "..."}</h3>
              <p className="mt-2">Price: ₹{item.product_id.price}</p>
              {item.product_id.quantity === 0 && (
                <p className="mt-2 text-red-600 font-bold">Out of Stock</p>
              )}
              <p className="mt-2"><span className="font-semibold">Added:</span> {timeAgo(item.createdAt)}</p>
            </Link>
            <div className="flex justify-end">
              <button
                onClick={() => removeFromWishlist(item.product_id._id)}
                className="bg-red-600 text-center text-white p-2 rounded flex items-center hover:bg-red-500"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishList;
