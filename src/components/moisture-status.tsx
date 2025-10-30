import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type MoistureStatusProps = {
  moistureLevel: number;
};

export function MoistureStatus({ moistureLevel }: MoistureStatusProps) {
  const level = Math.round(moistureLevel);
  let statusText = "Sufficient Moisture";
  let statusColor = "text-green-500";
  let progressColor = "bg-green-500";

  if (level < 40) {
    statusText = "Needs Watering";
    statusColor = "text-yellow-500";
    progressColor = "bg-yellow-500";
  } else if (level > 85) {
    statusText = "Soil Saturated";
    statusColor = "text-blue-500";
    progressColor = "bg-blue-500";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soil Moisture</CardTitle>
        <CardDescription>Live sensor reading from your garden.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-headline">{level}%</span>
          <span className={cn("font-medium", statusColor)}>{statusText}</span>
        </div>
        <div>
          <Progress value={level} className="h-4" indicatorClassName={progressColor} />
        </div>
      </CardContent>
    </Card>
  );
}
