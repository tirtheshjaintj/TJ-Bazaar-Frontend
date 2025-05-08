import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import { GoogleOAuthProvider } from "@react-oauth/google"
import { ProductContextProvider } from './context/ProductContext';

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/search", element: <Search /> },
      { path: "/product/:id", element: <Product /> },
      { path: "/category/:id", element: <Category /> },
      { path: "/seller/:id", element: <Seller /> },
      { path: "/seller/login", element: <Login type="seller" /> },
      { path: "/seller/signup", element: <Seller_Signup /> },
      { path: "/seller/forgot", element: <Forgot_Password type="seller" /> },
      { path: "/seller/dashboard", element: <Seller_Dashboard /> },
      { path: "/user/login", element: <Login type="user" /> },
      { path: "/user/signup", element: <User_Signup /> },
      { path: "/user/forgot", element: <Forgot_Password type="user" /> },
      { path: "/user/dashboard", element: <User_Dashboard /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_ID}>
    <ProductContextProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ProductContextProvider>
  </GoogleOAuthProvider>
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

