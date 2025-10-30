"use client";

import { useState, useEffect } from "react";
import { AIScheduler } from "@/components/ai-scheduler";
import { ManualIrrigation } from "@/components/manual-irrigation";
import { MoistureStatus } from "@/components/moisture-status";
import { useToast } from "@/hooks/use-toast";
import { WateringHistory } from "@/components/watering-history";

export function DashboardClient() {
  const [moistureLevel, setMoistureLevel] = useState(50);
  const [isWatering, setIsWatering] = useState(false);
  const [history, setHistory] = useState<Date[]>([]);
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
    const wateringTime = new Date();
    setHistory([wateringTime, ...history]);
    toast({
        title: "Sistema de Riego",
        description: "Riego manual activado durante 5 segundos.",
    });

    // Simulate watering effect
    const wateringEffect = setInterval(() => {
        setMoistureLevel(prev => Math.min(prev + 2, 100));
    }, 500);


    setTimeout(() => {
      setIsWatering(false);
      clearInterval(wateringEffect);
      toast({
        title: "Sistema de Riego",
        description: "Riego manual finalizado.",
      });
    }, 5000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
        <MoistureStatus moistureLevel={moistureLevel} />
      </div>
      <div className="md:col-span-2 lg:col-span-2 xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <AIScheduler currentMoisture={moistureLevel} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
            <ManualIrrigation
              isWatering={isWatering}
              onWater={handleManualWatering}
            />
            <WateringHistory history={history} />
        </div>
      </div>
    </div>
  );
}
