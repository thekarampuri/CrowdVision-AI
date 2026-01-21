'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Dynamic imports to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  crowdCount?: number;
  status?: 'normal' | 'warning' | 'critical';
}

interface MapWidgetProps {
  locations?: MapLocation[];
  center?: LatLngExpression;
  zoom?: number;
  height?: string;
  title?: string;
  showCard?: boolean;
}

export function MapWidget({
  locations = [],
  center = [28.6139, 77.2090],
  zoom = 13,
  height = '400px',
  title = 'Location Map',
  showCard = true,
}: MapWidgetProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mapContent = (
    <div className="rounded-lg overflow-hidden" style={{ height }}>
      {!isClient ? (
        <div className="flex items-center justify-center bg-muted/20 h-full">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((location) => {
            const position: LatLngExpression = [location.lat, location.lng];

            const fillColor =
              location.status === 'critical'
                ? '#ef4444'
                : location.status === 'warning'
                ? '#f59e0b'
                : '#22c55e';

            const crowdRadius = location.crowdCount
              ? Math.min(location.crowdCount, 200)
              : 50;

            return (
              <div key={location.id}>
                <Marker position={position}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-semibold text-sm">{location.name}</h3>
                      {location.crowdCount !== undefined && (
                        <p className="text-xs mt-1">
                          Crowd: {location.crowdCount} people
                        </p>
                      )}
                      {location.status && (
                        <p className="text-xs mt-1 capitalize">
                          Status: <span className="font-medium">{location.status}</span>
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>

                {location.crowdCount !== undefined && (
                  <Circle
                    center={position}
                    radius={crowdRadius}
                    pathOptions={{
                      fillColor,
                      fillOpacity: 0.2,
                      color: fillColor,
                      weight: 2,
                    }}
                  />
                )}
              </div>
            );
          })}
        </MapContainer>
      )}
    </div>
  );

  if (!showCard) {
    return mapContent;
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{mapContent}</CardContent>
    </Card>
  );
}

export default MapWidget;
