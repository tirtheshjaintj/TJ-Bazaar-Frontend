import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axiosInstanceSeller from '../../config/axiosConfigSeller'; // Import axiosInstanceSeller
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import toast from 'react-hot-toast';
import { FaPlusCircle } from 'react-icons/fa';
interface Category {
  _id: string;
  name: string;
}
const NewProduct: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateImage = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  };

  useEffect(() => {
    document.title = `TJ Bazaar🛒 Seller New Product`;
    // Fetch categories from the backend
    axiosInstanceSeller.get(`/product/get/categories`)
      .then(response => setCategories(response.data.categories))
      .catch(error => {
        toast.error('Error fetching categories: ' + error.message);
        console.log(error);
      });
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 10) {
      toast.error('You can only upload up to 10 images');
      return;
    }

    const validImages = files.filter(file => validateImage(file));
    if (validImages.length !== files.length) {
      toast.error('Some files are not valid images');
    }

    setImages(prevImages => [...prevImages, ...validImages]);
    const previews = validImages.map(file => URL.createObjectURL(file));
    setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);

    // Clear the file input
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Start submission, set isSubmitting to true
    setIsSubmitting(true);

    // Validate form data
    if (!name || !description || !price || !quantity || !tags.length || !categoryId) {
      toast.error('All fields are required');
      setIsSubmitting(false);  // Reset isSubmitting on error
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 10 || Number(price) >= 100000) {
      toast.error('Price must be a positive number between 10 and 1 lakh');
      setIsSubmitting(false);  // Reset isSubmitting on error
      return;
    }

    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error('Quantity must be a positive number');
      setIsSubmitting(false);  // Reset isSubmitting on error
      return;
    }

    if (images.length < 5) {
      toast.error('You must have at least 5 images.');
      setIsSubmitting(false);  // Reset isSubmitting on error
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('tags', JSON.stringify(tags));
    formData.append('category_id', categoryId);

    images.forEach((image) => {
      formData.append('images', image);  // Ensure 'images' matches the backend expectation
    });

    try {
      await axiosInstanceSeller.post(`/product/create`, formData);
      toast.success('Product created successfully');
      // Reset the form
      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setTags([]);
      setCategoryId('');
      setImages([]);
      setImagePreviews([]);
    } catch (error: any) {
      console.log(error);
      toast.error('Error creating product: ' + error.response.data.message);
    } finally {
      setIsSubmitting(false);  // Reset isSubmitting after submission
    }
  };
  
  return (
    <div className="w-full p-4 min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col w-full  placeholder-slate-200">
        <div>
          <label className="block text-sm font-medium ">Title</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full   placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder='Add Title Here'
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium ">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full  placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder='Add Description Here'
            rows={8}
            required
          />
        </div>
        <div className='flex flex-col md:flex-row gap-5'>
          <div>
            <label className="block text-sm font-medium ">Price</label>
            <input
              type="number"
              value={price}
              min={10}
              max={100000}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full  placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder='Add Price'
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium ">Quantity</label>
            <input
              type="number"
              value={quantity}
              min={0}
              placeholder='Add Quantity'
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full  placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className='flex-grow'>
            <label className="block text-sm font-medium ">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full  placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium ">Tags</label>
          <TagsInput
            value={tags}
            onChange={(newTags: any) => {
              // Convert all tags to lowercase and remove duplicates
              const uniqueLowercaseTags: string[] = Array.from(new Set(newTags.map((tag: string) => tag.toLowerCase())));
              setTags(uniqueLowercaseTags);
            }}
            className="mt-1 block w-full  placeholder-slate-200 bg-white p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      
        <div>
          <label className="block text-sm font-medium ">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full  placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="mt-2 grid grid-cols-4 gap-10">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt="Preview" className="w-full h-40 object-contain rounded-md" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 p-1 text-lg bg-black/50 text-white rounded-full mr-1"
                  title="remove image"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className='flex justify-end'>
          <button
            type="submit"
            className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            disabled={isSubmitting}
          >
            {!isSubmitting ? (
              <div className='flex items-center'>Create Product&nbsp;<FaPlusCircle /></div>
            ) : (
              <div className="flex items-center justify-center">
                <div className='flex items-center'>Creating Product&nbsp;</div>
                <div className="spinner border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-6 w-6"></div>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewProduct;
