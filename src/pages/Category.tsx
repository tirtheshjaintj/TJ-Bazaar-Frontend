import { useEffect, useState } from 'react';
import Navbar from '../components/user/Navbar';
import axiosInstance from '../config/axiosConfig';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { useParams } from 'react-router-dom';

interface Category {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  interface Product {
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
    __v: number;            // Add version key
  }

function Category() {
    const { id } = useParams<{ id: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<Category>();

    const getProductsByCategory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/product/category/${id}`);
            console.log(response);
            if (response.data.status) {
                setProducts(response.data.products);
                setCategory(response.data.category);
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

    useEffect(()=>{
        if(category && category.name){
        document.title = `TJ Bazaar - ${category && category.name} Products`;
        }
    },[category]);

    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

    return (
        <>
            <Navbar />
            <div className="flex justify-end w-full">
                <h1 className="p-4 pt-24 font-bold text-2xl md:text-[36px]">TJ Bazaar {category && category.name} Products</h1>
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
                        {products.map((product: Product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Category;
