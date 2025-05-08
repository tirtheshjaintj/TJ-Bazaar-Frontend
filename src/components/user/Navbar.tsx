/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react"; // Import useRef
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { addUser } from "../../store/userSlice";
import { FaSearch, FaTimes } from "react-icons/fa";
import axiosInstance from "../../config/axiosConfig";
import toast from "react-hot-toast";
let deferredPrompt: any = null;

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

  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for triggering later
      deferredPrompt = e;
      // Update state to reflect that the app is installable
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
          deferredPrompt = null;
          setIsInstallable(false);
        } else {
          console.log("User dismissed the install prompt");
        }
      } catch (err) {
        console.error("Failed to install the app", err);
        toast.error("Failed to install the app");
      }
    }
  };

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
      <Navbar className="bg-white/50 fixed top-0 left-0 w-[100vw] lg:w-[100vw] z-10 dark:bg-gray-900/50 backdrop-blur-3xl">
        <Link to="/" className="flex flex-grow" onClick={isInstallable ? install : undefined}>
          <img src="/bazaar.gif" className="h-12 mr-3" alt="TJ Bazaar" />
          <h1 className="self-center text-2xl font-semibold cursor-pointer whitespace-nowrap dark:text-white">
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
              className="w-full px-6 py-4 transition-all border border-gray-300 rounded-full shadow-md bg-white/70 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md"
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onBlur={handleBlur} // Call handleBlur on blur
              onFocus={handleFocus} // Call handleFocus on focus
            />
            <button
              type="submit"
              className="absolute px-6 py-3 text-white transition-all transform -translate-y-1/2 bg-blue-600 rounded-full right-3 top-1/2 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <FaSearch />
            </button>
          </div>
          {/* Suggestions Dropdown */}
          {showSuggestion && suggestions.length > 0 && (
            <div className="w-full">
              <div className="absolute z-10 hidden w-full p-2 mt-2 bg-white rounded-lg shadow-lg lg:block top-14 dark:bg-gray-800">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion._id}
                    className="p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onMouseDown={() => handleSuggestionClick(suggestion)} // Use onMouseDown instead of onClick
                  >
                    <h4 className="w-full pt-1 text-sm text-clip">{suggestion.name.substr(0, 70)}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Mobile Search Icon */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={toggleSearch}
            className="p-2 text-gray-700 dark:text-white"
          >
            {isSearchOpen ? <FaTimes size={20} /> : <FaSearch size={20} />}
          </button>
        </div>

        {/* Search Bar for Mobile */}
        <div className="flex justify-end flex-grow md:order-2 ">
          <Dropdown
            arrowIcon={false}
            inline
            label={<Avatar alt={`${user?.name}`} img="" rounded />}
          >
            {user ? (
              <>
                <Dropdown.Header>
                  <span className="block text-sm">{`${user?.name}`}</span>
                  <span className="block text-sm font-medium truncate">{`${user?.email}`}</span>
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
            className="relative flex items-center w-full mx-4 mt-5 lg:hidden"
          >
            <input
              type="text"
              ref={inputRef} // Attach the ref here for mobile search
              className="w-full px-5 py-5 pl-10 transition-all border border-gray-300 rounded-full shadow-md bg-white/70 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md"
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onBlur={handleBlur} // Call handleBlur on blur
              onFocus={handleFocus} // Call handleFocus on focus
            />
            <button
              type="submit"
              className="absolute px-4 py-2 text-white transition-all transform -translate-y-1/2 bg-blue-600 rounded-full right-3 top-1/2 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <FaSearch />
            </button>

            {/* Suggestions Dropdown for Mobile */}
            {showSuggestion && suggestions.length > 0 && (
              <div className="absolute z-10 w-full p-2 mt-2 bg-white rounded-lg shadow-lg top-16 dark:bg-gray-800">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion._id}
                    className="p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onMouseDown={() => handleSuggestionClick(suggestion)} // Use onMouseDown instead of onClick
                  >
                    <h4 className="w-full pt-1 text-sm text-clip">{suggestion.name.substr(0, 70)}</h4>
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
