import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "./../../App";
import LoadingSpinner from "../LoadingSpinner";
import { toast } from "react-toastify";
import logo from '../../assets/ltBooking.svg'

const Login = () => {
  const { dispatch } = useContext(UserContext); // Dispatch context to update the user state
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [authStatus, setAuthStatus] = useState(""); // State for error/success message

  const navigate = useNavigate(); // Hook for navigation

  const loginUser = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading spinner

    try {
      // Send login request using axios
      const response = await axios.post("http://localhost:5010/login", {
        email,
        password,
      }, {
        withCredentials: true, // Include cookies with the request
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      // Log the response for debugging purposes
      console.log(response);

      const data = response.data;

      // Ensure the userLogin is available
      if (!data.userLogin) {
        setAuthStatus("User login information is missing. Please try again.");
        setIsLoading(false);
        return;
      }

      // Store the token in localStorage
      localStorage.setItem("jwtoken", data.token);
      localStorage.setItem("userId", data.userLogin._id);

      // Dispatch to update the user context based on user type
      dispatch({ type: "USER", payload: true });
      console.log(data);
      if (data.userLogin.userType === 'admin') {
        dispatch({ type: 'USER_TYPE', payload: "admin" });
      } else if (data.userLogin.userType === 'hod') {
        dispatch({ type: 'USER_TYPE', payload: "hod" });
      } else {
        dispatch({ type: 'USER_TYPE', payload: "faculty" });
      }

      // Display success message and stop loading
      toast.success("Login Successfully");
      setIsLoading(false);

      // Navigate to the homepage
      navigate("/");

    } catch (error) {
      // Stop loading
      setIsLoading(false);

      // Check if the error response exists
      if (error.response) {
        // Handle server-side errors (e.g., invalid credentials)
        if (error.response.status === 400) {
          setAuthStatus(error.response.data.error); // Set error message from server
        }
      } else if (error.request) {
        // Handle request errors (e.g., network issues)
        setAuthStatus("Network error, please try again.");
      } else {
        // Handle any other errors
        setAuthStatus("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <section className="text-gray-600 body-font min-h-screen flex flex-col items-center bg-white">
          <img className="w-24 md:w-60 mt-12 mb-12" src={logo} alt="logo" />
          <div className="lg:w-2/6 md:w-1/2 bg-white shadow-2xl shadow-blue-200 rounded-lg p-8 flex flex-col md:ml-auto md:mr-auto mt-10 md:mt-0">
            <form method="POST">
              <h3 className="text-3xl my-8 sm:text-4xl leading-normal font-extrabold tracking-tight text-gray-900">
                Sign <span className="text-indigo-600">In</span>
              </h3>

              <div className="relative mb-4">
                <label
                  htmlFor="email"
                  className="leading-7 block uppercase tracking-wide text-gray-700 text-xs font-bold"
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  name="email"
                  placeholder="Email"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>

              <div className="relative mb-4">
                <label
                  htmlFor="password"
                  className="leading-7 block uppercase tracking-wide text-gray-700 text-xs font-bold"
                >
                  Password
                </label>
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>

              <div className="my-4">
                <p className="text-s text-red-600 font-bold">
                  {authStatus}
                </p>
              </div>

              <div className="my-4">
                <Link to="/passwordReset" className="text-m font-bold hover:underline">
                  Forgot Your Password?
                </Link>
              </div>

              <div className="mx-auto w-fit">
                <div className="mx-auto">
                  <button
                    type="submit"
                    onClick={loginUser}
                    className="text-white bg-indigo-600 shadow focus:shadow-outline focus:outline-none border-0 py-2 px-10 font-bold hover:bg-indigo-800 rounded text-lg"
                  >
                    Login
                  </button>
                </div>
              </div>
             
            </form>
          </div>
        </section>
      )}
    </>
  );
};

export default Login;
