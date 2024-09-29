import { useState, useEffect } from "react";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { addUser } from "../../store/userSlice";
import { FaSearch, FaTimes } from "react-icons/fa"; // Import FontAwesome Icons

export default function Nav() {
  const navigate = useNavigate();
  const cookie = new Cookies();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("keyword") || ""; // Get search keyword from URL params
  const [searchKeyword, setSearchKeyword] = useState(searchQuery); // Initialize state with query param

  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for toggling search bar

  const signOut = () => {
    cookie.remove('user_token', { path: '/' });
    navigate("/user/login");
    dispatch(addUser(null));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setSearchParams({ keyword: searchKeyword.trim() }); // Set the search keyword as a query param
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // Update the search keyword if the URL search params change
  useEffect(() => {
    setSearchKeyword(searchQuery);
  }, [searchQuery]);

  return (
    <Navbar fluid rounded className="bg-white/50 fixed w-full z-10 lg:relative dark:bg-gray-900/50 backdrop-blur-3xl">
      <Link to="/" className="flex flex-grow">
        <img src="/bazaar.gif" className="mr-3 h-12" alt="Flowbite React Logo" />
        <h1 className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white cursor-pointer">
          TJ Bazaar&nbsp;
        </h1>
      </Link>

      {/* Search Bar for Large Screens */}
      <form
        onSubmit={handleSearch}
        className={`hidden lg:flex flex-grow items-center w-full md:w-auto mx-4 relative`}
      >
        <input
          type="text"
          className="w-full px-5 py-3 rounded-full bg-white/70 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md backdrop-blur-md transition-all"
          placeholder="Search..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all"
        >
          <FaSearch />
        </button>
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
          { user?<><Dropdown.Header>
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
          </>:<>
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
          }
      </Dropdown>

      </div>
      {isSearchOpen && (
        <form
          onSubmit={handleSearch}
          className="flex lg:hidden items-center w-full mx-4 relative"
        >
          <input
            type="text"
            className="w-full px-5 py-5 pl-10 rounded-full bg-white/70 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md backdrop-blur-md transition-all"
            placeholder="Search..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all"
          >
            <FaSearch />
          </button>
        </form>
      )}
    </Navbar>
  );
}
