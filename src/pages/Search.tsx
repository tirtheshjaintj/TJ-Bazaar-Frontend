import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/user/Navbar';
import { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { AiFillHeart } from 'react-icons/ai';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { Product } from './Home';

function Search() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("keyword");
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'price' | 'date'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const search = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/product/search?keyword=${searchQuery}`, {
        keyword: searchQuery?.replace(/[^a-zA-Z0-9\s]/g, ' ')
      });
      if (response.data.status) {
        setProducts(response.data.data);
      } else {
        toast.error("No products found");
      }
    } catch (error) {
      console.log(error);
      toast.error("Search Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      navigate("../");
    }
  }, [searchQuery, navigate]);

  useEffect(() => {
    if (searchQuery) {
      search();
      document.title = `Searching for ${searchQuery}`;
      window.scrollTo(0, 0);
    }
  }, [searchQuery]);



  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'price') {
      comparison = a.price - b.price;
    } else if (sortField === 'date') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <>
      <Navbar />
      <div className="p-4 pt-24">
        {/* Filters and Sort UI */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as 'price' | 'date')}
              className="p-2 mr-2 text-black border border-gray-300 rounded-lg"
            >
              <option value="price">Price</option>
              <option value="date">Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center p-2 border border-gray-300 rounded-lg"
            >
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>

        {/* Show skeletons while loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array(3).fill(0).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <>
            {/* If there are no products, show a message */}
            {sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <AiFillHeart className="w-16 h-16 text-red-500 animate-bounce" />
                <h2 className="text-2xl font-bold">No products found matching "{searchQuery}"</h2>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {sortedProducts.map((product: Product, index: number) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Search;
