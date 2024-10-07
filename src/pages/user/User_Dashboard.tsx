import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig'; // Import the configured Axios instance
import Cookie from "universal-cookie";
import Sidebar from "../../components/user/Sidebar";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from "../../components/user/Navbar";
import { FaArrowLeft } from 'react-icons/fa';
import UpdateProfile from '../../components/user/UpdateProfile';
import Orders from '../../components/user/Orders';
import Cart from '../../components/user/Cart';
import WishList from '../../components/user/WishList';
import { addUser } from '../../store/userSlice';

function User_Dashboard() {
  const cookie = new Cookie();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const token = cookie.get('user_token');
  const [tab, setTab] = useState<number>(0);
  const [openTab, setOpenTab] = useState<boolean>(false);
  const [cartCount,setCartCount] = useState<number>(0);
  const [wishlistCount,setWishlistCount] = useState<number>(0);
  const dispatch=useDispatch();
  const getUser = async () => {
    try {
      const response = await axiosInstance.get(`/user/getUser`, {
        withCredentials: true, // Keep this if you need credentials
      });
      const userData = response.data;
      if (userData.status) {
        dispatch(addUser(userData.user));
      } else {
        cookie.remove('user_token');
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const getCartCount=async()=>{
    try {
      const response=await axiosInstance.get("/cart/count");
      if(response.data.status){
      setCartCount(response.data.count);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getWishlistCount=async()=>{
    try {
      const response=await axiosInstance.get("/wishlist/count");
      if(response.data.status){
      setWishlistCount(response.data.count);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    document.title = "TJ Bazaar🛒 User Dashboard";
    if(!user){
     getUser();
    }
    if (!token){
      navigate('../user/login');
    }else{
    getCartCount();
    getWishlistCount();
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
    <Navbar />
    <div className='flex justify-center items-center lg:pt-12 min-w-screen'>
      <div className="shadow-xl shadow-slate-50/10 border-2 pt-10 lg:pt-0 dark:border-slate-50/20 mt-10 md:w-[95vw] min-h-sceen flex flex-col md:flex-row justify-between rounded-3xl">
        <div className={`${!openTab ? "block" : "hidden"} md:block`}>
          <Sidebar setTab={setTab} tab={tab} setOpenTab={setOpenTab} cartCount={cartCount} wishlistCount={wishlistCount} />
        </div>
        <div className={`flex-grow min-h-screen w-[95vw] md:w-full ${openTab ? "block" : "hidden"} relative md:block p-5 border-2 md:border-b-2 md:border-r-2 md:border-t-2 rounded-3xl md:rounded-l-none dark:border-slate-50/20`}>
          <div onClick={() => setOpenTab(false)} className="absolute top-0 left-0 p-3">
            <FaArrowLeft className='text-xl block md:hidden' />
          </div>
          {tab === 0 && <Orders />}
          {tab === 1 && <Cart getCartCount={getCartCount}/>}
          {tab === 2 && <WishList getWishlistCount={getWishlistCount}/>}
          {tab === 3 && <UpdateProfile user_data={user} />}
        </div>
      </div>
    </div>
  </div>
  );
}

export default User_Dashboard;
