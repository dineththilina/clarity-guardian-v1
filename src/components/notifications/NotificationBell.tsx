
import React, { useState } from "react";
import { 
  Bell, 
  BellRing 
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useNotifications } from "@/context/NotificationContext";
import NotificationList from "./NotificationList";
import { cn } from "@/lib/utils";

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-xs flex items-center justify-center text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-6 w-6" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-80 p-0 max-h-[calc(100vh-100px)] overflow-auto"
        )}
        align="end"
      >
        <NotificationList onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
