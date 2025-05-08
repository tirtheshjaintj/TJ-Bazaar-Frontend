/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Cookie from "universal-cookie";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from "../../components/seller/Navbar";
import Sidebar from '../../components/seller/Sidebar';
import NewProduct from '../../components/seller/NewProduct';
import UpdateProfile from '../../components/seller/UpdateProfile';
import MyProducts from '../../components/seller/MyProducts';
import { FaArrowLeft } from 'react-icons/fa';
import MyOrders from '../../components/seller/MyOrders';
import { addSeller } from '../../store/sellerSlice';
import axiosInstanceSeller from '../../config/axiosConfigSeller';

function Seller_Dashboard() {
  const cookie = new Cookie();
  const navigate = useNavigate();
  const [tab, setTab] = useState<number>(0);
  const seller = useSelector((state: any) => state.seller);
  const [openTab, setOpenTab] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dispatch = useDispatch();

  const getSeller = async () => {
    const sellerToken = cookie.get('seller_token');
    if (!sellerToken) {
      return;
    }

    try {
      const response = await axiosInstanceSeller.get(`/seller/getSeller`);
      const sellerData = response.data;
      if (sellerData.status) {
        dispatch(addSeller(sellerData.data));
      } else {
        cookie.remove('seller_token');
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    document.title = `TJ Bazaar🛒 Seller Dashboard`;
    const token = cookie.get('seller_token');
    if (!token) navigate('/seller/login');
    if (!seller) getSeller();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (seller) {
      toast.success(`Welcome, ${seller?.name}! Let's start selling`);
    }
  }, [seller]);

  return (
    <div>
      <Navbar />
      <div className='flex items-center justify-center min-w-screen'>
        <div className="shadow-xl shadow-slate-50/10 border-2 pt-10 lg:pt-0 dark:border-slate-50/20 mt-10 md:w-[95vw] min-h-sceen flex flex-col md:flex-row justify-between rounded-3xl">
          <div className={`${!openTab ? "block" : "hidden"} md:block`}>
            <Sidebar setTab={setTab} tab={tab} setOpenTab={setOpenTab} setSelectedProduct={setSelectedProduct} />
          </div>
          <div className={`flex-grow min-h-screen w-[95vw] md:w-full ${openTab ? "block" : "hidden"} relative md:block p-5 border-2 md:border-b-2 md:border-r-2 md:border-t-2 rounded-3xl md:rounded-l-none dark:border-slate-50/20`}>
            <div onClick={() => setOpenTab(false)} className="absolute top-0 left-0 p-3">
              <FaArrowLeft className='block text-xl md:hidden' />
            </div>
            {tab === 0 && <NewProduct />}
            {tab === 1 && <MyProducts selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />}
            {tab === 2 && <MyOrders />}
            {tab === 3 && <UpdateProfile seller_data={seller} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Seller_Dashboard;
