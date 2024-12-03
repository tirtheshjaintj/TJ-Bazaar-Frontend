import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Adjusted import for correct TS usage
import Cookie from "universal-cookie";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

interface GoogleBoxProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  type: `user` | `seller`;

}

interface DecodedToken {
  name?: string;
  email: string;
  sub: string; // Represents the Google user ID
}

const GoogleBox: React.FC<GoogleBoxProps> = ({ setIsLoading, type }) => {
  const cookie = new Cookie();
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential provided.");
      }

      // Decode the token
      const decodedToken = jwtDecode<DecodedToken>(credentialResponse.credential);

      // Destructure the necessary fields with a default for the name
      const { name = "Anonymous", email, sub: google_id } = decodedToken;

      // Remove all special characters and numbers from the name
      const sanitized_name = name.replace(/[^a-zA-Z\s]/g, "").trim();

      setIsLoading(true); // Set loading state

      // Send POST request to the backend
      const response = await axiosInstance.post(`/${type}/google_login`, {
        email,
        name: sanitized_name,
        google_id,
      });

      if (response.data.status) {
        toast.success('Logged In Successfully');
        const token = response.data.token;
        if (token) {
          // Save token in cookies
          cookie.set(`${type}_token`, token, {
            path: '/',
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
          });

          // Navigate to user dashboard
          navigate(`/${type}/dashboard`);
        }
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Google Login failed.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Login failed");
  };

  return (
    <div className="flex justify-center items-center">
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={handleGoogleLoginError}
      />
    </div>
  );
};

export default GoogleBox;
