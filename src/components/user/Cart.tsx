/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { FaTrash, FaShoppingCart, FaBoxOpen, FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import Swal from 'sweetalert2';
import { AiFillHeart } from "react-icons/ai";
import { Product } from "../../pages/Home";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_API_KEY;



interface CartItem {
  _id: string;
  product_id: Product;
  user_id: string;
  image: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function Cart({ getCartCount }: any) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const user = useSelector((state: any) => state.user);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  const navigate = useNavigate();

  const getCart = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/cart");
      setCart(response.data.data);
      getCartCount();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/cart/remove/${itemId}`);
        getCart();
        Swal.fire('Removed!', 'The item has been removed from your cart.', 'success');
      } catch (error) {
        console.log(error);
        toast.error("Error removing item from cart.");
      }
    }
  };

  const placeOrder = async (itemId: string, quantity: number) => {
    if (user) {
      try {
        const response = await axiosInstance.post(`/order/create_order`, {
          product_id: itemId,
          quantity,
        });
        const order = response.data.paymentInit;
        const key = RAZORPAY_KEY;

        const options = {
          key,
          amount: Math.ceil(order.amount / 100),
          currency: "INR",
          name: "TJ Bazaar",
          description: "RazorPay",
          order_id: order.id,
          notes: {
            address: "Razorpay Corporate Office",
          },
          theme: {
            color: "#121212",
          },
          handler: async (response: any) => {
            try {
              const verifyResponse = await axiosInstance.post(`/order/verify_order`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyResponse.data.status) {
                removeFromCart(itemId);
                toast.success("Payment Successful! Thanks for the Purchase");
                getCart();
                navigate(`../user/dashboard`);
              } else {
                toast.error("Payment verification failed.");
              }
            } catch (error) {
              console.log(error);
              toast.error("Error during payment verification.");
            }
          },
          prefill: {
            email: user.email,
            contact: user.phone,
          },
        };

        const razor = new (window as any).Razorpay(options);
        razor.open();
      } catch (error) {
        console.log(error);
        toast.error("Sorry, cannot process the order right now.");
      }
    } else {
      navigate("/user/login");
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  // Filter and sort logic
  const filteredCart = cart.filter(item => {
    const matchesSearch = item.product_id.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = (statusFilter === 'all' ||
      (statusFilter === 'in-stock' && item.product_id.quantity > 0) ||
      (statusFilter === 'out-of-stock' && item.product_id.quantity === 0));
    return matchesSearch && matchesStatus;
  });

  const sortedCart = [...filteredCart].sort((a, b) => {
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
    document.title = `TJ Bazaar🛒: User Cart`;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-5">
        <div className="grid grid-cols-1 gap-6 pt-5 mx-auto justify-items-center lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-full p-4 border rounded-lg shadow-lg animate-pulse">
              <div className="h-32 mb-2 bg-gray-300 rounded-md"></div>
              <div className="h-4 mb-2 bg-gray-300 rounded"></div>
              <div className="h-4 mb-2 bg-gray-300 rounded"></div>
              <div className="h-4 mb-2 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen pt-6">

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <AiFillHeart className="w-16 h-16 text-red-500 animate-bounce" />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
        </div>) : (
        <>
          <div className='flex flex-col items-center justify-between w-full gap-4 mb-6 lg:flex-row'>
            <div className="flex items-center justify-start w-full gap-2">
              <input
                type="text"
                placeholder="Search by product name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm lg:w-1/3 dark:bg-gray-700 dark:text-white focus:ring focus:ring-blue-300"
              />
              <FaSearch className="text-gray-600 dark:text-gray-300" />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'in-stock' | 'out-of-stock')} className="p-2 text-black border border-gray-300 rounded-lg shadow-sm">
                  <option value="all">All</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
              <div className="flex items-center">
                <select value={sortField} onChange={(e) => setSortField(e.target.value as 'date' | 'price')} className="p-2 text-black border border-gray-300 rounded-lg shadow-sm">
                  <option value="date">Date</option>
                  <option value="price">Price</option>
                </select>
                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center p-2 ml-2 transition-colors duration-300 border border-gray-300 rounded-lg shadow-sm hover:bg-blue-500 hover:text-white">
                  {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 pt-5 mx-auto justify-items-center lg:grid-cols-2 xl:grid-cols-3">
            {sortedCart.map((item) => {
              const isOutOfStock = item.product_id.quantity < item.quantity;
              return (
                <div key={item._id} className="w-full p-4 transition-transform transform border rounded-lg shadow-lg border-gray-300/20 hover:shadow-xl">
                  <Link className='w-full' to={`../product/${item.product_id._id}`}>
                    <img
                      src={item.image || '../bazaar.gif'}
                      alt={item.product_id.name}
                      className="object-cover w-full h-32 mb-2 rounded"
                    />
                    <h3 className="text-lg font-bold">{item.product_id.name.length > 30 ? item.product_id.name.substr(0, 30) + "..." : item.product_id.name}</h3>
                    <p className="mt-2"><span className="font-semibold">Price:</span> ₹{item.product_id.price}</p>
                    <p className="mt-2"><span className="font-semibold">Quantity:</span> {item.quantity}</p>
                    <p className="mt-2">
                      <span className="font-semibold">Total Payable:</span> ₹{item.product_id.price * item.quantity}
                    </p>
                    <p className="mt-2"><span className="font-semibold">Added:</span> {timeAgo(item.createdAt)}</p>
                    {isOutOfStock && (
                      <p className="mt-2 text-xl font-bold text-red-600"><span className="flex items-center">Out of Stock&nbsp;<FaBoxOpen /></span></p>
                    )}
                  </Link>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="flex items-center p-2 text-white bg-red-600 rounded hover:bg-red-500"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => placeOrder(item.product_id._id, item.quantity)}
                      disabled={isOutOfStock}
                      className={`text-white py-2 px-4 rounded flex items-center ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                      <FaShoppingCart className="mr-1" /> Place Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
