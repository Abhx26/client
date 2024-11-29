import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";
import { format, parseISO } from "date-fns";

const Events = () => {
  const [eventData, setEventData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  const getEventData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/events`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data.bookings;

      // Default ordering by createdAt
      const sortedEventData = data.sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );

      setEventData(sortedEventData);
      setFilteredData(sortedEventData);
      setIsLoading(false);

      if (response.status !== 200) {
        throw new Error(response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getEventData();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = eventData.filter(
      (event) =>
        event.eventName?.toLowerCase().includes(query) ||
        event.bookedHallName?.toLowerCase().includes(query) ||
        event.organizingClub?.toLowerCase().includes(query) ||
        (event.eventDateType === "multiple"
          ? `${format(new Date(event.eventStartDate), "dd-MM-yyyy")} to ${format(
              new Date(event.eventEndDate),
              "dd-MM-yyyy"
            )}`
              .toLowerCase()
              .includes(query)
          : format(new Date(event.eventDate), "dd-MM-yyyy")
              .toLowerCase()
              .includes(query)) ||
        (event.startTime &&
          event.endTime &&
          `${format(
            parseISO(`2000-01-01T${event.startTime}`),
            "hh:mm aa"
          )} - ${format(parseISO(`2000-01-01T${event.endTime}`), "hh:mm aa")}`
            .toLowerCase()
            .includes(query)) ||
        event.eventManager?.toLowerCase().includes(query)
    );

    setFilteredData(filtered);
  };

  const handleSort = (column) => {
    const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(order);
  
    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[column] || "";
      let bValue = b[column] || "";
  
      // Custom logic for venue sorting
      if (column === "bookedHallName") {
        const extractNumber = (str) => {
          const match = str.match(/(\d+)/);
          return match ? parseInt(match[0], 10) : Infinity; // Default to Infinity if no number is found
        };
        aValue = extractNumber(aValue);
        bValue = extractNumber(bValue);
      }
  
      // Handle date and time sorting
      if (column === "eventDate" || column === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (column === "time") {
        aValue = a.startTime
          ? parseISO(`2000-01-01T${a.startTime}`)
          : new Date(0);
        bValue = b.startTime
          ? parseISO(`2000-01-01T${b.startTime}`)
          : new Date(0);
      }
  
      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
    setFilteredData(sorted);
  };
  

  const getSortIcon = (column) => {
    if (sortColumn === column) {
      return sortOrder === "asc" ? "⬆️" : "⬇️";
    }
    return "↔️"; // Default unsorted state
  };

  return (
    <div className="mt-6 min-h-screen">
      <h1 className="text-xl sm:text-3xl md:text-4xl text-center font-black leading-7 text-gray-800">
        Upcoming<span className="text-indigo-700"> Events</span>
      </h1>

      {/* Search Bar */}
      <div className="flex justify-center mt-6">
        <input
          type="text"
          placeholder="Search events by name, venue, date..."
          value={searchQuery}
          onChange={handleSearch}
          className="p-3 border border-gray-300 rounded-lg w-full max-w-lg text-gray-700 text-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : filteredData.length ? (
        <div className="mt-8 mx-auto max-w-5xl">
          {/* Header Row */}
          <div className="flex justify-between items-center bg-indigo-100 p-4 rounded-lg mb-2 font-bold text-gray-700">
            <div
              className="w-1/4 cursor-pointer flex items-center"
              onClick={() => handleSort("eventName")}
            >
              Event Name <span className="ml-2">{getSortIcon("eventName")}</span>
            </div>
            <div
              className="w-1/4 cursor-pointer flex items-center"
              onClick={() => handleSort("bookedHallName")}
            >
              Venue <span className="ml-2">{getSortIcon("bookedHallName")}</span>
            </div>
            {/* <div
              className="w-1/4 cursor-pointer flex items-center"
              onClick={() => handleSort("organizingClub")}
            >
              Description{" "}
              <span className="ml-2">{getSortIcon("organizingClub")}</span>
            </div> */}
            <div
              className="w-1/4 cursor-pointer flex items-center"
              onClick={() => handleSort("eventDate")}
            >
              Date <span className="ml-2">{getSortIcon("eventDate")}</span>
            </div>
            <div
              className="w-1/4 cursor-pointer flex items-center"
              onClick={() => handleSort("time")}
            >
              Time <span className="ml-2">{getSortIcon("time")}</span>
            </div>
            <div className="w-1/4">Coordinator</div>
          </div>
          {/* Event Rows */}
          {filteredData.map((event) => (
            <div
              key={event.id}
              className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg mb-4"
            >
              <div className="w-1/4 text-lg font-bold text-navy-500">
                {event.eventName}
              </div>
              <div className="w-1/4 text-sm text-gray-600">
                {event.bookedHallName}
              </div>
              {/* <div className="w-1/4 text-sm text-gray-600">
              {event.organizingClub
      ? event.organizingClub.split(" ").slice(0, 2).join(" ") +
        (event.organizingClub.split(" ").length > 2 ? "..." : "")
      : "N/A"}
              </div> */}
              <div className="w-1/4 text-sm text-gray-600">
                {event.eventDateType === "multiple"
                  ? `${format(
                      new Date(event.eventStartDate),
                      "dd-MM-yyyy"
                    )} to ${format(
                      new Date(event.eventEndDate),
                      "dd-MM-yyyy"
                    )}`
                  : format(new Date(event.eventDate), "dd-MM-yyyy")}
              </div>
              <div className="w-1/4 text-sm text-gray-600">
                {event.startTime && event.endTime ? (
                  `${format(
                    parseISO(`2000-01-01T${event.startTime}`),
                    "hh:mm aa"
                  )} - ${format(
                    parseISO(`2000-01-01T${event.endTime}`),
                    "hh:mm aa"
                  )}`
                ) : (
                  "No Time Available"
                )}
              </div>
              <div className="w-1/4 text-sm text-gray-600">
                {event.eventManager}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <h2 className="text-2xl font-bold text-zinc-700 text-center mt-10">
          No Upcoming Events.
        </h2>
      )}
    </div>
  );
};

export default Events;
