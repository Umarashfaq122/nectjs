"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/auth";
import Image from "next/image";
import logo from "@/public/logooo.png";
import background from "@/public/farm.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await loginUser(email, password);

    if (result.success) {
      router.push("/login"); // Only navigate on success
    } else {
      setError(result.error || "Login failed");
      // DO NOT navigate on error - stay on login page
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${background.src})`,
      }}
    >
      {/* Dark blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* LOGO */}
      <div className="relative z-20 mb-6">
        <Image
          src={logo} // your logo file from public
          width={250}
          height={250}
          alt="Logo"
          className="drop-shadow-xl rounded-xl"
        />
      </div>

      {/* LOGIN CARD */}
      <Card className="w-full max-w-md relative z-20 bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-2xl font-bold text-white drop-shadow">
            Yield Enhancement Program(YEP)
          </CardTitle>
          <CardDescription className="text-white/80">
            Farm Management System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 text-red-200 text-sm rounded-lg border border-red-400/40">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="your.@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-white/40 border-white/40 text-white placeholder-black/70"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/40 border-white/40 text-white placeholder-black/70"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 shadow-lg"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-white/80">
              Enter your registered email and password
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
