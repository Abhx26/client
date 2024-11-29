import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const User = () => {
  const [faculties, setFaculties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loader during form submission
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    userType: "",
    password: "",
    cpassword: "",
  });

  // Fetch faculties
  const fetchFaculties = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/getuser`, {
        withCredentials: true,
      });
      setFaculties(response.data.faculties || []);
    } catch (error) {
      console.error("Error fetching faculties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Delete faculty
  const handleDeleteFaculty = async (facultyId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this User?");
    if (isConfirmed) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/deleteuser/${facultyId}`, {
          withCredentials: true,
        });

        if (response.data.success) {
          toast.success("User deleted successfully!");
          setFaculties((prevFaculties) =>
            prevFaculties.filter((faculty) => faculty.id !== facultyId)
          ); // Remove the deleted faculty from the list
        } else {
          toast.info(response.data.message || "Faculty not found.");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user.");
      }
    }
  };

  // Handle input changes for the new user form
  const handleNewUserInput = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUser.password !== newUser.cpassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsSubmitting(true); // Show loader
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/register`, newUser, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        toast.success("User added successfully!");
        setShowModal(false); // Close the modal
        setFaculties((prevFaculties) => [...prevFaculties, response.data.user]); // Add new user locally
        setNewUser({ name: "", email: "", userType: "", password: "", cpassword: "" }); // Reset form
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user.");
    } finally {
      setIsSubmitting(false); // Hide loader
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader bg-indigo-500 text-white p-3 rounded-full flex space-x-3 animate-pulse">
          <div className="w-4 h-4 bg-white rounded-full"></div>
          <div className="w-4 h-4 bg-white rounded-full"></div>
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <ToastContainer position="bottom-left" autoClose={3000} hideProgressBar={false} />
  
      <div className="py-5 flex container mx-auto px-6 justify-between items-center">
        <div className="mx-auto">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-3xl text-center text-gray-800 font-black leading-7 ml-3 md:leading-10">
            <span className="text-indigo-700">Users</span>
          </h1>
        </div>
  
        <button
          onClick={() => setShowModal(true)}
          className="flex self-end bg-transparent hover:bg-gray-200 rounded border border-indigo-700 text-indigo-700 py-1 sm:py-3 px-4"
        >
          Add Users
        </button>
      </div>
  
      {faculties.length > 0 ? (
        <div className="overflow-x-auto flex justify-center">
          <table className="w-4/5 table-auto bg-white border border-gray-200 shadow-lg rounded-lg">
            <thead className="bg-indigo-100 text-black">
              <tr>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Account Type</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties
                .sort((a, b) => {
                  // Sort logic: Faculty first, then Staff, then Student
                  const order = { faculty: 1, staff: 2, student: 3 };
                  return (order[a.userType] || 4) - (order[b.userType] || 4);
                })
                .map((faculty) => (
                  <tr key={faculty.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-6">{faculty.name}</td>
                    <td className="py-3 px-6">{faculty.email}</td>
                    <td className="py-3 px-6">
                      {faculty.userType
                        ? faculty.userType.charAt(0).toUpperCase() +
                          faculty.userType.slice(1)
                        : "N/A"}
                    </td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => handleDeleteFaculty(faculty.id)}
                        className="text-red-600 hover:text-red-800 bg-transparent border-2 border-red-600 py-1 px-3 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-xl text-gray-700">No Users Found</p>
      )}
  
      {/* Modal for Adding User */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserInput}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleNewUserInput}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-1">User Type</label>
                <select
                  name="userType"
                  value={newUser.userType}
                  onChange={handleNewUserInput}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleNewUserInput}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="cpassword"
                  value={newUser.cpassword}
                  onChange={handleNewUserInput}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default User;
