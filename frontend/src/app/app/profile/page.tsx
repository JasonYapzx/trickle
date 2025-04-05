"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  name: string;
  email: string;
  walletAddress: string;
  displayPicture?: string;
}
interface Portfolio {
  token: string;
  proportion: GLfloat;
  tokenAddress: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supaBase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]); // Change to array type

  const getUser = async () => {
    const { data, error } = await supaBase.from('users').select('*').single();
    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setUser(data);
    }
    setLoading(false);
  };

  const getPortfolio = async () => {
    const { data, error } = await supaBase.from('portfolio').select('*');
    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setPortfolio(data); // Set the entire array
    }
    setLoading(false);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await getUser();
      await getPortfolio();
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight text-black col-span-full mb-4 inline-flex items-center">
        <span className="bg-gradient-to-r from-[#CCFF00]/90 to-transparent bg-[length:100%_40%] bg-no-repeat bg-bottom">
          Profile
        </span>
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <div className="flex justify-center my-6">
            <Avatar className="h-50 w-50">
              <AvatarImage src={user?.displayPicture || ''} alt={user?.name || ''} />
              <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading profile data...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold">Name:</div>
                <div className="col-span-2">{user.name}</div>

                <div className="font-semibold">Email:</div>
                <div className="col-span-2">{user.email}</div>

                <div className="font-semibold">Address:</div>
                <div className="col-span-2 break-all">{user.walletAddress}</div>
              </div>
            </div>
          ) : (
            <p>No user data found.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Portfolio Settings</CardTitle>
          <CardDescription>Your Portfolio information</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading Portfolio data...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : portfolio.length > 0 ? (
            <div className="space-y-6">
              {portfolio.map((item, index) => (
                <div key={index} className="space-y-4">
                  <div className="grid grid-cols-3">
                    <div className="font-semibold">Token:</div>
                    <div className="col-span-2">{item.token}</div>

                    <div className="font-semibold">Proportion:</div>
                    <div className="col-span-2 font-bold">{item.proportion}</div>

                    <div className="font-semibold">Token Address:</div>
                    <div className="col-span-2 break-all">{item.tokenAddress}</div>
                  </div>
                  {index < portfolio.length - 1 && <hr className="my-4" />}
                </div>
              ))}
            </div>
          ) : (
            <p>No portfolio data found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
