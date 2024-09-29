import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Background from './components/Background';
import ModeBall from './components/modeBall';
import Cookie from "universal-cookie";
import axios from 'axios';
import { addUser } from './store/userSlice';
import { addSeller } from './store/sellerSlice';
const url=import.meta.env.VITE_BACKEND_URL;

function App() {
  const user = useSelector((state:any) => state.user);
  const seller = useSelector((state:any) => state.seller);
  const cookie=new Cookie();
  const dispatch = useDispatch();

  const getUser=async ()=>{
    let token=cookie.get('user_token');
    if(token){
    try {
      const response=await axios.get(`${url}/user/getUser`,{
        withCredentials:true ,headers: {
        Authorization: `Bearer ${token}`,  // Add token to Authorization header
      }});
      const userData=response.data;
      if(userData.status){
          dispatch(addUser(userData.user));
      }else{
        cookie.remove('user_token');
      }
    } catch (error:any) {
      console.log(error);
    }
  }else{
    addUser(null);
  }
  }
  const getSeller = async () => {
    let token=cookie.get('seller_token');
    if(token){
    try {
      const response = await axios.get(`${url}/seller/getSeller`, { 
      withCredentials: true, 
      headers: {
        Authorization: `Bearer ${token}`,  // Add token to Authorization header
      } 
    });
      const sellerData = response.data;
      if (sellerData.status) {
        dispatch(addSeller(sellerData.data));
      }else{
        cookie.remove('seller_token');
      }
    } catch (error: any) {
      console.log(error);
      // toast.error(error.data.message);
    }
  }else{
    addSeller(null);
  }
  }

  useEffect(()=>{
    if(!user){
      getUser();
    }
    // console.log("User",user);
  },[user]);

  useEffect(()=>{
    if(!seller){
      getSeller();
    }
    // console.log("Seller",seller);
  },[seller]);

  return (
    <Background>
       {/* <Loader/> */}
      <Toaster position="bottom-right" />
      <ModeBall/>
      <Outlet />
    </Background>

  );
}

export default App;
