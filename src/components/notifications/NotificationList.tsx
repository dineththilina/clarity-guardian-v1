
import React from "react";
import { useNotifications, NotificationType } from "@/context/NotificationContext";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Trash2, 
  XCircle 
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationListProps {
  onClose?: () => void;
}

const NotificationList = ({ onClose }: NotificationListProps) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "danger":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="max-h-full flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="h-8 px-2"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Read all</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAll}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Clear</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 flex gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  notification.read ? "opacity-60" : "font-medium"
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(notification.timestamp, "MMM d, h:mm a")}
                  </p>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
