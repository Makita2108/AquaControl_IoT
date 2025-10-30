import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type WateringHistoryProps = {
  history: Date[];
};

export function WateringHistory({ history }: WateringHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History />
          Historial de Riego
        </CardTitle>
        <CardDescription>Registro de activaciones manuales.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center pt-4">No hay registros aún.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((timestamp, index) => (
                <li key={index} className="text-sm text-foreground">
                  Riego activado {" "}
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(timestamp, { addSuffix: true, locale: es })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
