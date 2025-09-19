import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FaHistory,
  FaPaperPlane,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaImage,
  FaTimes,
} from 'react-icons/fa';
import axiosInstance from '../config/axiosConfig';

type Message = {
  sender: 'AI' | 'You';
  text: string;
  image?: string; // optional image URL
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages
      ? (JSON.parse(savedMessages) as Message[])
      : [{ sender: 'AI', text: 'Hi, how can I help you today?' }];
  });
  const [loading, setLoading] = useState(false);

  // Voice-to-text state
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Text-to-speech state
  const [speaking, setSpeaking] = useState<number | null>(null);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const toggleChatbot = () => setIsOpen(!isOpen);

  // Initialize Speech Recognition (Voice-to-Text)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      Swal.fire('Speech Recognition not supported in this browser!');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // Text-to-Speech functions
  const speakText = (text: string, index: number) => {
    if (speaking !== null) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      if (speaking === index) return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => setSpeaking(null);
    window.speechSynthesis.speak(utterance);
    setSpeaking(index);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(null);
  };

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // ✅ Check if file is an image
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please upload a valid image file (jpg, png, gif, etc.)",
          confirmButtonColor: "#3085d6",
        });
        e.target.value = ""; // reset input
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  // Handle sending messages
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) {
      return;
    }

    const userMessage: Message = { sender: 'You', text: input };
    const messageTobeSaved = [...messages, userMessage];
    if (previewUrl) userMessage.image = previewUrl;

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setSelectedImage(null);
    setPreviewUrl(null);
    localStorage.setItem('chatMessages', JSON.stringify(messageTobeSaved));

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('prompt', input);
      formData.append('history', JSON.stringify(updatedMessages));
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await axiosInstance.post(`/groq`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const botMessage: Message = {
        sender: 'AI',
        text: response.data.toString(),
      };
      const updatedMessagesWithBot = [...updatedMessages, botMessage];

      setMessages(updatedMessagesWithBot);
      localStorage.setItem(
        'chatMessages',
        JSON.stringify(updatedMessagesWithBot.map((msg) => {
          return { ...msg, image: null }
        }))
      );
    } catch (error) {
      const errorMessage: Message = {
        sender: 'AI',
        text: 'Sorry, an error occurred. Please try again later.',
      };
      const updatedMessagesWithError = [...updatedMessages, errorMessage];
      setMessages(updatedMessagesWithError);
      console.log(error);
      localStorage.setItem(
        'chatMessages',
        JSON.stringify(updatedMessagesWithError)
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear chat
  const clearChatHistory = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to clear the chat history?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear it!',
    }).then((result) => {
      if (result.isConfirmed) {
        setMessages([{ sender: 'AI', text: 'Hi, how can I help you today?' }]);
        localStorage.removeItem('chatMessages');
        Swal.fire('Cleared!', 'Your chat history has been cleared.', 'success');
      }
    });
  };

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {/* Floating Button */}
      <button
        onClick={toggleChatbot}
        className="fixed inline-flex items-center justify-center w-12 h-12 text-white bg-black rounded-full lg:w-14 lg:h-14 bottom-4 right-4 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-0 right-0 flex flex-col justify-between w-full sm:w-[90%] md:w-[600px] h-[100dvh] sm:h-[90vh] bg-gray-50/30 dark:bg-gray-900/30 backdrop-blur-lg p-2 pt-6 md:p-6 pb-0 rounded-t-lg sm:rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <h2 className="pr-2 text-lg font-semibold md:text-xl">
                  BazaarAI
                </h2>
                <button
                  onClick={clearChatHistory}
                  className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200"
                >
                  <FaHistory className="text-xl" />
                </button>
              </div>
              <button
                onClick={toggleChatbot}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                &#10005;
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex flex-col space-y-4 overflow-y-auto h-[calc(100vh-260px)] sm:h-[calc(100vh-220px)] md:h-[474px] pr-4"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'AI' ? 'justify-start' : 'justify-end'
                    }`}
                >
                  <div
                    className={`flex flex-col space-y-2 p-3 rounded-lg max-w-[80%] ${msg.sender === 'AI'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}
                  >
                    <span className="block font-bold">{msg.sender}</span>
                    <pre className="w-full whitespace-pre-wrap text-md md:text-base">
                      {msg.text}
                    </pre>
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="sent"
                        className="mt-2 rounded-lg max-h-40 object-cover"
                      />
                    )}
                    {/* Speaker Button for AI */}
                    {msg.sender === 'AI' && (
                      <button
                        onClick={() =>
                          speaking === index
                            ? stopSpeaking()
                            : speakText(msg.text, index)
                        }
                        className="ml-auto text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                      >
                        {speaking === index ? (
                          <FaVolumeMute className="text-lg" />
                        ) : (
                          <FaVolumeUp className="text-lg" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex flex-col space-y-2 p-3 rounded-lg max-w-[80%] bg-blue-100 dark:bg-blue-900 animate-pulse">
                    <span className="block font-bold">AI</span>
                    <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-40"></div>
                    <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-64"></div>
                    <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-32"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input + Mic + Image + Send */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col px-4 py-3 bg-white border border-gray-200 shadow-md dark:bg-gray-900 rounded-xl dark:border-gray-700"
            >
              {/* Image Preview */}
              {previewUrl && (
                <div className="relative w-32">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="rounded-lg border max-h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-black text-white rounded-full p-1"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}

              <div className="flex items-center">
                {/* Mic Button */}
                <motion.button
                  type="button"
                  onClick={toggleListening}
                  className="p-3 mr-2 rounded-full text-white"
                  animate={
                    listening
                      ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }
                      : {}
                  }
                  transition={
                    listening ? { repeat: Infinity, duration: 1.2 } : {}
                  }
                  style={{
                    backgroundColor: listening ? '#ef4444' : '#3b82f6',
                  }}
                >
                  {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </motion.button>

                <input
                  type="text"
                  style={{ outline: 'none' }}
                  className="flex-grow p-3 text-base text-gray-900 placeholder-gray-500 bg-transparent border-none rounded-lg dark:placeholder-gray-400 dark:text-gray-100"
                  placeholder="Type or speak your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />

                {/* Image Upload */}
                <label className="p-3 ml-2 text-gray-600 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700">
                  <FaImage />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                {/* Send Button */}
                <button
                  type="submit"
                  className="px-4 py-2 ml-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-500 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-500"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
