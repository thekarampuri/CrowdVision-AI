"use client";

import { useEffect, useState } from "react";
import { Activity, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { checkBackendHealth } from "@/lib/backend-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function BackendStatus() {
    const [status, setStatus] = useState<{
        cameraFeed: boolean;
        dataAPI: boolean;
        checking: boolean;
    }>({
        cameraFeed: false,
        dataAPI: false,
        checking: true,
    });

    const checkStatus = async () => {
        setStatus((prev) => ({ ...prev, checking: true }));
        try {
            const health = await checkBackendHealth();
            setStatus({
                cameraFeed: health.cameraFeed,
                dataAPI: health.dataAPI,
                checking: false,
            });
        } catch (error) {
            console.error("Health check failed:", error);
            setStatus({
                cameraFeed: false,
                dataAPI: false,
                checking: false,
            });
        }
    };

    useEffect(() => {
        checkStatus();
        // Check every 30 seconds
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const isFullyConnected = status.cameraFeed && status.dataAPI;
    const isPartiallyConnected = status.cameraFeed || status.dataAPI;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            {status.checking ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : isFullyConnected ? (
                                <Wifi className="h-4 w-4 text-green-500" />
                            ) : isPartiallyConnected ? (
                                <Activity className="h-4 w-4 text-yellow-500" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-red-500" />
                            )}
                            <Badge
                                variant={
                                    isFullyConnected
                                        ? "default"
                                        : isPartiallyConnected
                                            ? "secondary"
                                            : "destructive"
                                }
                                className="text-xs"
                            >
                                {status.checking
                                    ? "Checking..."
                                    : isFullyConnected
                                        ? "Connected"
                                        : isPartiallyConnected
                                            ? "Partial"
                                            : "Offline"}
                            </Badge>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                        <div className="space-y-2">
                            <p className="font-semibold">Backend Status</p>
                            <div className="space-y-1 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <span>Camera Feed (Port 999):</span>
                                    <Badge
                                        variant={status.cameraFeed ? "default" : "destructive"}
                                        className="text-xs"
                                    >
                                        {status.cameraFeed ? "Online" : "Offline"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span>Data API (Port 666):</span>
                                    <Badge
                                        variant={status.dataAPI ? "default" : "destructive"}
                                        className="text-xs"
                                    >
                                        {status.dataAPI ? "Online" : "Offline"}
                                    </Badge>
                                </div>
                            </div>
                            {!isFullyConnected && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Make sure backend servers are running. See backend/SETUP.md
                                </p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={checkStatus}
                    disabled={status.checking}
                >
                    <RefreshCw
                        className={`h-4 w-4 ${status.checking ? "animate-spin" : ""}`}
                    />
                </Button>
            </div>
        </TooltipProvider>
    );
}
