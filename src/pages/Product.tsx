import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

function Product() {
  const {id}=useParams();
  const navigate=useNavigate();
  useEffect(()=>{
  if(!id || id.trim()==""){
     navigate("../");
  }else{
    
  }
  },[]);

  return (
    <div>Product {id}</div>
  )
}

export default Product;