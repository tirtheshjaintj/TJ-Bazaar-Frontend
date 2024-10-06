import { FaShoppingCart, FaHeart, FaUser, FaClipboardList } from 'react-icons/fa';

interface Prop {
    setTab: (tabIndex: number) => void;
    setOpenTab: (tabIndex: boolean) => void;
    tab: number;
    cartCount:number;
    wishlistCount:number;
}

function Sidebar({ setTab, setOpenTab, tab,cartCount,wishlistCount}: Prop) {
  return (
    <div className={`min-h-screen w-[95vw] md:w-full border-t-2 dark:border-slate-50/20 md:min-w-60 md:rounded-r-none rounded-3xl`}>
      <div className={`flex flex-col justify-between h-full`}>
        <div className={`allTabs`}>
          <div
            onClick={() => { setTab(0); setOpenTab(true); }}
            className={`text-lg rounded-t-3xl text-bold border-b-2 dark:border-slate-50/10 px-8 py-3 cursor-pointer flex items-center ${tab === 0 ? 'bg-gray-700 text-white' : ''}`}
          >
            <FaClipboardList className="mr-2" /> My Orders
          </div>
          <div
            onClick={() => { setTab(1); setOpenTab(true); }}
            className={`text-lg text-bold border-b-2 dark:border-slate-50/10 px-8 py-3 cursor-pointer flex items-center ${tab === 1 ? 'bg-gray-700 text-white' : ''}`}
          >
            <FaShoppingCart className="mr-2" /> My Cart&nbsp;<span className='inline-flex items-center justify-center p-1 min-w-6 min-h-6 text-sm font-semibold text-white bg-red-500 rounded-full'>{cartCount}</span>
          </div>
          <div
            onClick={() => { setTab(2); setOpenTab(true); }}
            className={`text-lg text-bold border-b-2 dark:border-slate-50/10 px-8 py-3 cursor-pointer flex items-center ${tab === 2 ? 'bg-gray-700 text-white' : ''}`}
          >
            <FaHeart className="mr-2" /> My Wishlist&nbsp;<span className='inline-flex items-center justify-center p-1 min-w-6 min-h-6 text-sm font-semibold text-white bg-red-500 rounded-full'>{wishlistCount}</span>
          </div>
          <div
            onClick={() => { setTab(3); setOpenTab(true); }}
            className={`text-lg text-bold border-b-2 dark:border-slate-50/10 px-8 py-3 cursor-pointer flex items-center ${tab === 3 ? 'bg-gray-700 text-white' : ''}`}
          >
            <FaUser className="mr-2" /> My Profile
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
