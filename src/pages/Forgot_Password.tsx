import React, { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig'; // Import the configured Axios instance
import { toast } from 'react-hot-toast';
import EyeToggleSvg from '../components/Eye'; // Import the EyeToggleSvg component
import { Link, useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import Navbar from "../components/user/Navbar";
import { useSelector } from 'react-redux';

interface Prop {
  type: 'user' | 'seller';
}

const Forgot_Password: React.FC<Prop> = ({ type }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const seller = useSelector((state: any) => state.user);

  // Resend OTP function
  const resendOtp = async () => {
    if (email) {
      try {
        setLoading(true); // Start loading
        await axiosInstance.post(`${type}/forgot-password`, { email });
        toast.success('OTP resent to your email!');
        setTimer(60); // Set timer for 60 seconds
        setResendDisabled(true); // Disable the button
      } catch (error) {
        toast.error('Failed to resend OTP. Please try again.');
      } finally {
        setLoading(false); // End loading
      }
    } else {
      toast.error('Please enter your email first.');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        setLoading(true); // Start loading
        const response = await axiosInstance.post(`/${type}/forgot-password`, { email, userType: type });
        console.log(response);
        toast.success('OTP sent to your email!');
        setResendDisabled(true); // Disable the resend button
        setStep(2); // Move to the next step
        setTimer(60); // Start the timer
      } catch (error: any) {
        console.log(error);
        toast.error('Failed to send OTP. Your account not available');
      } finally {
        setLoading(false); // End loading
      }
    }
  };

  const handleShowNewPasswordToggle = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleShowConfirmPasswordToggle = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      setLoading(true); // Start loading
      const response = await axiosInstance.post(`/${type}/change-password`, {
        email,
        otp,
        password: newPassword,
      });
      console.log(response.data);
      if (response.data.status) {
        toast.success('Password changed successfully!');
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        navigate(`../${type}/login`);
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setLoading(false); // End loading
    }
  };
  // Timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (resendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setResendDisabled(false); // Enable button
            clearInterval(interval!);
            return 60; // Reset timer for future use
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendDisabled]);

  useEffect(() => {
    document.title = `TJ Bazaar🛒: Change ${type.charAt(0).toUpperCase() + type.slice(1)} Password`;
    window.scrollTo(0, 0);
  }, []);


  useEffect(() => {
    if (type === "user" && user && user.email) {
      setEmail(user.email);
      // Check if email is not empty before submitting
      if (user.email) {
        handleEmailSubmit({ preventDefault: () => { } } as React.FormEvent);
      }
    }
  }, [user]);

  useEffect(() => {
    if (type === "seller" && seller && seller.email) {
      setEmail(seller.email);
      if (seller.email) {
        handleEmailSubmit({ preventDefault: () => { } } as React.FormEvent);
      }
    }
  }, [seller]);




  return (
    <>
      <Navbar />
      <section className="min-h-screen pb-8 md:pb-0">
        <div className="flex flex-col items-center justify-center h-screen px-6 py-8 mx-auto lg:py-0">
          <h1 className="flex items-center text-center mb-6 text-3xl font-semibold text-gray-900 dark:text-white">
            Change Password&nbsp;<FaLock />
          </h1>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              {step === 1 && (
                <form onSubmit={handleEmailSubmit} className="space-y-4 md:space-y-6">
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Your email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder='Enter your email address'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    disabled={loading} // Disable the button during loading
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner"></div>
                      </div>
                    ) : (
                      'Send OTP' // Default text when not loading
                    )}
                  </button>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handlePasswordChange} className="space-y-4 md:space-y-6">
                  <label htmlFor='otp'>OTP to Email: <span className='text-gray-500 dark:text-slate-300'>{email}</span></label>
                  <div>
                    <input
                      type="text"
                      id="otp"
                      placeholder='Enter your OTP here'
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      onClick={resendOtp}
                      disabled={resendDisabled || loading} // Disable the button during loading
                      className={`text-sm text-primary-600 ${resendDisabled || loading ? 'cursor-not-allowed' : ''}`}
                    >
                      Resend OTP
                    </button>
                    {resendDisabled && (
                      <span className="text-sm text-gray-500">Resend available in {timer}s</span>
                    )}
                  </div>
                  <div>
                    <label htmlFor="newPassword">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleShowNewPasswordToggle}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        <EyeToggleSvg handleShowPasswordToggle={handleShowNewPasswordToggle} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleShowConfirmPasswordToggle}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        <EyeToggleSvg handleShowPasswordToggle={handleShowConfirmPasswordToggle} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    disabled={loading} // Disable the button during loading
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner"></div>
                      </div>
                    ) : (
                      'Change Password' // Default text when not loading
                    )}
                  </button>
                </form>
              )}
              <div className="flex">
                <Link to={`/${type}/login`} className="w-full dark:text-white bg-gray-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"                  >
                  <span className='flex items-center justify-center text-white'>Back to Login&nbsp;<FaLock /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Forgot_Password;
