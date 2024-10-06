import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { AiFillHeart, AiOutlinePlus, AiOutlineMinus, AiOutlineShoppingCart } from 'react-icons/ai';
import { Carousel } from 'flowbite-react';
import Navbar from "../components/user/Navbar";
import Modal from 'react-modal';
import { FaBagShopping } from 'react-icons/fa6';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight, FaBoxOpen, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import AverageRating from '../components/AverageRating';
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_API_KEY;

interface Category {
  name: string;
}


interface Seller {
  name: string;
  _id: string;
}

interface ProductData {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  tags: string[];
  media: string[];
  category_id: Category;
  seller_id: Seller;
}

// Set up Modal accessibility
Modal.setAppElement('#root');

const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [inCart, setInCart] = useState<boolean>(false);
  const user = useSelector((state: any) => state.user);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  // Ref for the media preview strip
  const previewRef = useRef<HTMLDivElement>(null);


  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/review/${id}`);
      //console.log(response.data);
      if (response.data.status) {
      setReviews(response.data.data);
      }
    } catch (error) {
      //console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (reviews.length > 0) {
      //console.log(reviews);
      const total = reviews.reduce((acc, review:any) => acc + review.rating, 0);
      const average = total / reviews.length;
      //console.log(average);
      setAverageRating(average);
    }
  }, [reviews]);
  

  const addToWishlist=async()=>{
    if(!inWishlist && user && product){
       try {
          const response=await axiosInstance.post("/wishlist/add",{
            product_id:product?._id
          });
          if(response.data.status){
          setInWishlist(true);
          toast.success(response.data.message);
          }
       } catch (error:any) {
        const error_msg=error.data?.message || "Server Error";
        toast.error(error_msg);
       }
    }else if(!user){
        navigate("../user/login");
    }
  }

  const removeFromWishlist=async()=>{
    if(inWishlist && user && product){
       try {
          const response=await axiosInstance.delete(`/wishlist/remove/${product?._id}`);
          if(response.data.status){
          setInWishlist(false);
          toast.success(response.data.message);
          }
       } catch (error:any) {
        const error_msg=error.data?.message || "Server Error";
        //console.log(error);
        toast.error(error_msg);
       }
    }else if(!user){
        navigate("../user/login");
    }
  }

  const checkInWishList=async()=>{
    if(!inWishlist && user && product){
       try {
          const response=await axiosInstance.get(`/wishlist/check/${product?._id}`);
          if(response.data.status){
          setInWishlist(true);
          toast.success(response.data.message);
          }
       } catch (error:any) {
        setInWishlist(false);
       }
    }
  }

  

  const getProduct = async () => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      ////console.log(error);
      setError(true);
      toast.error("Product Not Found");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (user) {
      try {
        if (!inCart) {
          const response = await axiosInstance.post(`/cart/add`, {
            product_id: id,
            quantity
          });

          if (response.data.status) {
            setInCart(true);
            toast.success("Product added in your Cart");
          }
        } else {
          navigate("../user/dashboard");
        }

      } catch (error) {
        ////console.log("error: ", error);
        toast.error("Cannot add Product to Cart");
      }
    } else {
      navigate("../user/login");
    }
  };

  const buyNow = async () => {
    if (user) {
      try {
        const instance = async () => {
          try {
            const response = await axiosInstance.post(`/order/create_order`, {
              product_id: id,
              quantity,
            });
            return response.data.paymentInit;
          } catch (error) {
            ////console.log("error: ", error);
          }
        };

        const order = await instance();
        const key = RAZORPAY_KEY;
        const options = {
          key,
          amount: Math.ceil(order.amount / 100),
          currency: "INR",
          name: "TJ Bazaar",
          description: "RazorPay",
          order_id: order.id,
          notes: {
            address: "Razorpay Corporate Office",
          },
          theme: {
            color: "#121212",
          },
          handler: async (response: any) => {
            // Handle the payment success on the client side
            try {
              const verifyResponse = await axiosInstance.post(`/order/verify_order`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyResponse.data.status) {
                toast.success("Payment Successful! Thanks for the Purchase");
                navigate(`../user/dashboard`);
              } else {
                toast.error("Payment verification failed.");
              }
            } catch (error) {
              toast.error("Error during payment verification.");
            }
          },
          prefill: {
            email: user.email,
            contact: user.phone,
          },
        };
        const razor = new (window as any).Razorpay(options);
        razor.open();

      } catch (error) {
        toast.error("Sorry, cannot process the order right now.");
      }
    } else {
      navigate("../user/login");
    }
  };

  const checkInCart = async () => {
    if (user) {
      try {
        const response = await axiosInstance.get(`/cart/check_cart/${product?._id}`);
        ////console.log(response);
        if (response.data.status) {
          setInCart(true);
          toast.success("Product already in your Cart");
        }
      } catch (error) {
        ////console.log(error);
      }
    }
  }



  useEffect(() => {
    if (!id || id.trim() === "") {
      navigate("../");
    } else {
      getProduct();
    }
  }, [id, navigate]);

  useEffect(() => {
    if (product) {
      checkInCart();
      checkInWishList();
      fetchReviews();
    }
  }, [product]);


  const scrollPreview = (direction: 'left' | 'right') => {
    if (previewRef.current) {
      const scrollAmount = direction === 'left' ? -100 : 100; // Adjust scroll amount as needed
      previewRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : product!.media.length - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev < product!.media?.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (modalOpen) {
      if (event.key === "ArrowLeft") {
        goToPreviousImage();
      } else if (event.key === "ArrowRight") {
        goToNextImage();
      }
    }
  };

  useEffect(() => {
    if (modalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-full md:w-1/2 animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-md"></div>
            <div className="h-4 bg-gray-200 rounded-md"></div>
            <div className="h-4 bg-gray-200 rounded-md"></div>
            <div className="h-4 bg-gray-200 rounded-md"></div>
            <div className="flex space-x-2">
              <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
              <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
              <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen text-center">
          <AiFillHeart className="text-red-500 w-16 h-16 animate-bounce" />
          <h2 className="text-2xl font-bold">Product Not Found</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-4 pt-24 md:p-0 md:pt-0 min-w-screen">
        <div className="flex flex-col md:flex-row items-center min-h-screen w-full">
          <div className="md:w-1/2">
            <div className="flex-grow h-full backdrop-blur-3xl rounded-xl">
              <div className="absolute top-14 right-2 text-red-500 rounded-full bg-gray-50/20 h-12 w-12 flex justify-center items-center text-3xl cursor-pointer z-10"
              onClick={(inWishlist)?removeFromWishlist:addToWishlist}
              >
               {(inWishlist)?<FaHeart/>:<FaRegHeart/>}
              </div>
              <Carousel slideInterval={3000} className="h-[30em] p-0 transition-all duration-700 ease-in-out">
                {product?.media.map((image, index) => (
                  <div key={index} className="relative w-full h-full">
                    <Link to={`../product/${product?._id}`}>
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        loading="lazy"
                        onError={(e: any) => {
                          e.target.src = "/bazaar.gif";
                        }}
                        className="absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out cursor-pointer"
                        onClick={() => openModal(index)} // Open modal with the index
                      />
                    </Link>
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Media Preview Strip with Scroll Buttons */}
            <div className="flex items-center mt-2">
              <button onClick={() => scrollPreview('left')} className="p-2 bg-gray-300 rounded-l-md hover:bg-gray-400">
                <FaArrowAltCircleLeft className='text-black' />
              </button>
              <div ref={previewRef} className="flex overflow-hidden space-x-2 scrollbar-hide snap-x snap-mandatory">
                {product?.media.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-24 h-24 object-contain cursor-pointer rounded-md"
                    onClick={() => openModal(index)} // Open modal with the index
                    onError={(e: any) => {
                      e.target.src = "/bazaar.gif";
                    }}
                  />
                ))}
              </div>
              <button onClick={() => scrollPreview('right')} className="p-2 bg-gray-300 rounded-r-md hover:bg-gray-400">
                <FaArrowAltCircleRight className='text-black' />
              </button>
            </div>

            {/* Image Modal */}
            <Modal
              isOpen={modalOpen}
              onRequestClose={closeModal}
              className="flex justify-center items-center"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
              contentLabel="Image Preview"
            >
              <button onClick={goToPreviousImage} className="absolute left-4 text-white text-3xl">
                <FaArrowAltCircleLeft />
              </button>
              {product?.media[selectedImageIndex] && (
                <img
                  src={product?.media[selectedImageIndex]}
                  alt="Selected"
                  className="max-w-screen min-w-screen min-h-max md:min-h-[90vh] object-contain"
                />
              )}
              <button onClick={goToNextImage} className="absolute right-4 text-white text-3xl">
                <FaArrowAltCircleRight />
              </button>
            </Modal>
          </div>

          <div className="md:w-1/2 md:pl-4 mt-4 pt-10 md:pt-20 md:mt-0 flex flex-col justify-start h-full min-h-screen">
            <h1 className="text-3xl font-bold">{product?.name}</h1>

            {/* Tags Display */}
            <div className="mt-4 text-white">
              <div className="flex flex-wrap">
                {product?.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-blue-600  text-xs px-3 py-1 m-1 rounded-full ">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <AverageRating averageRating={averageRating} totalReviews={reviews.length}/>
            <div className="flex justify-between items-center mt-4">
              <div className="flex justify-between items-center mt-4">
                <span className="text-4xl font-semibold">₹{product?.price}</span>

              </div>

              {/* Quantity Selector */}
              {!(product?.quantity === 0) && <div className="flex items-center justify-center mt-4 border-gray-500/50 rounded-lg border-2 w-min">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="p-2 border-r-2 border-gray-500/50"
                  disabled={quantity === 1} // Disable button when quantity is 1
                >
                  <AiOutlineMinus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-10 text-center m-0  p-0 bg-transparent border-none"
                />
                <button
                  onClick={() => setQuantity((prev) => Math.min(product!.quantity, prev + 1))}
                  className="p-2 border-l-2 border-gray-500/50"
                  disabled={quantity === product?.quantity} // Disable button when quantity is at the max
                >
                  <AiOutlinePlus />
                </button>
              </div>}
            </div>

            {product?.quantity === 0 && (
              <span className="flex items-center text-red-600 text-3xl font-bold ml-4">Out of Stock&nbsp;<FaBoxOpen /></span>
            )}

            <div className="mt-4 flex space-x-2 text-xl text-center w-full md:pt-10">
              <button className="flex items-center py-4  justify-center w-full  bg-blue-600 text-white px-4  rounded hover:bg-blue-700 transition"
                disabled={(product?.quantity === 0)}
                onClick={addToCart}
              >
                {(inCart) ? <Link to={"../user/dashboard"}>Go To Cart</Link> : <span>Add Cart</span>} <AiOutlineShoppingCart className="ml-2" />
              </button>
              <button
                className="flex items-center w-full justify-center  bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                disabled={product?.quantity === 0}
                onClick={buyNow}
              >
                Buy Now <FaBagShopping className="ml-2" />
              </button>
            </div>

            {/* Seller and Category Details */}
            <div className="mt-4 pt-10">
              <h3 className="text-lg font-semibold">Category: {product?.category_id.name}</h3>
              <h3 className="text-lg font-semibold">Seller: {product?.seller_id.name}</h3>
            </div>

            {/* Description */}
            <p className="text-md mt-2 pt-5">
              <span className='font-semibold'>Description:</span><br />
              {showMore ? product?.description : `${product?.description.substring(0, 200)}...`}
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-blue-500 hover:underline ml-2"
              >
                {showMore ? 'Show Less' : 'Show More'}
              </button>
            </p>
          </div>
        </div>
       {user && <ReviewForm productId={product?._id || ""} fetchReviews={fetchReviews} />}
       <ReviewList reviews={reviews}/>
      </div>
    </>
  );
}

export default Product;
