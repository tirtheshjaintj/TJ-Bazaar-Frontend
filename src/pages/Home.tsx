import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import Navbar from '../components/user/Navbar';
import axiosInstance from '../config/axiosConfig';
import { AiOutlineRight } from 'react-icons/ai';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { Link } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
const ProductCard = lazy(() => import('../components/ProductCard')); // Lazy loading ProductCard

export interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  media: string[];
  category_id: Category; // Add category_id
  seller_id: string;      // Add seller_id
  tags: string[];         // Add tags
  createdAt: string;      // Add createdAt
  updatedAt: string;      // Add updatedAt
  _v: string;
}

export interface ProductsByCategory {
  [categoryName: string]: Product[];
}

function Home() {
  const [visibleProducts, setVisibleProducts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Error state
  const { products, setProducts } = useProductContext();
  // Fetch products from API
  const getProducts = async () => {
    try {
      if (Object.keys(products).length == 0) {
        setLoading(true);
        setError(null); // Reset error
        const response = await axiosInstance.get(`/product/get/products`);
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Show more products per category
  const handleShowMore = useCallback((categoryName: string) => {
    setVisibleProducts(prev => ({
      ...prev,
      [categoryName]: prev[categoryName] + 3,
    }));
  }, []);

  useEffect(() => {
    document.title = `TJ Bazaar🛒 The Online Shop`;
    window.scrollTo(0, 0);
    getProducts();
  }, []);

  useEffect(() => {
    const initialVisible = Object.keys(products).reduce((acc, category) => {
      acc[category] = 3; // Show 3 products by default
      return acc;
    }, {} as { [key: string]: number });
    setVisibleProducts(initialVisible);
  }, [products]);

  return (
    <>

      <Navbar />
      <div className="flex justify-end w-full">
        <h1 className="p-4 pt-24 font-bold text-2xl md:text-[36px]">Welcome To TJ Bazaar 🛒</h1>
      </div>
      <div className="p-4">
        {loading ? (
          // Show skeletons while loading
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array(3).fill(0).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          // Show error message if data fetching fails
          <div className="text-red-500">{error}</div>
        ) : <>{Object.entries(products).map(([categoryName, productList]) => {
          if (!Array.isArray(productList) || productList.length === 0) return null;

          const categoryId = productList[0].category_id?._id ?? '';

          return (
            <div key={categoryName} className="mb-8">
              <h2 className="mb-4 text-3xl font-bold">
                <Link to={`/category/${categoryId}`} className="hover:underline">
                  {categoryName}
                  &nbsp;<span className='font-normal'>{`(${productList.length})`}</span>
                </Link>
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Suspense fallback={<ProductCardSkeleton />}>
                  {productList.slice(0, visibleProducts[categoryName] || 0).map((product: Product, index: number) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))}
                </Suspense>
              </div>

              {(visibleProducts[categoryName] ?? 0) < productList.length && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleShowMore(categoryName)}
                    className="flex items-center px-4 py-2 text-blue-600 transition duration-300 bg-blue-100 rounded-lg"
                  >
                    <span className="mr-2">Show More</span>
                    <AiOutlineRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        </>}
      </div>
    </>
  );
}

export default Home;
