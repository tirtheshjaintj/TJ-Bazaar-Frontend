// src/pages/Search.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/user/Navbar';
import { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig'; // Import the configured Axios instance
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard'; // Import the ProductCard component
import { ProductCardSkeleton } from '../components/ProductCardSkeleton'; // Import the skeleton component

function Search() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("keyword"); // Get search keyword from URL params
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]); // Adjusted to use any[] for products
  const [loading, setLoading] = useState(true); // Add loading state

  const search = async () => {
    try {
      setLoading(true); // Start loading
      const response = await axiosInstance.post(`/product/search?keyword=${searchQuery}`, {
        keyword: searchQuery
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
      setLoading(false); // End loading in finally block
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
    }
  }, [searchQuery]);

  return (
    <>
      <Navbar />
      <div className="p-4 pt-24 md:pt-12">
        {searchQuery && <p className="text-xl font-semibold mb-4">Results for "{searchQuery}"</p>}

        {/* Show skeletons while loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <>
            {/* If there are no products, show a message */}
            {products.length === 0 ? (
              <p>No products found matching "{searchQuery}"</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
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
