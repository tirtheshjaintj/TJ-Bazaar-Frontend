import { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AiFillHeart } from 'react-icons/ai';
import Cookie from "universal-cookie";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface Order {
  order_id: string;
  quantity: number;
  amount: number;
  createdAt: string;
  order_status: boolean;
  product: Product;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;
  const cookie = new Cookie();
  const token = cookie.get('user_token');


  const getOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/order/get_orders");
      setOrders(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getOrders();
    }
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !order.order_status) ||
      (statusFilter === 'completed' && order.order_status);
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - orderDate.getTime()) / 1000);

    const years = Math.floor(diffInSeconds / (3600 * 24 * 365));
    const months = Math.floor(diffInSeconds / (3600 * 24 * 30));
    const weeks = Math.floor(diffInSeconds / (3600 * 24 * 7));
    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor(diffInSeconds / 60);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  useEffect(() => {
    document.title = `TJ Bazaar🛒: User Orders`;
  }, []);

  if (!loading && orders.length === 0) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <AiFillHeart className="w-16 h-16 text-red-500 animate-bounce" />
      <h2 className="text-2xl font-bold">No Orders Found.</h2>
    </div>
  }

  return (
    <div className="min-h-screen py-5">
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')} className="p-2 text-black border border-gray-300 rounded-lg shadow-sm">
              <option value="all">All</option>
              <option value="pending">Failed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center">
            <select value={sortField} onChange={(e) => setSortField(e.target.value as 'date' | 'amount')} className="p-2 text-black border border-gray-300 rounded-lg shadow-sm">
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center p-2 ml-2 transition-colors duration-300 border border-gray-300 rounded-lg shadow-sm hover:bg-blue-500 hover:text-white">
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pt-5 mx-auto justify-items-center lg:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-full p-4 border rounded-lg shadow-lg animate-pulse">
              <div className="h-32 mb-2 bg-gray-300 rounded-md"></div>
              <div className="h-4 mb-2 bg-gray-300 rounded"></div>
              <div className="h-4 mb-2 bg-gray-300 rounded"></div>
              <div className="h-4 mb-2 bg-gray-300 rounded"></div>
              <div className="h-4 mb-2 bg-gray-300 rounded"></div>
            </div>
          ))
        ) : currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <Link className='w-full' key={order.order_id} to={`../product/${order.product.id}`}>
              <div className="w-full p-4 transition-transform transform border rounded-lg shadow-lg border-gray-300/20 S hover:scale-105 hover:shadow-xl">
                <img src={order.product.image} alt={order.product.name} className="object-cover w-full h-32 rounded-md" />
                <h2 className="mt-2 text-lg font-bold">{order.product.name.slice(0, 30) + "..."}</h2>
                <p className="mt-2">
                  <span className="font-semibold">Price:</span> ₹{order.product.price}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Quantity ordered:</span> {order.quantity}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Order Amount:</span> ₹{order.amount}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Order Status:</span>
                  <span className={`ml-2 ${order.order_status ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} rounded-full px-2 py-1 text-xs`}>
                    {order.order_status ? 'Completed' : 'Failed'}
                  </span>
                </p>
                <p className="mt-2 text-xs">
                  <span className="font-medium">Order ID:</span> {order.order_id}
                </p>
                <p className="mt-2 text-xs">
                  <span className="font-medium">Order Date:</span> {getTimeAgo(order.createdAt)}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <AiFillHeart className="w-16 h-16 text-red-500 animate-bounce" />
            <h2 className="text-2xl font-bold">No orders match your search criteria.</h2>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-6">
        {Array.from({ length: Math.ceil(sortedOrders.length / ordersPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`px-3 py-1 mx-1 border rounded-lg ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Orders;
