import { Header } from "@/components/header";
import { DashboardClient } from "@/components/dashboard-client";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <DashboardClient />
      </main>
    </div>
  );
}
