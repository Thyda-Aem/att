"use client";

import { pages } from "next/dist/build/templates/app-page";
import { Result } from "postcss";
import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  Image?: string;
  session_token: string;
}

interface UserData {
  user: User;
  data?: any; // Define the structure of `data` if known
}

interface TabsProps {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

interface Attendance {
  id: number;
  dateCheck: string;
  timeCheckIN: string | null;
  timeCheckOut: string | null;
}

const Tabs = ({ userData, setUserData }: TabsProps) => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [showButton, setShowButton] = useState(false);
  const [btnStatus, setBtnStatus] = useState(false);  
  const [myAttendance, setMyAttendance] = useState<Attendance[] | null>(null);


  const companyCoords ={lat: 11.4994736, lng: 104.7699068};//11.4995665,104.7699807 11.4994736,104.7699068 11.4995268,104.7699989 {lat: 11.4995052, lng: 104.7699526};// { lat: 11.4995041, lng: 104.7699444 };

  useEffect(() => {
    if (activeTab === "tab1") {
  
      const calculateDistance = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }) => {
        const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
        const R = 6371;
        const dLat = toRadians(coord2.lat - coord1.lat);
        const dLng = toRadians(coord2.lng - coord1.lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(coord1.lat)) *
            Math.cos(toRadians(coord2.lat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const checkProximity = (userCoords: { lat: number; lng: number }) => {
        const isNearCompany = calculateDistance(companyCoords, userCoords) <= 0.1;
        console.log('user coords :',userCoords , "destanst : ",calculateDistance(companyCoords, userCoords));
        setShowButton(isNearCompany);
      };


      
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }
  
      navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
        if (permissionStatus.state === "denied") {
          alert("Please enable location services in your browser settings.");
          setShowButton(false);
          return;
        }
  
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const userCoords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            checkProximity(userCoords);
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              alert("Location access is required for attendance tracking. Please enable it.");
            }
            setShowButton(false);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 500000 }
        );
  
