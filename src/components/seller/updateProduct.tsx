import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axiosInstanceSeller from '../../config/axiosConfigSeller'; // Update this import
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FaPencilAlt } from 'react-icons/fa';

interface Category {
  _id: string;
  name: string;
}

const UpdateProduct: React.FC<{ product: any }> = ({ product }) => {
  const [name, setName] = useState<string>(product.name || '');
  const [description, setDescription] = useState<string>(product.description || '');
  const [price, setPrice] = useState<string>(product.price || '');
  const [quantity, setQuantity] = useState<string>(product.quantity || '');
  const [tags, setTags] = useState<string[]>(product.tags || []);
  const [categoryId, setCategoryId] = useState<string>(product.category_id || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedImages, setSavedImages] = useState<string[]>(product.media || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    document.title = `Update Product - ${name}`;
    axiosInstanceSeller.get('/product/get/categories')
      .then(response => setCategories(response.data.categories))
      .catch(error => {
        toast.error('Error fetching categories: ' + error.message);
        console.log(error);
      });
  }, [name]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + savedImages.length + newImages.length > 10) {
      toast.error('You can only upload up to 10 images in total.');
      return;
    }

    const validImages = files.filter(file => validateImage(file));
    if (validImages.length !== files.length) {
      toast.error('Some files are not valid images.');
    }

    setNewImages(prevImages => [...prevImages, ...validImages]);
    const previews = validImages.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prevPreviews => [...prevPreviews, ...previews]);

    event.target.value = '';
  };

  const validateImage = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  };

  const removeSavedImage = async (index: number) => {
    const imageUrl = savedImages[index];

    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmed.isConfirmed) {
      try {
        await axiosInstanceSeller.delete(`/product/removeimg/${product._id}`, {
          data: {
            product_id: product._id,
            imageUrl: imageUrl
          }
        });
        setSavedImages(prevImages => prevImages.filter((_, i) => i !== index));
        toast.success('Image removed successfully.');
      } catch (error: any) {
        toast.error('Error removing image: ' + error.response.data.message);
      }
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
    setNewImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const totalImages = savedImages.length + newImages.length;

    if (totalImages < 5) {
      toast.error('You must have at least 5 images.');
      setIsSubmitting(false);  // Reset isSubmitting on error
      return;
    }
    if (!name || !description || !price || !quantity || !tags.length || !categoryId) {
      toast.error('All fields are required.');
      setIsSubmitting(false);  // Reset isSubmitting on error
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 10 || Number(price) >= 100000) {
      toast.error('Price must be a positive number between 10 and 100000.');
      setIsSubmitting(false);  // Reset isSubmitting on error
      return;
    }

    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error('Quantity must be a positive number.');
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

    newImages.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axiosInstanceSeller.put(`/product/update/${product._id}`, formData);
      if (response.status) {
        toast.success('Product updated successfully.');
        setIsSubmitting(false);  // Reset isSubmitting on error
      }
    } catch (error: any) {
      toast.error('Error updating product: ' + error.response.data.message);
      setIsSubmitting(false);  // Reset isSubmitting on error
    }
  };

  return (
    <div className="w-full p-4 min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col w-full placeholder-slate-200">
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Add Product Name Here"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Add Description Here"
            rows={8}
            required
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input
              type="number"
              value={price}
              min={10}
              max={100000}
              onChange={e => setPrice(e.target.value)}
              className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              onChange={e => setQuantity(e.target.value)}
              className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Add Quantity"
              required
            />
          </div>

          <div className="flex-grow">
            <label className="block text-sm font-medium">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Tags</label>
          <TagsInput
            value={tags}
            onChange={(newTags: any) => {
              const uniqueLowercaseTags: string[] = Array.from(new Set(newTags.map((tag: string) => tag.toLowerCase())));
              setTags(uniqueLowercaseTags);
            }}
            className="mt-1 block w-full placeholder-slate-200 bg-white p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full placeholder-slate-200 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-10">
            {savedImages.map((image, index) => (
              <div key={index} className="relative">
                <img src={image} alt={`Saved Preview ${index}`} className="w-full h-40 object-contain rounded-md" />
                <button
                  type="button"
                  onClick={() => removeSavedImage(index)}
                  className="absolute top-0 right-0 p-1 text-lg bg-black/50 text-white rounded-full mr-1"
                  title="Remove image"
                >
                  X
                </button>
              </div>
            ))}
            
            {newImagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt={`New Preview ${index}`} className="w-full h-40 object-contain rounded-md" />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-0 right-0 p-1 text-lg bg-black/50 text-white rounded-full mr-1"
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
            className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            disabled={isSubmitting}
          >
            {!isSubmitting ? (
              <div className='flex items-center'>Update Product&nbsp;<FaPencilAlt/></div>
            ) : (
              <div className="flex items-center justify-center">
                <div className='flex items-center'>Updating Product&nbsp;</div><div className="spinner border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-6 w-6"></div>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
