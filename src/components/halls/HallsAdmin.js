import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";
import { toast } from "react-toastify";

const HallsAdmin = () => {
  const navigate = useNavigate();
  const [hallData, setHallData] = useState([]);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState("");
  const [selectedHallName, setSelectedHallName] = useState("");

  // Fetch user data
  const callAboutPage = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/about`,
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      setUserData(data);
      setIsLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.warn("Unauthorized Access! Please Login!", {
          toastId: "Unauthorized",
        });
        navigate("/login");
      }
    }
  };

  // Fetch halls data
  const getHallsData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/halls`,
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      setHallData(data.halls); // Ensure `data.halls` is an array
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching halls data:", error);
    }
  };

  useEffect(() => {
    callAboutPage();
    getHallsData();
  }, []);

  // Delete a hall
  const handleDeleteClick = async (hallId) => {
    if (!hallId) {
      toast.error("Invalid Hall ID");
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/halls/${hallId}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;

      if (!data) {
        toast.error("Request not sent!");
      } else {
        getHallsData(); // Refresh the halls data
        toast.success("Hall Deleted Successfully!");
        setShowModal(false);
        setSelectedHallId("");
        setSelectedHallName("");
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const data = error.response.data;
        console.error("Validation error:", data.error);
      } else {
        console.error("Error deleting hall:", error);
      }
    }
  };

  // Handle editing
  const handleEditClick = (hallId, hallName) => {
    navigate(`/halls/${hallId}/${hallName}`);
  };

  // Show delete confirmation modal
  const handleDeleteModal = (hallId, hallName) => {
    setSelectedHallId(hallId);
    setSelectedHallName(hallName);
    setShowModal(true);
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 min-h-screen">
          <div className="py-5 flex container mx-auto px-6 justify-between items-center">
            <div className="mx-auto">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-3xl text-center text-gray-800 font-black leading-7 ml-3 md:leading-10">
                Available <span className="text-indigo-700">Halls</span>
              </h1>
            </div>
            <Link to="/hallForm">
              <button className="flex self-end bg-transparent hover:bg-gray-200 rounded border border-indigo-700 text-indigo-700 py-1 sm:py-3 px-4">
                Create Hall
              </button>
            </Link>
          </div>

          {Array.isArray(hallData) && hallData.length > 0 ? (
            <div className="container mx-auto px-6">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Name</th>
                    <th className="border border-gray-300 px-4 py-2">Location</th>
                    <th className="border border-gray-300 px-4 py-2">Capacity</th>
                    <th className="border border-gray-300 px-4 py-2">Amenities</th>
                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hallData.map((hall) => (
                    <tr key={hall.id} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">{hall.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{hall.location}</td>
                      <td className="border border-gray-300 px-4 py-2">{hall.capacity}</td>
                      <td className="border border-gray-300 px-4 py-2">{hall.amenities}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {userData.email === process.env.REACT_APP_MASTER_ADMIN_EMAIL ||
                        userData.email === hall.hallCreater ? (
                          <>
                            <button
                              className="px-2 py-1 text-white bg-green-500 hover:bg-green-600 rounded-lg mr-2"
                              onClick={() => handleEditClick(hall.id, hall.name)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-2 py-1 text-white bg-red-500 hover:bg-red-600 rounded-lg"
                              onClick={() => handleDeleteModal(hall.id, hall.name)}
                            >
                              Delete
                            </button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-center mt-10">No halls found.</h2>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-8 py-6">
            <h2 className="text-lg font-bold mb-4">
              Are you sure you want to delete {selectedHallName}?
            </h2>
            <div className="flex justify-end">
              <button
                className="mr-2 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg"
                onClick={() => handleDeleteClick(selectedHallId)}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HallsAdmin;
