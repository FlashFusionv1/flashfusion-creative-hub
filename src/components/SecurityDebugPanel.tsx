import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { securityMonitor } from "@/lib/security";
import { AlertTriangle, Shield, Clock, User } from "lucide-react";

/**
 * Security Debug Panel for monitoring security events
 * Only visible in development mode
 */
const SecurityDebugPanel = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const interval = setInterval(() => {
      setEvents(securityMonitor.getRecentEvents());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'validation_failure':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'rate_limit_exceeded':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'suspicious_activity':
        return <User className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'validation_failure':
        return 'secondary';
      case 'rate_limit_exceeded':
        return 'destructive';
      case 'suspicious_activity':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Shield className="h-4 w-4 mr-2" />
          Security ({events.length})
        </Button>
      ) : (
        <Card className="w-96 max-h-96 overflow-hidden bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm">Security Monitor</CardTitle>
                <CardDescription className="text-xs">
                  Recent security events (dev only)
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                No security events recorded
              </div>
            ) : (
              events.slice(-10).reverse().map((event, index) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="flex items-start gap-2 p-2 rounded-md border bg-card"
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={getEventBadgeVariant(event.type)}
                        className="text-xs"
                      >
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs break-words">
                      {event.details}
                    </p>
                    {event.userId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        User: {event.userId.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityDebugPanel;