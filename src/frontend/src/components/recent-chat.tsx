import { Card, CardContent } from "@/components/ui/card";

import { HourglassIcon } from "lucide-react";
import { ChatSnapshot } from "../../generated";
import moment from "moment";

export default function RecentChat({ title, date, preview }: ChatSnapshot) {
  const formattedDate = moment(date).fromNow();

  return (
    <Card className="p-2 flex-1 rounded-md flex-col ">
      <CardContent className="p-2 flex flex-col justify-between h-full space-y-3">
        <div className="flex flex-col">
          <h1 className="line-clamp-1 text-foreground font-medium">{title}</h1>
          <p className="text-foreground/60 line-clamp-2">{preview}</p>
        </div>
        <div className="flex items-center space-x-1">
          <HourglassIcon className="w-3 h-3" />
          <p className="text-foreground/60 text-xs">{formattedDate}</p>
        </div>
      </CardContent>
    </Card>
  );
}
