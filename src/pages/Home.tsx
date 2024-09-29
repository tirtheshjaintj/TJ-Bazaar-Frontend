// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import Navbar from '../components/user/Navbar';
import axiosInstance from '../config/axiosConfig'; // Import the configured Axios instance
import ProductCard from '../components/ProductCard'; // Adjust the path as needed
import { AiOutlineRight } from 'react-icons/ai'; // Import an arrow icon from react-icons
import { ProductCardSkeleton } from '../components/ProductCardSkeleton'; // Import the skeleton component

// Define types for product and product list
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  // Add other fields as necessary
}

interface ProductsByCategory {
  [categoryName: string]: Product[];
}

function Home() {
  const [products, setProducts] = useState<ProductsByCategory>({});
  const [visibleProducts, setVisibleProducts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true); // Add loading state

  const getProducts = async () => {
    try {
      setLoading(true); // Start loading
      const response = await axiosInstance.get(`/product/get/products`); // Use the configured instance
      if (response.data.status) {
        setProducts(response.data.data);
        // Initialize visible products for each category
        const initialVisible = Object.keys(response.data.data).reduce((acc, category) => {
          acc[category] = 3; // Show 3 products by default
          return acc;
        }, {} as { [key: string]: number });
        setVisibleProducts(initialVisible);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleShowMore = (categoryName: string) => {
    setVisibleProducts(prev => ({
      ...prev,
      [categoryName]: prev[categoryName] + 3, // Show 3 more products
    }));
  };

  useEffect(() => {
    document.title = `TJ Bazaar🛒 The Online Shop`;
    getProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex justify-end w-full">
        <h1 className="p-4 pt-24 md:pt-12 font-bold text-2xl md:text-[36px]">Welcome To TJ Bazaar 🛒</h1>
      </div>
      <div className="p-4">
        {/* Show skeletons while loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          Object.entries(products).map(([categoryName, productList]) => (
            <div key={categoryName} className="mb-8">
              <h2 className="text-3xl font-bold mb-4">
                {categoryName} &nbsp;<span className='font-normal'>{`(${products[categoryName]?.length || 0})`}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {productList.slice(0, visibleProducts[categoryName] || 0).map((product: Product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {visibleProducts[categoryName] < productList.length && (
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={() => handleShowMore(categoryName)}
                    className="flex items-center text-blue-600 hover:bg-blue-100 rounded-lg px-4 py-2 transition duration-300"
                  >
                    <span className="mr-2">Show More</span>
                    <AiOutlineRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Home;
