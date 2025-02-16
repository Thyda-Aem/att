"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  Image?: string;
  session_token: string;
}

interface UserData {
  user: User;
  data?: any;
}

interface Attendance {
  id: number;
  dateCheck: string;
  timeCheckIN: string | null;
  timeCheckOut: string | null;
}

export default function LateLeaveList() {
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("tab1");
  const [myAttendance, setMyAttendance] = useState<Attendance[] | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: "1",
    date: new Date().toISOString().split("T")[0],
    reason: "",
  });


  useEffect(() => {
    const result = localStorage.getItem("loginResult");
    if (result) {
      fetchData(result);
    } else {
      router.push("/login");
    }
  }, []);

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!userData?.user?.session_token) {
      alert("User not authenticated.");
      return;
    }
  
    console.log("Session Token:", userData?.user?.session_token);
    try {
      const response = await fetch("https://prpropertystore.com/api/latesubmit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.user.session_token}`,
        },
        body: JSON.stringify({
          ...formData,
          id: userData.user.id,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit");
      }
  
      const data = await response.json();
      alert("Submission successful: " + JSON.stringify(data));
    } catch (error) {
      console.error("Error:", error);
      alert("Submission failed.");
    }
  };
  useEffect(() => {
    if (!userData?.user?.session_token) return;

    const fetchAttendanceData = async () => {
      try {
        const response = await fetch("https://prpropertystore.com/api/latlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.user.session_token}`,
          },
          body: JSON.stringify({ id: userData.user.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.message || response.status}`);
        }

        const data = await response.json();
        setMyAttendance(data.data.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    if (activeTab === "tab1") fetchAttendanceData();
  }, [activeTab, userData]);

  const fetchData = async (result: string) => {
    try {
      const parsedResult = JSON.parse(result);
      const token = parsedResult?.data?.session_token;

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("https://prpropertystore.com/api/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: parsedResult.data.email,
          id: parsedResult.data.id,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const fetchedData = await response.json();
      setUserData(fetchedData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4 space-x-4">
        <Link href="/dashboard">
          <img
            src="/test.png"
            alt="User Avatar"
            className="w-12 h-12 rounded-full"
          />
        </Link>
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
        {[{ tab: "tab1", label: "Late or Leave early" }, { tab: "tab2", label: "Leave" }].map(({ tab, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Request Late or Leave Early
              </button>

              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h2 className="text-xl font-bold mb-4">Request Form</h2>
                    <form onSubmit={handleSubmit}>
                      <label className="block mb-2">
                        Type:
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-lg mt-1"
                        >
                          <option value="1">Late</option>
                          <option value="2">Leave Early</option>
                        </select>
                      </label>

                      <label className="block mb-2 mt-4">
                        Date:
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-lg mt-1"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </label>

                      <label className="block mb-2">
                        Reason:
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-lg mt-1"
                          rows={4}
                          placeholder="Enter your reason"
                        />
                      </label>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 mr-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                          onClick={()=>setShowModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
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

        {activeTab === "tab2" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Request Leave
              </button>
            </div>
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
}
