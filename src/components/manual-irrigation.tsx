import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap } from "lucide-react";

type ManualIrrigationProps = {
  isWatering: boolean;
  onWater: () => void;
};

export function ManualIrrigation({ isWatering, onWater }: ManualIrrigationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Control</CardTitle>
        <CardDescription>Activate the pump on-demand.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={onWater}
          disabled={isWatering}
        >
          <Zap className="mr-2 h-4 w-4" />
          {isWatering ? "Watering in progress..." : "Activate Riego (5s)"}
        </Button>
        <p className="text-xs text-muted-foreground h-4">
          {isWatering && "The pump will run for 5 seconds."}
        </p>
      </CardContent>
    </Card>
  );
}
