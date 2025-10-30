import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PlantAnimation } from "./plant-animation";

type MoistureStatusProps = {
  moistureLevel: number;
};

export function MoistureStatus({ moistureLevel }: MoistureStatusProps) {
  const level = Math.round(moistureLevel);
  let statusText = "Humedad Suficiente";
  let statusColor = "text-green-500";
  let progressColor = "bg-green-500";

  if (level < 40) {
    statusText = "Necesita Riego";
    statusColor = "text-yellow-500";
    progressColor = "bg-yellow-500";
  } else if (level > 85) {
    statusText = "Suelo Saturado";
    statusColor = "text-blue-500";
    progressColor = "bg-blue-500";
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Humedad del Suelo</CardTitle>
        <CardDescription>Lectura del sensor en tiempo real.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center flex-grow gap-4">
        <PlantAnimation moistureLevel={level} />
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-headline">{level}%</span>
          </div>
          <p className={cn("font-medium", statusColor)}>{statusText}</p>
          <Progress value={level} className="h-4 w-full" indicatorClassName={progressColor} />
        </div>
      </CardContent>
    </Card>
  );
}
