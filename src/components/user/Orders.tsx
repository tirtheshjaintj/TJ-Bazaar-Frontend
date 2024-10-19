import { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AiFillHeart } from 'react-icons/ai';

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
    getOrders();
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

  return (
    <div className="py-5 min-h-screen">
      <div className='flex w-full flex-col lg:flex-row gap-4 justify-between items-center mb-6'>
        <div className="flex w-full gap-2 items-center justify-start">
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
          <div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')} className="border text-black border-gray-300 rounded-lg p-2 shadow-sm">
              <option value="all">All</option>
              <option value="pending">Failed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center">
            <select value={sortField} onChange={(e) => setSortField(e.target.value as 'date' | 'amount')} className="border text-black border-gray-300 rounded-lg p-2 shadow-sm">
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center border border-gray-300 rounded-lg p-2 ml-2 shadow-sm hover:bg-blue-500 hover:text-white transition-colors duration-300">
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 justify-items-center pt-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mx-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border w-full rounded-lg shadow-lg p-4 animate-pulse">
              <div className="h-32 bg-gray-300 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
            </div>
          ))
        ) : currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <Link className='w-full' key={order.order_id} to={`../product/${order.product.id}`}>
              <div className="border border-gray-300/20 w-full S rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105 hover:shadow-xl">
                <img src={order.product.image} alt={order.product.name} className="w-full h-32 object-cover rounded-md" />
                <h2 className="font-bold text-lg mt-2">{order.product.name.slice(0, 30) + "..."}</h2>
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
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
          <AiFillHeart className="text-red-500 w-16 h-16 animate-bounce" />
          <h2 className="text-2xl font-bold">No orders match your search criteria.</h2>
        </div>
              )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6">
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
