"use client";

import { useState, useEffect } from "react";
import { AIScheduler } from "@/components/ai-scheduler";
import { ManualIrrigation } from "@/components/manual-irrigation";
import { MoistureStatus } from "@/components/moisture-status";
import { useToast } from "@/hooks/use-toast";

export function DashboardClient() {
  const [moistureLevel, setMoistureLevel] = useState(50);
  const [isWatering, setIsWatering] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate real-time moisture data changes
    const interval = setInterval(() => {
      setMoistureLevel((prev) => {
        const change = Math.random() * 4 - 2; // Fluctuate by +/- 2
        const newValue = prev + change;
        if (newValue < 0) return 0;
        if (newValue > 100) return 100;
        return newValue;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleManualWatering = () => {
    if (isWatering) return;
    setIsWatering(true);
    toast({
        title: "Irrigation System",
        description: "Manual watering activated for 5 seconds.",
    });

    // Simulate watering effect
    const wateringEffect = setInterval(() => {
        setMoistureLevel(prev => Math.min(prev + 2, 100));
    }, 500);


    setTimeout(() => {
      setIsWatering(false);
      clearInterval(wateringEffect);
      toast({
        title: "Irrigation System",
        description: "Manual watering finished.",
      });
    }, 5000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <MoistureStatus moistureLevel={moistureLevel} />
        <ManualIrrigation
          isWatering={isWatering}
          onWater={handleManualWatering}
        />
      </div>
      <div className="lg:col-span-2">
        <AIScheduler currentMoisture={moistureLevel} />
      </div>
    </div>
  );
}
