// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";

// interface CompanyData {
//   companyid: number;
//   comanyname: string; // Fixed typo to match API response
//   Image: string;
// }

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("123");
//   const [message, setMessage] = useState("");
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const companyId = searchParams.get("companyid");
//   const [companyData, setCompanyData] = useState<CompanyData | null>(null);



//   useEffect(() => {
//     const fetchData = async () => {
//       if (!companyId) {
//         console.warn("No company ID provided. Skipping API call.");
//         return;
//       }

//       try {
//         const response = await fetch("https://prpropertystore.com/api/company", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ id: companyId }),
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error(`HTTP error! Status: ${response.status} - ${errorText}`);
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const fetchedData = await response.json();
//         if (!fetchedData?.data || Object.keys(fetchedData.data).length === 0) {
//           console.warn("Empty response received from API.");
//           return;
//         }

//         setCompanyData(fetchedData.data);
//         console.log("Company Data:", fetchedData.data);
//       } catch (error) {
//         console.error("Error fetching company data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     // Detect if the device is NOT a phone
//     const userAgent = navigator.userAgent || navigator.vendor;
//     const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

//     if (!isMobile) {
//       router.push("/"); // Redirect to home page if not on a phone
//     }
//   }, [router]);
 
//   const generateDeviceToken = () => {
//     const deviceToken = localStorage.getItem("device_token");
  
//     if (deviceToken) {
//       return deviceToken; // Return stored token
//     }
  
//     // Generate a new device token if none exists
//     const newDeviceToken = 'device-' + Math.random().toString(36).substr(2, 9); // Simple random token
//     localStorage.setItem("device_token", newDeviceToken); // Store it in localStorage
//     return newDeviceToken;
//   }
//   const deviceid= generateDeviceToken();
  
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
   

//     try {
//       const response = await fetch("https://prpropertystore.com/api/custom", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password, deviceid, companyId }),
//       });
     
//       if (!response.ok) {
//         console.log('this  is ',email, password, deviceid, companyId);
//         // Log the status code and response for debugging
//         // console.error("Error Status:", response.status);
        
//         const result = await response.json();
//         console.log(result);
//         setMessage(result.message || "Login failed. Please try again.");
//         return;
//       }
    
//       const result = await response.json();
     
    
//       // Store result in localStorage and navigate to dashboard
//       localStorage.setItem("loginResult", JSON.stringify(result));
//       router.push("/dashboard");
//     } catch (error) {
//       setMessage("An error occurred during login. Please try again.");
//       console.error("Error during login:", error);
//     }
//   };

//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[var(--font-geist-sans)]">
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center">
//          <Image
//                 className="dark:invert rounded-full"
//                 src={companyData?.Image || "/img.gif"}
//                 alt={companyData?.comanyname || "Company logo"}
//                 width={180}
//                 height={188}
//                 priority
//               />
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="border p-2 rounded w-full"
//             required
//           />
//           <input
//             type="hidden"
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
//             Login
//           </button>
//         </form>
//         {message && (
//           <div className="w-full max-w-md mt-4">
//             <div className="relative bg-red-100 text-red-800 border-l-4 border-red-500 p-4 rounded-md shadow-md">
//               <button
//                 onClick={() => setMessage("")}
//                 className="absolute top-2 right-2 text-red-800 hover:text-red-900 focus:outline-none"
//               >
//                 &times;
//               </button>
//               <p className="text-sm font-semibold">{message}</p>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

"use client";

import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
