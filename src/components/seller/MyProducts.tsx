import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import axios from 'axios';
import { FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaCalendarDay } from 'react-icons/fa';
import toast from 'react-hot-toast';
import UpdateProduct from './updateProduct';
import Cookie from "universal-cookie";
const url = import.meta.env.VITE_BACKEND_URL;

function MyProducts({selectedProduct,setSelectedProduct}:any) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priceAsc');
  const cookie=new Cookie();
  const token=cookie.get('seller_token');

  const getProducts = async () => {
    try {
      const response = await axios.get(`${url}/seller/getproducts`, { withCredentials: true, headers: {
        Authorization: `Bearer ${token}`,  // Add token to Authorization header
      }});
      if (response.data.status) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Not able to fetch products");
    }
  };

  const onDelete = async (productid: any) => {
    try {
      const response = await axios.delete(`${url}/product/delete/${productid}`, { withCredentials: true });
      if (response.data.status) {
        const newProducts = products.filter((p: any) => p._id !== productid);
        setProducts(newProducts);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Not able to delete product");
    }
  };

  const handleUpdate = (productId: string) => {
    // Find the product to update
    const productToUpdate:any = products.find((product: any) => product._id === productId);
    setSelectedProduct(productToUpdate);
    // Open update modal or form here
    //console.log("Open update form for:", productToUpdate);
  };

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter((product: any) => {
      return product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'latestAsc':
          return new Date(a.createdAt).getTime() - new Date(b.updatedAt).getTime();
        case 'latestDesc':
          return new Date(b.createdAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, sortBy, products]);

  return (
    <div className="py-5">
  
  { !selectedProduct && <><div className="flex w-full flex-col lg:flex-row gap-4 justify-between items-center mb-6">

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
      <div className="grid gap-6 justify-items-center pt-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mx-auto">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onUpdate={handleUpdate}
              onDelete={onDelete}
            />
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
      </>  
}
      {/* Render update form/modal */}
      {selectedProduct && (
      <UpdateProduct product={selectedProduct} />
      )}
    </div>
  );
}

export default MyProducts;
