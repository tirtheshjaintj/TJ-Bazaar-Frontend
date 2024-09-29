import { FaBox, FaShoppingCart, FaUser, FaPlusCircle } from 'react-icons/fa';

interface Prop {
  setTab: (tabIndex: number) => void;
  setOpenTab: (tabIndex: boolean) => void;
  setSelectedProduct: (val:any) => void;
  tab: number;
}

function Sidebar({ setTab, tab,setOpenTab,setSelectedProduct}: Prop) {
  return (
    <div className={` min-h-screen w-[95vw] md:w-full border-t-2 dark:border-slate-50/20  md:min-w-60 md:rounded-r-none rounded-3xl`}>
      <div className={`flex flex-col justify-between h-full`}>
        <div className={`allTabs`}>
          <div
            onClick={() =>{setTab(0);setOpenTab(true)}}
            className={`${tab === 0 ? 'dark:bg-gray-700' : ''} text-lg rounded-t-3xl text-bold border-b-2 md:rounded-r-none dark:border-slate-50/10 px-8 py-3 cursor-pointer flex items-center`}
          >
            <FaPlusCircle className="mr-2" /> New Product
          </div>
          <div
            onClick={() =>{setTab(1);setOpenTab(true);setSelectedProduct(null);}}
            className={`${tab === 1 ? 'dark:bg-gray-700' : ''} text-lg text-bold border-b-2 dark:border-slate-50/10 hover:dark:bg-gray-700 px-8 py-3 cursor-pointer flex items-center`}
          >
            <FaBox className="mr-2" /> Your Products
          </div>
          <div
            onClick={() =>{setTab(2);setOpenTab(true)}}
            className={`${tab === 2 ? 'dark:bg-gray-700' : ''} text-lg text-bold border-b-2 dark:border-slate-50/10 hover:dark:bg-gray-700 px-8 py-3 cursor-pointer flex items-center`}
          >
            <FaShoppingCart className="mr-2" /> Your Orders
          </div>
          <div
            onClick={() =>{setTab(3);setOpenTab(true)}}
            className={`${tab === 3 ? 'dark:bg-gray-700' : ''} text-lg rounded text-bold border-b-2 dark:border-slate-50/10 hover:dark:bg-gray-700 px-8 py-3 cursor-pointer flex items-center`}
          >
            <FaUser className="mr-2" /> Your Profile
          </div>
       
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
