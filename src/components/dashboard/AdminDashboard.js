import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BookingsAdmin from '../bookings/BookingsAdmin';

const AdminDashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { success, message, data } = response.data;

      if (success && data.length > 0) {
        toast.success(`${message} (${data.length} bookings processed.)`);
      } else if (success && data.length === 0) {
        toast.warning("File uploaded, but no valid bookings found.");
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (error) {
      console.error("Error during file upload:", error);

      if (error.response) {
        toast.error(error.response.data.message || "An error occurred on the server.");
      } else {
        toast.error("Failed to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle sample template download
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "Timetable Venue Booking 2024-25-I.xlsx"; // Update this path as needed
    link.download = "Sample_Template.xlsx";
    link.click();
  };

  return (
    <div className="mt-6 min-h-screen">
      <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl text-center text-gray-800 font-black leading-7 ml-3 md:leading-10">
        Admin <span className="text-indigo-700">Dashboard</span>
      </h1>

      <div>
        <BookingsAdmin />
      </div>

      <div className="mt-4 flex flex-col items-center">
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="mb-2"
        />
        <div className="flex gap-4">
          <button 
            onClick={handleFileUpload} 
            disabled={loading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Download Sample Template
          </button>
        </div>
        {loading && <div className="mt-2 text-indigo-600">Uploading file... Please wait.</div>}
      </div>

      <ToastContainer position="bottom-left" />
    </div>
  );
};

export default AdminDashboard;
