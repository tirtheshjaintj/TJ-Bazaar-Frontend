import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Background from './components/Background';
import ModeBall from './components/modeBall';
import Cookie from "universal-cookie";
import axiosInstance from './config/axiosConfig'; // Adjust the path according to your project structure
import axiosInstanceSeller from './config/axiosConfigSeller';
import { addUser } from './store/userSlice';
import { addSeller } from './store/sellerSlice';

function App() {
  const user = useSelector((state: any) => state.user);
  const seller = useSelector((state: any) => state.seller);
  const cookie = new Cookie();
  const dispatch = useDispatch();

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
      //console.log(error);
    }
  };

  const getSeller = async () => {
    const sellerToken = cookie.get('seller_token');
    if (!sellerToken) {
      //console.log("Seller token not found.");
      return; // Exit if the seller token is not available
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
      //console.log(error);
    }
  };

  useEffect(() => {
    if (!user) {
      getUser();
    }
    //console.log("User", user);
  }, [user]);

  useEffect(() => {
    if (!seller) {
      getSeller();
    }
    //console.log("Seller", seller);
  }, [seller]);

  return (
    <Background>
      {/* <Loader/> */}
      <Toaster position="bottom-right" />
      <ModeBall />
      <Outlet />
    </Background>
  );
}

export default App;
