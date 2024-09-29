import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig'; // Import the configured Axios instance
import { toast } from 'react-hot-toast';
import Cookie from "universal-cookie";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../../store/userSlice';
import Navbar from "../../components/user/Navbar";


function User_Dashboard() {
  const cookie = new Cookie();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const token = cookie.get('user_token');

  const getUser = async () => {
    try {
      const response = await axiosInstance.get(`/user/getUser`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,  // Add token to Authorization header
        }
      });
      const userData = response.data;
      if (userData.status) {
        dispatch(addUser(userData.user));
      } else {
        toast.error(userData.message);
        cookie.remove('user_token');
        navigate("/user/login");
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  useEffect(() => {
    document.title = "TJ Bazaar🛒 User Dashboard";
    if (!token) navigate('/user/login');
    if (!user) {
      getUser();
    }
  }, []);

  return (
    <div>
      <Navbar />
      <div className='flex justify-center items-center min-w-screen'>
        <div className="shadow-xl shadow-slate-50/10 border-2 pt-10 lg:pt-0 dark:border-slate-50/20 mt-10 md:w-[95vw] min-h-screen flex flex-col md:flex-row justify-between rounded-3xl">
          User_Dashboard
        </div>
      </div>
    </div>
  );
}

export default User_Dashboard;
