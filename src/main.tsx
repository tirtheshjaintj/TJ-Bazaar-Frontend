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
      // Public routes
      { path: "/", element: <Home /> },
      { path: "/search", element: <Search /> },
      { path: "/product/:id", element: <Product /> },
      { path: "/category/:id", element: <Category /> },
      // Seller routes
      {
        path: "seller",
        children: [
          { path: "login", element: <Login type="seller" /> },
          { path: "signup", element: <Seller_Signup /> },
          { path: "forgot", element: <Forgot_Password type="seller" /> },
          {
            path: "dashboard", children: [
              { index: true, element: <Seller_Dashboard url_tab={0} /> },
              {
                path: "new",
                element: <Seller_Dashboard url_tab={0} />
              }, {
                path: "products",
                element: <Seller_Dashboard url_tab={1} />
              }, {
                path: "orders",
                element: <Seller_Dashboard url_tab={2} />
              }, {
                path: "profile",
                element: <Seller_Dashboard url_tab={3} />
              }, {
                path: "*",
                element: <Seller_Dashboard url_tab={0} />
              },
            ]
          },
          { path: ":id", element: <Seller /> }, // seller profile
        ],
      },

      // User routes
      {
        path: "user",
        children: [
          { path: "login", element: <Login type="user" /> },
          { path: "signup", element: <User_Signup /> },
          { path: "forgot", element: <Forgot_Password type="user" /> },
          {
            path: "dashboard", children: [
              { index: true, element: <User_Dashboard url_tab={0} /> },
              {
                path: "orders",
                element: <User_Dashboard url_tab={0} />
              }, {
                path: "cart",
                element: <User_Dashboard url_tab={1} />
              }, {
                path: "wishlist",
                element: <User_Dashboard url_tab={2} />
              }, {
                path: "profile",
                element: <User_Dashboard url_tab={3} />
              }, {
                path: "*",
                element: <User_Dashboard url_tab={0} />
              },
            ]
          },
        ],
      },
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

