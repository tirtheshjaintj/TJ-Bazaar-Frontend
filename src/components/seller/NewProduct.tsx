import { useState, useEffect, ChangeEvent, FormEvent, useCallback, useMemo } from 'react';
import axiosInstanceSeller from '../../config/axiosConfigSeller';
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
  const [quantity, setQuantity] = useState<number>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'TJ Bazaar 🛒: Seller New Product';
    const fetchCategories = async () => {
      try {
        const response = await axiosInstanceSeller.get('/product/get/categories');
        setCategories(response.data.categories);
      } catch (error: any) {
        toast.error('Error fetching categories: ' + error.message);
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    
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
  }, [images]);

  const validateImage = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  };

  const imagePreviews = useMemo(
    () => images.map(image => URL.createObjectURL(image)),
    [images]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const removeImage = useCallback((index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!name || !description || !price || quantity < 0 || !tags.length || !categoryId) {
      setErrorMessage('All fields are required');
      setIsSubmitting(false);
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 10 || numericPrice >= 100000) {
      setErrorMessage('Price must be a positive number between 10 and 1 lakh');
      setIsSubmitting(false);
      return;
    }

    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0) {
      setErrorMessage('Quantity must be a positive number');
      setIsSubmitting(false);
      return;
    }

    if (images.length < 5) {
      setErrorMessage('You must have at least 5 images.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity.toString());
    formData.append('tags', JSON.stringify(tags));
    formData.append('category_id', categoryId);
    images.forEach(image => formData.append('images', image));

    try {
      await axiosInstanceSeller.post('/product/create', formData);
      toast.success('Product created successfully');
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error('Error creating product: ' + error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, price, quantity, tags, categoryId, images]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setQuantity(1);
    setTags([]);
    setCategoryId('');
    setImages([]);
    setErrorMessage(null);
  };

  return (
    <div className="w-full min-h-screen p-4">
      <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-4 placeholder-slate-200">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm placeholder-slate-200 dark:bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Add Title Here"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm placeholder-slate-200 dark:bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Add Description Here"
            rows={8}
            required
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input
              type="number"
              value={price}
              min={10}
              max={100000}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm placeholder-slate-200 dark:bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Add Price"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              value={quantity}
              min={0}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm placeholder-slate-200 dark:bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Add Quantity"
              required
            />
          </div>
          <div className="flex-grow">
            <label className="block text-sm font-medium">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm placeholder-slate-200 dark:bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          <label className="block text-sm font-medium">Tags</label>
          <TagsInput
            value={tags}
            onChange={(newTags: string[]) => {
              const uniqueTags = Array.from(new Set(newTags.map(tag => tag.toLowerCase())));
              setTags(uniqueTags);
            }}
            className="block w-full p-2 mt-1 bg-white border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Images</label>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm placeholder-slate-200 dark:bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />

          <div className="grid grid-cols-4 gap-10 mt-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt="Preview" className="object-contain w-full h-40 rounded-md" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 p-1 mr-1 text-lg text-white rounded-full bg-black/50"
                  title="Remove image"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <span className="flex items-center">Creating Product&nbsp;</span>
                <div className="w-6 h-6 border-4 border-white border-solid rounded-full spinner border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <div className="flex items-center">Create Product&nbsp;<FaPlusCircle /></div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewProduct;
