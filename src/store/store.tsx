import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import sellerReducer from "./sellerSlice";

export const store=configureStore({
    reducer:{
        user:userReducer,
        seller:sellerReducer
    }
})
