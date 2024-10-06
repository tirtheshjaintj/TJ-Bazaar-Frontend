import { useEffect } from 'react';
import { FaAdjust } from 'react-icons/fa';

export default function ModeBall() {
  // Function to toggle mode and save the preference to localStorage
  const mode = () => {
    const htmlElement = document.documentElement;
    
    if (htmlElement.classList.contains('dark')) {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Save 'light' theme preference
    } else {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Save 'dark' theme preference
    }
  };

  // Check localStorage for theme preference on load and apply it
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // If no saved theme, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []); // Empty dependency array to run only once on component mount

  return (
    <div
      onClick={mode}
      className="float modeball text-[20px] flex items-center justify-center z-10 cursor-pointer"
    >
      <FaAdjust />
    </div>
  );
}
