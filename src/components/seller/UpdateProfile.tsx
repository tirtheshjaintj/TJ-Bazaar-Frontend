import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axiosInstanceSeller from '../../config/axiosConfigSeller'; // Update this import
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addSeller } from '../../store/sellerSlice';
import { FaLock, FaPencilAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface Seller {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  gst_number: string;
}

interface Prop {
  seller_data: Seller;
}

interface Errors {
  name?: string;
  phone_number?: string;
  address?: string;
  gst_number?: string;
}

function UpdateProfile({ seller_data }: Prop) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    document.title = `TJ Bazaar🛒 Seller Update Profile`;
  }, []);

  const [seller, setSeller] = useState<Seller>({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    gst_number: '',
  });

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (seller_data) {
      setSeller(seller_data);
    }
  }, [seller_data]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeller((prevSeller) => ({
      ...prevSeller,
      [name]: value,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (seller.name && !/^[a-zA-Z\s]+$/.test(seller.name)) {
      newErrors.name = 'Name must contain only letters and spaces.';
    }
    if (seller.phone_number && !/^[0-9]{10}$/.test(seller.phone_number)) {
      newErrors.phone_number = 'Phone number must contain exactly 10 digits.';
    }
    if (seller.address && seller.address.length < 10) {
      newErrors.address = 'Address must be at least 10 characters long.';
    }
    if (seller.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(seller.gst_number)) {
      newErrors.gst_number = 'Invalid GST number format.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await axiosInstanceSeller.put('/seller/update', seller);
      if (response.data.status) {
        toast.success('Profile updated successfully!');
        if (response.data.seller) {
          dispatch(addSeller(seller));
        }
      }
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.response?.data?.message || 'Unknown error'}`);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full p-4 min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col w-full">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={seller.name}
            onChange={handleChange}
            className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your name"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={seller.phone_number}
            onChange={handleChange}
            className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your phone number"
          />
          {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            name="address"
            value={seller.address}
            onChange={handleChange}
            className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your address"
            rows={6}
          />
          {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">GST Number</label>
          <input
            type="text"
            name="gst_number"
            value={seller.gst_number}
            onChange={handleChange}
            className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your GST number"
          />
          {errors.gst_number && <p className="text-red-600 text-sm mt-1">{errors.gst_number}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            disabled={isSubmitting}
          >
            {!isSubmitting ? (
              <div className='flex items-center'>Update Profile&nbsp;<FaPencilAlt/></div>
            ) : (
              <div className="flex items-center justify-center">
                <div className='flex items-center'>Updating Profile&nbsp;</div><div className="spinner border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-6 w-6"></div>
              </div>
            )}
          </button>
        </div>
      </form>
      <br />
      <Link to={"../seller/forgot"} className="flex">
          <button
            type="submit"
            className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
          <span className="flex items-center justify-center">Change Password&nbsp;<FaLock/></span>
          </button>
        </Link>
    </div>
  );
}

export default UpdateProfile;
