import { useEffect, useState } from 'react';
import Navbar from '../components/user/Navbar';
import axiosInstance from '../config/axiosConfig';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { useParams } from 'react-router-dom';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

interface Seller {
  name: string;
  _id: string;
}

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

function Seller() {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seller, setSeller] = useState<Seller>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'price' | 'date'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getProductsBySeller = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/product/seller/${id}`);
      if (response.data.status) {
        setProducts(response.data.products);
        setSeller(response.data.seller);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `TJ Bazaar - ${seller && seller.name} Products`;
    getProductsBySeller();
  }, [id]);

  useEffect(() => {
    if (seller && seller.name) {
      document.title = `TJ Bazaar - ${seller.name} Products`;
    }
  }, [seller]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="p-4 pt-24 font-bold text-2xl md:text-[36px]">TJ Bazaar {seller && seller.name} Products</h1>
      </div>

      {/* Filters and Sort UI */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center p-4">
        <div className="flex w-full gap-2 items-center">
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
          <div className="flex items-center">
            <select value={sortField} onChange={(e) => setSortField(e.target.value as 'price' | 'date')} className="border text-black border-gray-300 rounded-lg p-2 shadow-sm">
              <option value="price">Price</option>
              <option value="date">Date</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center border border-gray-300 rounded-lg p-2 ml-2 shadow-sm hover:bg-blue-500 hover:text-white transition-colors duration-300">
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedProducts.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Seller;
