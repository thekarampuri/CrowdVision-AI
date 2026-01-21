'use client';

import { Map, CameraLocation } from '@/components/map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample camera locations for demonstration
const sampleCameras: CameraLocation[] = [
  {
    id: 'cam-1',
    name: 'India Gate Camera',
    position: [28.6129, 77.2295],
    crowdDensity: 8,
    status: 'alert',
  },
  {
    id: 'cam-2',
    name: 'Connaught Place Camera',
    position: [28.6315, 77.2167],
    crowdDensity: 5,
    status: 'active',
  },
  {
    id: 'cam-3',
    name: 'Red Fort Camera',
    position: [28.6562, 77.2410],
    crowdDensity: 3,
    status: 'active',
  },
  {
    id: 'cam-4',
    name: 'Qutub Minar Camera',
    position: [28.5244, 77.1855],
    crowdDensity: 2,
    status: 'active',
  },
  {
    id: 'cam-5',
    name: 'Chandni Chowk Camera',
    position: [28.6507, 77.2334],
    crowdDensity: 9,
    status: 'alert',
  },
  {
    id: 'cam-6',
    name: 'Lotus Temple Camera',
    position: [28.5535, 77.2588],
    crowdDensity: 1,
    status: 'active',
  },
  {
    id: 'cam-7',
    name: 'Akshardham Camera',
    position: [28.6127, 77.2773],
    crowdDensity: 0,
    status: 'inactive',
  },
];

export default function MapPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Crowd Monitoring Map</h1>
        <p className="text-muted-foreground">
          Real-time visualization of camera locations and crowd density
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Live Camera Feed Locations</CardTitle>
          <CardDescription>
            Monitor crowd density across multiple locations in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Map
            center={[28.6139, 77.2090]}
            zoom={12}
            cameras={sampleCameras}
            height="600px"
            className="border border-border/50 shadow-lg"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cameras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleCameras.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sampleCameras.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alert Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {sampleCameras.filter(c => c.status === 'alert').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              High crowd density detected
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Density</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                sampleCameras.reduce((acc, cam) => acc + (cam.crowdDensity || 0), 0) /
                sampleCameras.length
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all locations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Camera List</CardTitle>
          <CardDescription>All monitored locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sampleCameras.map((camera) => (
              <div
                key={camera.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      camera.status === 'alert'
                        ? 'bg-red-500 animate-pulse'
                        : camera.status === 'inactive'
                        ? 'bg-gray-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{camera.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {camera.position[0].toFixed(4)}, {camera.position[1].toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    Density: {camera.crowdDensity}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {camera.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
