import { useEffect, useState } from 'react';
import Navbar from '../components/user/Navbar';
import axiosInstance from '../config/axiosConfig';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { useParams } from 'react-router-dom';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { Category, Product } from './Home';

function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'price' | 'date'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getProductsByCategory = async () => {
    try {
      if (Object.keys(products).length == 0) {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/product/category/${id}`);
        if (response.data.status) {
          setProducts(response.data.products);
          setCategory(response.data.category);
        }
      }

    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductsByCategory();
  }, [id]);

  useEffect(() => {
    if (category && category.name) {
      document.title = `TJ Bazaar - ${category.name} Products`;
    }
  }, [category]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    product.price.toString().includes(searchTerm) // Convert price to string for comparison
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
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
      <div className="flex justify-end w-full">
        <h1 className="p-4 pt-24 font-bold text-2xl md:text-[36px]">TJ Bazaar {category && category.name} Products</h1>
      </div>

      {/* Filters and Sort UI */}
      <div className="flex flex-col items-center justify-between gap-4 p-4 lg:flex-row">
        <div className="flex items-center w-full gap-2">
          <input
            type="text"
            placeholder="Search any Product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm lg:w-1/3 dark:bg-gray-700 dark:text-white focus:ring focus:ring-blue-300"
          />
          <FaSearch className="text-gray-600 dark:text-gray-300" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as 'price' | 'date')}
              className="p-2 text-black border border-gray-300 rounded-lg shadow-sm"
            >
              <option value="price">Price</option>
              <option value="date">Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center p-2 ml-2 transition-colors duration-300 border border-gray-300 rounded-lg shadow-sm hover:bg-blue-500 hover:text-white"
            >
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array(3).fill(0).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sortedProducts.map((product: Product, index: number) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default CategoryPage;
