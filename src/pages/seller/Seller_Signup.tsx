import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Cookie from 'universal-cookie';
import EyeToggleSVG from '../../components/Eye';
import axiosInstanceSeller from '../../config/axiosConfigSeller'; // Adjust the path if necessary
type event = React.ChangeEvent<HTMLInputElement>;

function User_Signup() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [seller, setUser] = useState({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        gst_number: '',
        password: '',
        confirmPassword: '',
    });

    const [otp, setOtp] = useState('');
    const [sellerId, setUserId] = useState('');
    const navigate = useNavigate();
    const cookie = new Cookie();
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timer, setTimer] = useState<number>(60); // 60 seconds timer
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'TJ Bazaar🛒 User Signup ';
        let token = cookie.get('seller_token');
        if (token) navigate('/seller/dashboard');
    }, []);

    const handleShowPasswordToggle = () => {
        setShowPassword(!showPassword);
    };

    const handleShowConfirmPasswordToggle = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleChange = (e: event) => {
        setUser({ ...seller, [e.target.name]: e.target.value });
    };
    const handleChangeAddress = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUser({ ...seller, [e.target.name]: e.target.value });
    }
    const handleBack = () => {
        setStep(step - 1);
    }

    const handleNext = () => {
        // Validation for step 1
        if (step === 1) {
            if (!seller.name.match(/^[a-zA-Z\s]+$/)) {
                toast.error('Name must contain only letters and spaces.');
            } else if (seller.name.length < 3) {
                toast.error('Name must be at least 3 characters long.');
            } else if (!seller.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
                toast.error('Please enter a valid email address.');
            } else if (!seller.phone_number.match(/^[0-9]{10}$/)) {
                toast.error('Phone number must contain exactly 10 digits.');
            } else {
                setStep(step + 1);
            }
        }

        // Validation for step 2
        else if (step === 2) {
            if (seller.address.length < 10) {
                toast.error('Address must be at least 10 characters long.');
            } else if (
                !seller.gst_number.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
            ) {
                toast.error('Invalid GST number format.');
            } else {
                setStep(step + 1);
            }
        }

        // Validation for step 3
        else if (step === 3) {
            if (seller.password.length < 8) {
                toast.error('Password must be at least 8 characters long.');
            } else if (seller.password !== seller.confirmPassword) {
                toast.error('Passwords do not match.');
            } else {
                setStep(step + 1);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (seller.password !== seller.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        setLoading(true); // Disable the button
        try {
            const response = await axiosInstanceSeller.post('/seller/signup', {
                name: seller.name,
                email: seller.email,
                phone_number: seller.phone_number,
                address: seller.address,
                gst_number: seller.gst_number,
                password: seller.password,
            });

            if (response.data.status) {
                setUserId(response.data.seller._id);
                setStep(4); // Move to OTP verification step
                toast.success(response.data.message);
            }
        } catch (error: any) {
            const error_msg = error.response.data.message;
            toast.error(error_msg);
        } finally {
            setLoading(false); // Re-enable the button
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true); // Disable the button
        try {
            const response = await axiosInstanceSeller.post(`/seller/verify-otp/${sellerId}`, {
                otp,
            });

            if (response.data.status) {
                toast.success(response.data.message);
                const token = response?.data?.token;
                if (token) {
                    cookie.set("seller_token", token, { path: '/', expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
                    navigate('/seller/dashboard');
                }
            }
        } catch (error: any) {
            const error_msg = error.response.data.message;
            toast.error(error_msg);
        } finally {
            setLoading(false); // Re-enable the button
        }
    };

    const handleResendOtp = async () => {
        try {
            const response = await axiosInstanceSeller.post(`/seller/resend-otp/${sellerId}`);
            if (response.data.status) {
                toast.success(response.data.message);
                setResendDisabled(true); // Disable button
                setTimer(60); // Reset timer
            }
        } catch (error: any) {
            const error_msg = error.response.data.message;
            toast.error(error_msg);
        }
    };

    useEffect(() => {
        let interval: any;
        if (resendDisabled) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        setResendDisabled(false); // Enable button
                        clearInterval(interval);
                        return 60; // Reset timer for future use
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [resendDisabled]);


    return (
        <section className="min-h-screen pb-8 md:pb-0">
            <div className="flex flex-col items-center justify-center h-screen px-6 py-8 mx-auto lg:py-0">
                <h1 className="flex items-center mb-6 text-4xl font-semibold text-gray-900 dark:text-white">
                    TJ Bazaar🛒 Seller
                </h1>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">

                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            {step < 4 ? 'Sign up to your account' : 'Verify OTP'}
                        </h1>

                        <form onSubmit={step === 3 ? handleSubmit : handleOtpSubmit} className="space-y-4 md:space-y-6" action="#">
                            {step === 1 && (
                                <>
                                    <div>
                                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={seller.name}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Your email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={seller.email}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="name@company.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone_number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            name="phone_number"
                                            id="phone_number"
                                            value={seller.phone_number}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="1234567890"
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <div>
                                        <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            id="address"
                                            value={seller.address}
                                            onChange={handleChangeAddress}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="123 Main St"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="gst_number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            GST Number
                                        </label>
                                        <input
                                            type="text"
                                            name="gst_number"
                                            id="gst_number"
                                            value={seller.gst_number}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="22AAAAA0000A1Z5"
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <div>
                                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                id="password"
                                                value={seller.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                required
                                            />
                                            <span
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                            >
                                                <EyeToggleSVG handleShowPasswordToggle={handleShowPasswordToggle} />
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                value={seller.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                required
                                            />
                                            <span
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                            >
                                                <EyeToggleSVG handleShowPasswordToggle={handleShowConfirmPasswordToggle} />
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                            {step === 4 && (
                                <>
                                    <div>
                                        <label htmlFor="otp" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Enter OTP
                                        </label>
                                        <input
                                            type="number"
                                            name="otp"
                                            id="otp"
                                            value={otp}
                                            min="100000"
                                            max="999999"
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="123456"
                                            required
                                        />
                                    </div>
                                    <div className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500 cursor-pointer">
                                        {resendDisabled ? (
                                            <p>Resend OTP in {timer} seconds</p>
                                        ) : (
                                            <p onClick={handleResendOtp}>Resend OTP</p>
                                        )}
                                    </div>

                                </>
                            )}

                            {step < 4 && (
                                <button
                                    type={step === 3 ? 'submit' : 'button'}
                                    className="w-full dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    onClick={step < 3 ? handleNext : undefined}
                                    disabled={loading} // Disable the button
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="spinner"></div>
                                        </div>
                                    ) : (
                                        <span>{step === 3 ? 'Sign up' : 'Next'}</span>
                                    )}
                                </button>
                            )}
                            {step < 4 && step > 1 && (
                                <button
                                    type='button'
                                    className="w-full  bg-gray-400/60 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    onClick={handleBack}
                                >
                                    Back
                                </button>
                            )}
                            {step === 4 &&
                                <p className="text-xs">
                                    OTP sent to {seller.email}
                                </p>
                            }
                            {step === 4 && (
                                <button
                                    type="submit"
                                    className="w-full dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    disabled={loading} // Disable the button
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="spinner"></div>
                                        </div>
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </button>
                            )}

                            <p className="text-sm  text-gray-500 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link to="/seller/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                                    Login here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default User_Signup;
