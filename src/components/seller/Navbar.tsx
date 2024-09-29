import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { addSeller } from "../../store/sellerSlice";

export default function Nav() {
  const navigate = useNavigate();
  const cookie = new Cookies();
  const dispatch = useDispatch();
  const seller = useSelector((state: any) => state.seller);
  const signOut=()=>{
    cookie.remove('seller_token', { path: '/'});
      navigate("/seller/login");
      dispatch(addSeller(null));
  }
  return (
    <Navbar fluid rounded className="bg-white/50 fixed w-full z-10 lg:relative dark:bg-gray-900/50 backdrop-blur-3xl">
      <Link to="/" className="flex">
      <img src="/bazaar.gif" className="mr-3 h-12" alt="Flowbite React Logo" />
        <h1 className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white cursor-pointer">
        TJ Bazaar&nbsp;
        </h1>
      </Link>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar alt={`${seller?.name}`} img="" rounded />
          }
        >
          <Dropdown.Header>
            <span className="block text-sm">{`${seller?.name}`}</span>
            <span className="block truncate text-sm font-medium">{`${seller?.email}`}</span>
          </Dropdown.Header>
          <Link to={"../seller/dashboard"}>
          <Dropdown.Item>Dashboard</Dropdown.Item>
          </Link>
          <Link to={"../user/dashboard"}>
          <Dropdown.Item>Become User</Dropdown.Item>
          </Link>
          <Dropdown.Divider />
          <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
        </Dropdown>
        {/* <Navbar.Toggle /> */}
      </div>
      {/* <Navbar.Collapse>
        <Navbar.Link href="#" active>
          Home
        </Navbar.Link>
        <Navbar.Link href="#">About</Navbar.Link>
        <Navbar.Link href="#">Services</Navbar.Link>
        <Navbar.Link href="#">Pricing</Navbar.Link>
        <Navbar.Link href="#">Contact</Navbar.Link>
      </Navbar.Collapse> */}
    </Navbar>
  );
}
