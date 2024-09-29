import { Card, Carousel, Dropdown } from "flowbite-react";
import { Link } from "react-router-dom";

export default function ProductCard({product}: any) {

  // const handleDeleteConfirm = () => {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: "You won't be able to revert this!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Yes, delete it!'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       onDelete(product._id);
  //       Swal.fire(
  //         'Deleted!',
  //         'Your product has been deleted.',
  //         'success'
  //       );
  //     }
  //   });
  // };

  return (
    <Card className="w-full shadow-lg rounded-3xl z-1 m-0 bg-transparent dark:bg-transparent relative hover:shadow-2xl">
      <div className="flex flex-col w-full h-full pt-2">
        {/* Dropdown at top-right corner */}
        <div className="absolute top-0 right-0 z-10 shadow-2xl rounded-full p-2">
          <Dropdown label={
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
              <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
          </svg>
          } inline={true} arrowIcon={false}>
           
          </Dropdown>
        </div>

        {/* Image/Carousel Section */}
        <div className="flex-grow h-[20em] backdrop-blur-3xl shadow-md rounded-xl">
          <Carousel slideInterval={3000} className="h-[20em] p-0 transition-all duration-700 ease-in-out">
            {product.media.map((image: string, index: number) => (
              <div key={index} className="relative w-full h-full">
                     <Link to={`../product/${product._id}`}>
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  loading="lazy"
                  onError={(e:any)=>{
                    e.target.src="/bazaar.gif"
                  }}
                  className="absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out"
                />
                </Link>
              </div>
            ))}
          </Carousel>
        </div>
        <Link to={`../product/${product._id}`}>
        {/* Text/Description Section */}
        <div className="pt-5 flex-grow">
          <h5 className="mb-2 text-2xl font-semibold  text-center">
            {product.name.slice(0, 50) + "..."}
          </h5>
          <div className="mt-4 flex justify-center items-center">
            <p className="mb-2 text-2xl font-semibold  text-center">
              ₹{product.price}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 justify-center text-white">
            {product.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-block bg-blue-600  text-xs px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        </Link>
      </div>
    </Card>
  );
}
