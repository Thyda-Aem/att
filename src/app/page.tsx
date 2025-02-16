"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
interface CompanyData {
  companyid: number;
  comanyname: string; // Fixed typo to match API response
  Image: string;
}



export default function Home() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const router = useRouter();
  const companyId = 1;

  useEffect(() => {
    const result = localStorage.getItem("loginResult");

    // Detect if the user is on an iOS or Android device
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    // if (isIOS || isAndroid) {
    //   router.push("/login"); // Redirect to login page if on mobile OS
    //   return;
    // }

    if (result) {
      router.push("/dashboard"); // Redirect to Dashboard if user is logged in
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) {
        console.warn("No company ID provided. Skipping API call.");
        return;
      }

      try {
        const response = await fetch("https://prpropertystore.com/api/company", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: companyId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error! Status: ${response.status} - ${errorText}`);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fetchedData = await response.json();
        if (!fetchedData?.data || Object.keys(fetchedData.data).length === 0) {
          console.warn("Empty response received from API.");
          return;
        }

        setCompanyData(fetchedData.data);
        console.log("Company Data:", fetchedData.data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center">
      <Image
        className="dark:invert rounded-full"
        src={companyData?.Image || "/img.gif"}
        alt={companyData?.comanyname || "Company logo"}
        width={180}
        height={188}
        priority
      />


        <Link href={`/login?companyid=${companyId}`}>
          <button className="bg-blue-400 text-cyan-50 hover:bg-slate-300 hover:text-cyan-950 px-4 py-2 rounded-md font-semibold">
            Get Started
          </button>
        </Link>
      </main>
    </div>
  );
}
