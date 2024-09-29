import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookie from "universal-cookie";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSeller } from '../../store/sellerSlice';
import Navbar from "../../components/seller/Navbar";
import Sidebar from '../../components/seller/Sidebar';
import NewProduct from '../../components/seller/NewProduct';
import UpdateProfile from '../../components/seller/UpdateProfile';
import MyProducts from '../../components/seller/MyProducts';
import { FaArrowLeft} from 'react-icons/fa';
import MyOrders from '../../components/seller/MyOrders';
const url = import.meta.env.VITE_BACKEND_URL;

function Seller_Dashboard() {
  const cookie = new Cookie();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tab, setTab] = useState<number>(0);
  const seller = useSelector((state: any) => state.seller);
  const [openTab,setOpenTab]=useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const token=cookie.get('seller_token');
  const getSeller = async () => {
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
      }
    } catch (error: any) {
      toast.error(error.data.message);
    }
  }

  useEffect(() => {
    document.title = `TJ Bazaar🛒 Seller Dashboard`;
    let token = cookie.get('seller_token');
    if (!token) navigate('/seller/login');
    if(!seller){
    getSeller();
    }
  }, []);

  useEffect(() => {
    if (seller) {
      toast.success(`Welcome,${seller?.name} Lets start selling`)
    }
  }, [seller]);

  return (
    <div>
      <Navbar/>
      <div className='flex justify-center items-center min-w-screen'>
        <div className="shadow-xl shadow-slate-50/10 border-2 pt-10 lg:pt-0 dark:border-slate-50/20 mt-10 md:w-[95vw] min-h-sceen flex flex-col md:flex-row justify-between rounded-3xl">
          <div className={`${!openTab?"block":"hidden"} md:block`}>
          <Sidebar setTab={setTab} tab={tab} setOpenTab={setOpenTab} setSelectedProduct={setSelectedProduct}/>
          </div>
          <div className={`flex-grow min-h-screen w-[95vw] md:w-full ${openTab?"block":"hidden"} relative md:block p-5 border-2 md:border-b-2 md:border-r-2 md:border-t-2 rounded-3xl md:rounded-l-none dark:border-slate-50/20`}>
          <div onClick={()=>setOpenTab(false)} className="absolute top-0 left-0 p-3">
            <FaArrowLeft className='text-xl block md:hidden'/>
          </div>
          {tab==0 && <NewProduct />}
          {tab==1 && <MyProducts selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}/>}
          {tab==2 && <MyOrders />}
          {tab==3 && <UpdateProfile seller_data={seller}/>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Seller_Dashboard