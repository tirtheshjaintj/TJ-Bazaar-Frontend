/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Background from './components/Background';
import ModeBall from './components/modeBall';
import Cookie from "universal-cookie";
import axiosInstance from './config/axiosConfig';
import axiosInstanceSeller from './config/axiosConfigSeller';
import { addUser } from './store/userSlice';
import { addSeller } from './store/sellerSlice';
import Chatbot from './components/ChatBot';
import ReactConfetti from 'react-confetti';

function App() {
  const user = useSelector((state: any) => state.user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seller = useSelector((state: any) => state.seller);
  const cookie = new Cookie();
  const dispatch = useDispatch();

  const getUser = async () => {
    const userToken = cookie.get('user_token');
    if (!userToken) {
      return; // Exit if the seller token is not available
    }
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
      if (!error?.response?.data?.status) {
        cookie.remove('user_token');
      }
    }
  };

  const getSeller = async () => {
    const sellerToken = cookie.get('seller_token');
    if (!sellerToken) {
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
      if (!error?.response?.data?.status) {
        cookie.remove('seller_token');
      }
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
      <ReactConfetti
        width={window.innerWidth}
        height={document.documentElement.scrollHeight}
        numberOfPieces={20}
        gravity={0.05}
        colors={[
          '#f44336', '#e91e63', '#9c27b0', '#673ab7',
          '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
          '#009688', '#4caf50', '#8bc34a', '#cddc39',
          '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
        ]}
        recycle={true}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: -199 }}

      />

      <Toaster position="bottom-right" />
      <ModeBall />
      <Outlet />
      <Chatbot />
    </Background>
  );
}

export default App;
