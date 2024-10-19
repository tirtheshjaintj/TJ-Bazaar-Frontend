import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axiosInstance from '../../config/axiosConfig'; // Update this import as needed
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addUser } from '../../store/userSlice'; // Update with your actual action
import { FaLock, FaPencilAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  phone_number: string;
  address: string;
}

interface Prop {
  user_data: User;
}

interface Errors {
  name?: string;
  phone_number?: string;
  address?: string;
}

function UpdateProfile({ user_data }: Prop) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    document.title = `Your App - User Update Profile`;
  }, []);

  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    phone_number: '',
    address: '',
  });

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (user_data) {
      setUser(user_data);
    }
  }, [user_data]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (user.name && !/^[a-zA-Z\s]+$/.test(user.name)) {
      newErrors.name = 'Name must contain only letters and spaces.';
    }
    if (user.phone_number && !/^[0-9]{10}$/.test(user.phone_number)) {
      newErrors.phone_number = 'Phone number must contain exactly 10 digits.';
    }
    if (user.address && user.address.length < 10) {
      newErrors.address = 'Address must be at least 10 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.put('/user/update', user);
      if (response.data.status) {
        toast.success('Profile updated successfully!');
        if (response.data.user) {
          dispatch(addUser(user)); // Update the user in the store
        }
      }
    } catch (error: any) {
        console.log(error);
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
            value={user.name}
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
            value={user.phone_number}
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
            value={user.address}
            onChange={handleChange}
            className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your address"
            rows={6}
          />
          {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
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
      <Link to={"../user/forgot"} className="flex">
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
