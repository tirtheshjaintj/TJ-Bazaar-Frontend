import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { createBrowserRouter, createRoutesFromChildren, Route, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Seller_Signup from './pages/seller/Seller_Signup';
import Seller_Dashboard from './pages/seller/Seller_Dashboard';
import User_Signup from './pages/user/User_Signup';
import User_Dashboard from './pages/user/User_Dashboard';
import Home from './pages/Home';
import Search from './pages/Search';
import Product from './pages/Product';
import Category from './pages/Category';
import Seller from './pages/Seller';
import Forgot_Password from './pages/Forgot_Password';
import Login from './pages/Login';

const router=createBrowserRouter(
  createRoutesFromChildren(
    <Route path="" element={<App/>}>
      
    <Route path="/" element={<Home/>}/>
    <Route path="/search" element={<Search/>}/>
    <Route path="/product/:id" element={<Product/>}/>
    <Route path="/category/:id" element={<Category/>}/>
    <Route path="/seller/:id" element={<Seller/>}/>

    <Route path="/seller/login" element={<Login type="seller"/>}/>
    <Route path="/seller/signup" element={<Seller_Signup/>}/>
    <Route path="/seller/forgot" element={<Forgot_Password type="seller"/>}/>
    <Route path="/seller/dashboard" element={<Seller_Dashboard/>}/>
    
    <Route path="/user/login" element={<Login type="user"/>}/>
    <Route path="/user/signup" element={<User_Signup/>}/>
    <Route path="/user/forgot" element={<Forgot_Password type="user"/>}/>
    <Route path="/user/dashboard" element={<User_Dashboard/>}
    />
    </Route>
  )
);

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
  <RouterProvider router={router}/>
  </Provider>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(err => {
        console.error('Service Worker registration failed:', err);
      });
  });
}

