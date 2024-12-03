// MyProducts.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import ProductCard from './ProductCard';
import axiosInstanceSeller from '../../config/axiosConfigSeller';
import { FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaCalendarDay } from 'react-icons/fa';
import toast from 'react-hot-toast';
import UpdateProduct from './updateProduct';

function MyProducts({ selectedProduct, setSelectedProduct }: any) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priceAsc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstanceSeller.get(`/seller/getproducts`, {
        withCredentials: true,
      });
      if (response.data.status) {
        setProducts(response.data.data);
      } else {
        setError("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Not able to fetch products");
      toast.error("Not able to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  // const onDelete = useCallback(async (productId: any) => {
  //   try {
  //     const response = await axiosInstanceSeller.delete(`/product/delete/${productId}`, {
  //       withCredentials: true,
  //     });
  //     if (response.data.status) {
  //       setProducts((prevProducts) => prevProducts.filter((p: any) => p._id !== productId));
  //       toast.success(response.data.message);
  //     } else {
  //       toast.error(response.data.message || "Failed to delete product");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting product:", error);
  //     toast.error("Not able to delete product");
  //   }
  // }, []);

  const handleUpdate = useCallback((productId: string) => {
    const productToUpdate: any = products.find((product: any) => product._id === productId);
    setSelectedProduct(productToUpdate);
  }, [products, setSelectedProduct]);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product: any) =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'latestAsc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'latestDesc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  useEffect(() => {
    document.title = `TJ Bazaar🛒: Seller Products`;
  }, []);

  return (
    <div className="py-5">
      {error && <p className="text-red-500">{error}</p>}
      {!selectedProduct && (
        <>
          <div className="flex w-full flex-col lg:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex w-full gap-2 items-center justify-start">
              <input
                type="text"
                placeholder="Search by title or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-3 w-full border placeholder-slate-300 rounded-md lg:w-1/3 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Sorting Options */}
            <div className="flex gap-4 items-center">
              <button onClick={() => setSortBy(sortBy === 'priceAsc' ? 'priceDesc' : 'priceAsc')}>
                {sortBy === 'priceAsc' ? <FaSortAmountDown className="text-gray-600 dark:text-gray-300" /> : <FaSortAmountUp className="text-gray-600 dark:text-gray-300" />}
              </button>
              <button onClick={() => setSortBy(sortBy === 'latestAsc' ? 'latestDesc' : 'latestAsc')}>
                {sortBy === 'latestAsc' ? <FaCalendarAlt className="text-gray-600 dark:text-gray-300" /> : <FaCalendarDay className="text-gray-600 dark:text-gray-300" />}
              </button>
            </div>
          </div>

          {/* Skeleton Loading */}
          <div className="grid gap-6 justify-items-center pt-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mx-auto">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="border w-full rounded-lg shadow-lg p-4 animate-pulse">
                  <div className="h-32 bg-gray-300 rounded-md mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                </div>
              ))
            ) : filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product: any) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onUpdate={handleUpdate}
                />
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>
        </>
      )}

      {selectedProduct && <UpdateProduct product={selectedProduct} />}
    </div>
  );
}

export default MyProducts;
