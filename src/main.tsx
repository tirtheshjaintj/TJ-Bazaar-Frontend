import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { createBrowserRouter, createRoutesFromChildren, Route, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Seller_Login from './pages/seller/Seller_Login';
import Seller_Signup from './pages/seller/Seller_Signup';
import Seller_Dashboard from './pages/seller/Seller_Dashboard';
import User_Login from './pages/user/User_Login';
import User_Signup from './pages/user/User_Signup';
import User_Dashboard from './pages/user/User_Dashboard';
import Home from './pages/Home';
import Search from './pages/Search';
import Product from './pages/Product';

const router=createBrowserRouter(
  createRoutesFromChildren(
    <Route path="" element={<App/>}>
    <Route path="/" element={<Home/>}/>
    <Route path="/search" element={<Search/>}/>
    <Route path="/product/:id" element={<Product/>}/>
    <Route path="/seller/login" element={<Seller_Login/>}/>
    <Route path="/seller/signup" element={<Seller_Signup/>}/>
    <Route path="/seller/dashboard" element={<Seller_Dashboard/>}/>
    <Route path="/user/login" element={<User_Login/>}/>
    <Route path="/user/signup" element={<User_Signup/>}/>
    <Route path="/user/dashboard" element={<User_Dashboard/>}/>
    </Route>
  )
);

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
  <RouterProvider router={router}/>
  </Provider>
)