        return () => navigator.geolocation.clearWatch(watchId);
      });
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "tab1") {
      const updateTime = () => {
        setCurrentTime(new Date().toLocaleTimeString());
      };

      updateTime();
      const timer = setInterval(updateTime, 1000);

      return () => clearInterval(timer);
    }
  }, [activeTab]);

  
  const handleTabClick = (tab: string) => setActiveTab(tab);

  const checkAtt = async () => {
    const token = userData?.user?.session_token;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toLocaleTimeString("en-GB", { hour12: false });

    try {
      const response = await fetch("https://prpropertystore.com/api/checkatt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: userData?.user?.id,
          date: today,
          time: now,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error(`Error ${response.status}:`, errorDetails);
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      window.location.reload();
    

      console.log("Attendance check successful:", data);
    } catch (error) {
      console.error("Error in checkAtt:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "tab2") {
      // Call the attendance API when tab2 is active
      const fetchAttendanceData = async () => {
        try {
          const token = userData?.user?.session_token;
          const response = await fetch("https://prpropertystore.com/api/myattendance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: userData?.user?.id,
            })
          });
  
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
  
          const data = await response.json();
          setMyAttendance(data.data.data);
          console.log("Attendance data:", data);
          // You can store the response in your state if necessary
        } catch (error) {
          console.error("Error fetching attendance data:", error);
        }
      };
  
      fetchAttendanceData();
    }
  }, [activeTab]);


  return (
    <div className="p-4">
      <div className="flex items-center mb-4 space-x-4">
        <img
          src="/test.png"//{userData?.user?.Image}
          alt="User Avatar"
          className="w-12 h-12 rounded-full"
        />
       
        <div>
          <p className="text-xl font-semibold">
            {userData?.user?.name || "Loading user..."}
          </p>
          <p className="text-sm text-gray-600">
            Welcome, {userData?.user?.name || "User name"}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap space-x-4 border-b">
        {[
          { tab: "tab1", label: "Home Page" },
          { tab: "tab2", label: "Attendance List" },
        ].map(({ tab, label }) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 text-sm sm:text-base md:text-lg ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-700 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

     
      <div className="mt-4">
        
        {activeTab === "tab1" && (
          <div>
            <div className="flex justify-center items-center mt-8">
              {(showButton && btnStatus) || (showButton && (!userData?.data || !userData?.data?.timeCheckOut)) ? (
                <button
                  onClick={checkAtt}
                  className="w-40 h-40 rounded-full bg-blue-600 flex justify-center items-center shadow-md"
                >
                  <p className="text-2xl font-bold text-gray-50">{currentTime}</p>
                </button>
              ) : (
                <div className="w-40 h-40 rounded-full bg-blue-100 flex justify-center items-center shadow-md">
                  <p className="text-2xl font-bold text-gray-700">{currentTime}</p>
                </div>
              )}
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="p-6 bg-white shadow-lg rounded-2xl text-center">
                  <p className="text-sm md:text-base text-gray-500 font-medium">Date</p>
                  <h2 className="text-lg md:text-2xl font-bold text-blue-600">
                    {userData?.data?.dateCheck || new Date().toISOString().split("T")[0]}
                  </h2>
                </div>

                <div className="p-6 bg-white shadow-lg rounded-2xl text-center">
                  <p className="text-sm md:text-base text-gray-500 font-medium">Check-In Time</p>
                  <h2 className="text-lg md:text-2xl font-bold text-green-600">
                    {userData?.data?.timeCheckIN || "Not Checked In"}
                  </h2>
                </div>

                <div className="p-6 bg-white shadow-lg rounded-2xl text-center">
                  <p className="text-sm md:text-base text-gray-500 font-medium">Check-Out Time</p>
                  <h2 className="text-lg md:text-2xl font-bold text-red-600">
                    {userData?.data?.timeCheckOut || "Not Checked Out"}
                  </h2>
                </div>
              </div>


          </div>
        )}

        {activeTab === "tab2" && (
        <div className="space-y-4">
          <table className="w-full text-left border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-1 py-1 font-semibold">Date</th>
                <th className="px-1 py-1 font-semibold">Check In</th>
                <th className="px-1 py-1 font-semibold">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {myAttendance?.length ? (
                myAttendance.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="border px-1 py-1">{attendance.dateCheck}</td>
                    <td className="border px-1 py-1">{attendance.timeCheckIN || "Not Checked In"}</td>
                    <td className="border px-1 py-1">{attendance.timeCheckOut || "Not Checked"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border px-4 py-2" colSpan={3}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}        
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  useEffect(() => {
    const tabKey = "activeDashboardTab";
    const currentTabId = Date.now().toString(); // Unique ID for each tab

    // If another tab is already open, close this one
    const existingTabId = localStorage.getItem(tabKey);
    if (existingTabId && existingTabId !== currentTabId) {
      alert("A new session has been opened. Closing this tab.");
      window.close();
      return;
    }

    // Set this tab as the active one
    localStorage.setItem(tabKey, currentTabId);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === tabKey && event.newValue !== currentTabId) {
        alert("A new session has been opened. Closing this tab.");
        window.close();
      }
    };

    // Listen for changes in localStorage
    window.addEventListener("storage", handleStorageChange);

    // Cleanup on tab close
    const handleBeforeUnload = () => {
      if (localStorage.getItem(tabKey) === currentTabId) {
        localStorage.removeItem(tabKey);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const result = localStorage.getItem("loginResult");

    if (result) {
      fetchData(result);
    }
  }, []);

 
  const fetchData = async (result: string) => {
    try {
      const parsedResult = JSON.parse(result);
      const token = parsedResult?.data?.session_token;

      if (!token) {
        console.error("No valid session token found.");
        return;
      }

      const response = await fetch("https://prpropertystore.com/api/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: parsedResult.data.id,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const fetchedData = await response.json();
      setUserData(fetchedData);
      console.log(fetchedData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="p-8">
      {userData ? (
        <Tabs userData={userData} setUserData={setUserData} />
      ) : (
        <div className="text-gray-500">No login information found.</div>
      )}
    </div>
  );
}