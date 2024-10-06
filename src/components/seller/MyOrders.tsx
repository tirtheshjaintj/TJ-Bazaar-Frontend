import { useEffect, useState } from "react";
import axiosInstanceSeller from '../../config/axiosConfigSeller';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import ReactModal from 'react-modal';

interface User {
  id: string;
  name: string;
  address: string;
  phone_number: string;
}

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
  user: User;
}

ReactModal.setAppElement('#root'); // Set the root element for accessibility

function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getOrders = async () => {
    try {
      const response = await axiosInstanceSeller.get("/seller/getOrders");
      setOrders(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="py-5 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

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
          <select value={sortField} onChange={(e) => setSortField(e.target.value as 'date' | 'amount')} className="border text-black border-gray-300 rounded-lg p-2 shadow-sm">
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center border border-gray-300 rounded-lg p-2 ml-2 shadow-sm hover:bg-blue-500 hover:text-white transition-colors duration-300">
            {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
      </div>

      <div className="grid gap-6 justify-items-center pt-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mx-auto">
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order) => (
            <div key={order.order_id} className="border w-full border-gray-300/20 rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105 hover:shadow-xl">
              <img src={order.product.image} alt={order.product.name} className="w-full h-32 object-cover rounded-md" />
              <h2 className="font-bold text-lg mt-2">{order.product.name.slice(0, 30) + "..."}</h2>
              <p className="mt-2">
                <span className="font-semibold">Price:</span> ₹{order.product.price}
              </p>
              <p className="mt-2">
                <span className="font-semibold">Quantity Ordered:</span> {order.quantity}
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
                <span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <button
                className="mt-4 text-blue-500 hover:underline"
                onClick={() => openModal(order.user)}
              >
                View User Details
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No orders found</p>
        )}
      </div>

      <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel="User Details Modal"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-xl font-bold mb-4">User Details</h2>
          {selectedUser && (
            <>
              <p className="text-sm text-gray-700">
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Address:</strong> {selectedUser.address}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Phone:</strong> {selectedUser.phone_number}
              </p>
            </>
          )}
          <button
            onClick={closeModal}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </ReactModal>
    </div>
  );
}

export default MyOrders;
