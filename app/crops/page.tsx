import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { CropsList } from "@/components/crops-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CropsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Crop History & Planning
                </h1>
                <p className="text-muted-foreground mt-2">
                  Track crop cultivation history and future planting plans
                </p>
              </div>
              {/* <Button className="gap-2">
                <Plus size={20} />
                Add Crop
              </Button> */}
            </div>
            <CropsList />
          </div>
        </main>
      </div>
    </div>
  );
}
