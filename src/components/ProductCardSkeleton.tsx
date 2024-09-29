export function ProductCardSkeleton() {
    return (
      <div className="w-full shadow-lg rounded-3xl bg-transparent dark:bg-transparent relative">
        <div className="flex flex-col w-full h-full pt-2 animate-pulse">
          {/* Dropdown Placeholder */}
          <div className="absolute top-0 right-0 z-10 shadow-2xl rounded-full p-2">
            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
          </div>
  
          {/* Image/Carousel Placeholder */}
          <div className="flex-grow h-[20em] backdrop-blur-3xl shadow-md rounded-xl bg-gray-300"></div>
  
          {/* Text/Description Section Placeholder */}
          <div className="pt-5 flex-grow">
            <div className="mb-2 h-6 w-3/4 bg-gray-300 rounded mx-auto"></div>
            <div className="h-4 w-2/3 bg-gray-300 rounded mx-auto"></div>
  
            <div className="mt-4 flex justify-between items-center">
              <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
              <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
            </div>
  
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {Array(3).fill(0).map((_, index) => (
                <div
                  key={index}
                  className="inline-block h-6 w-12 bg-gray-300 rounded-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  