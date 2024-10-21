import { useState, useEffect, useCallback, useRef } from "react"; // Import useRef
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { addUser } from "../../store/userSlice";
import { FaSearch, FaTimes } from "react-icons/fa"; 
import axiosInstance from "../../config/axiosConfig"; 
import toast from "react-hot-toast";

export default function Nav() {
  const navigate = useNavigate();
  const cookie = new Cookies();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("keyword") || ""; 
  const [searchKeyword, setSearchKeyword] = useState(searchQuery); 
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [suggestions, setSuggestions] = useState<any[]>([]); 
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [debounceTimer, setDebounceTimer] = useState<any>(null); 
  const inputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the input

  const signOut = () => {
    cookie.remove('user_token', { path: '/' });
    navigate("/user/login");
    dispatch(addUser(null));
  };
  let deferredPrompt:any = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    deferredPrompt = e;
  });

 const install=async()=>{
    try {
      if (deferredPrompt !== null) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          deferredPrompt = null;
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setSearchParams({ keyword: searchKeyword.trim() }); 
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (keyword.trim()) {
      try {
        const response = await axiosInstance.post(`/product/suggest?keyword=${keyword}`);
        if (response.data.status) {
          setSuggestions(response.data.data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch suggestions");
      }
    } else {
      setSuggestions([]); 
    }
  }, []);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setShowSuggestion(false);
    }
    const timer = setTimeout(() => {
      fetchSuggestions(searchKeyword);
      setShowSuggestion(true);
    }, 300); 

    setDebounceTimer(timer);

  }, [searchKeyword, fetchSuggestions]);

  useEffect(() => {
    setSearchKeyword(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    // Hide suggestions when navigating to the search or product pages
    if (searchQuery) {
      setSuggestions([]);
    }
  }, [searchQuery, navigate]);

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events to register
    setTimeout(() => {
      setShowSuggestion(false);
    }, 200); // Adjust time as needed
  };

  const handleFocus = () => {
    // Show suggestions when the input is focused
    if (suggestions.length > 0) {
      setShowSuggestion(true);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setIsSearchOpen(false);
    setShowSuggestion(false); // Hide suggestions after navigating
    navigate(`../product/${suggestion._id}`);
  };

  return (
    <>
      <Navbar className="bg-white/50 fixed w-[100vw] lg:w-[90vw] z-10 dark:bg-gray-900/50 backdrop-blur-3xl">
        <Link to="/" className="flex flex-grow" onClick={install}>
          <img src="/bazaar.gif" className="mr-3 h-12" alt="TJ Bazaar" />
          <h1 className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white cursor-pointer">
            TJ Bazaar&nbsp;
          </h1>
        </Link>

        {/* Search Bar for Large Screens */}
        <form
          onSubmit={handleSearch}
          className={`hidden lg:flex flex-col flex-grow items-center w-full md:w-auto relative`}
        >
          <div className={`flex flex-grow items-center w-full relative`}>
            <input
              type="text"
              ref={inputRef} // Attach the ref here
              className="w-full px-6 py-4 rounded-full bg-white/70 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md backdrop-blur-md transition-all"
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onBlur={handleBlur} // Call handleBlur on blur
              onFocus={handleFocus} // Call handleFocus on focus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all"
            >
              <FaSearch />
            </button>
          </div>
          {/* Suggestions Dropdown */}
          {showSuggestion && suggestions.length > 0 && (
            <div className="w-full">
              <div className="absolute p-2 hidden lg:block top-14 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 mt-2 w-full">
                {suggestions.map((suggestion) => (
                  <div 
                    key={suggestion._id} 
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    onMouseDown={() => handleSuggestionClick(suggestion)} // Use onMouseDown instead of onClick
                  >
                    <h4 className="text-sm pt-1 text-clip w-full">{suggestion.name.substr(0,70)}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Mobile Search Icon */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={toggleSearch}
            className="p-2 text-gray-700 dark:text-white"
          >
            {isSearchOpen ? <FaTimes size={20} /> : <FaSearch size={20} />}
          </button>
        </div>

        {/* Search Bar for Mobile */}
        <div className="flex md:order-2 flex-grow justify-end ">
          <Dropdown
            arrowIcon={false}
            inline
            label={<Avatar alt={`${user?.name}`} img="" rounded />}
          >
            { user ? (
              <>
                <Dropdown.Header>
                  <span className="block text-sm">{`${user?.name}`}</span>
                  <span className="block truncate text-sm font-medium">{`${user?.email}`}</span>
                </Dropdown.Header>
                <Link to={"../user/dashboard"}>
                  <Dropdown.Item>
                    Dashboard
                  </Dropdown.Item>
                </Link>
                <Link to={"../seller/dashboard"}>
                  <Dropdown.Item>
                    Become Seller
                  </Dropdown.Item>
                </Link>
                <Dropdown.Divider />
                <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
              </>
            ) : (
              <>
                <Link to={"../user/dashboard"}>
                  <Dropdown.Item>
                    Become User
                  </Dropdown.Item>
                </Link>
                <Link to={"../seller/dashboard"}>
                  <Dropdown.Item>
                    Become Seller
                  </Dropdown.Item>
                </Link>
              </>
            )}
          </Dropdown>
        </div>

        {isSearchOpen && (
          <form
            onSubmit={handleSearch}
            className="flex mt-5 lg:hidden items-center w-full mx-4 relative"
          >
            <input
              type="text"
              ref={inputRef} // Attach the ref here for mobile search
              className="w-full px-5 py-5 pl-10 rounded-full bg-white/70 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md backdrop-blur-md transition-all"
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onBlur={handleBlur} // Call handleBlur on blur
              onFocus={handleFocus} // Call handleFocus on focus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all"
            >
              <FaSearch />
            </button>

            {/* Suggestions Dropdown for Mobile */}
            {showSuggestion && suggestions.length > 0 && (
            <div className="absolute top-16 p-2  bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 mt-2 w-full">
                      {suggestions.map((suggestion) => (
                  <div 
                    key={suggestion._id} 
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    onMouseDown={() => handleSuggestionClick(suggestion)} // Use onMouseDown instead of onClick
                  >
                    <h4 className="text-sm pt-1 text-clip w-full">{suggestion.name.substr(0,70)}</h4>
                  </div>
                ))}
              </div>
            )}
          </form>
        )}
      </Navbar>
    </>
  );
}
