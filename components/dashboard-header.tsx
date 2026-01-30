"use client";

import { useEffect, useState } from "react";
import { Bell, User, Calendar, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Analytics } from "@vercel/analytics/react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

type SeasonData = {
  cereals: string[];
  grams?: string[];
  vegetables: string[];
  fruits: string[];
};

export function DashboardHeader() {
  const [openSeasonModal, setOpenSeasonModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();
  const currentDate = new Date();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const data = localStorage.getItem("userData");

    if (token) {
      setIsAuthenticated(true);
      if (data) setUser(JSON.parse(data));
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  function getSeasonInfo() {
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    let season = "";
    let image = "";
    let data: SeasonData = {
      cereals: [],
      vegetables: [],
      fruits: [],
    };

    const isRabi =
      (month === 10 && day >= 15) ||
      month === 11 ||
      month === 12 ||
      month === 1 ||
      month === 2 ||
      month === 3 ||
      (month === 4 && day <= 10);

    if (isRabi) {
      season = "Rabi Season";
      image = "/seasons/rabi.jpg";
      data = {
        cereals: ["Wheat", "Barley", "Oats", "Raya"],
        grams: ["Chickpeas", "Lentil (Masoor)"],
        vegetables: ["Spinach", "Carrot", "Cauliflower"],
        fruits: ["Orange", "Pomegranate", "Guava"],
      };
    } else {
      season = "Kharif Season";
      image = "/seasons/kharif.jpg";
      data = {
        cereals: ["Cotton", "Rice", "Maize", "Sorghum"],
        grams: ["Mash", "Moong"],
        vegetables: ["Okra", "Cucumber", "Bitter Gourd"],
        fruits: ["Mango", "Banana", "Papaya"],
      };
    }

    return { season, data, image };
  }

  const { season, data, image } = getSeasonInfo();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      sessionStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      setOpenUserModal(false);
      setOpenLogoutDialog(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const confirmLogout = () => {
    setOpenLogoutDialog(true);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 md:px-8 py-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Farm Management Dashboard
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {currentDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpenSeasonModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/70 transition"
            >
              <Calendar size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium">{season}</span>
            </button>

            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            )}

            {/* USER ICON OR LOGIN BUTTON */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenUserModal(true)}
              >
                <User size={20} />
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleLogin}
                className="flex items-center gap-2"
              >
                <LogIn size={18} />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Season Modal */}
      <Dialog open={openSeasonModal} onOpenChange={setOpenSeasonModal}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="w-full h-40 relative">
            <Image src={image} alt={season} fill className="object-cover" />
          </div>
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{season}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold text-lg">Cereals</h4>
                <p className="text-muted-foreground">
                  {data.cereals.join(", ")}
                </p>
              </div>
              {data.grams && (
                <div>
                  <h4 className="font-semibold text-lg">Grams / Pulses</h4>
                  <p className="text-muted-foreground">
                    {data.grams.join(", ")}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-lg">Vegetables</h4>
                <p className="text-muted-foreground">
                  {data.vegetables.join(", ")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Fruits</h4>
                <p className="text-muted-foreground">
                  {data.fruits.join(", ")}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Data Modal */}
      <Dialog open={openUserModal} onOpenChange={setOpenUserModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                User Profile
              </DialogTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
            <DialogDescription>
              Detailed information about the user account
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-5">
            {user ? (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Full Name
                      </label>
                      <div className="rounded-lg border bg-card px-4 py-3">
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Email Address
                      </label>
                      <div className="rounded-lg border bg-card px-4 py-3">
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </label>
                      <div className="rounded-lg border bg-card px-4 py-3">
                        <p className="font-medium">
                          {user.phoneNumber || (
                            <span className="text-muted-foreground italic">
                              Not provided
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        User Role
                      </label>
                      <div className="rounded-lg border bg-card px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <p className="font-medium">
                            {user.roleDisplay || user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Account Information
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">
                          Account Status
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-600" />
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">
                          Last Active
                        </span>
                        <span className="font-medium">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">No User Data</h3>
                <p className="text-muted-foreground max-w-sm">
                  Unable to retrieve user information. The user may not exist or
                  you may not have permission to view this data.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setOpenUserModal(false)}
              className="order-2 sm:order-1"
            >
              Close
            </Button>
            {user && (
              <Button
                variant="destructive"
                onClick={confirmLogout}
                className="order-1 sm:order-2"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to log out? You will need to sign in again
              to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mt-2 sm:mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
