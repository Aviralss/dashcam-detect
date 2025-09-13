import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sample pothole data
const potholeData = [
  {
    id: 1,
    lat: 28.6129,
    lng: 77.2295,
    severity: 'high',
    title: 'Large pothole on main road',
    timestamp: '1d ago'
  },
  {
    id: 2,
    lat: 28.6139,
    lng: 77.2085,
    severity: 'medium',
    title: 'Medium pothole detected via live camera',
    timestamp: '1d ago'
  },
  {
    id: 3,
    lat: 28.6149,
    lng: 77.2195,
    severity: 'low',
    title: 'Small pothole on side street',
    timestamp: '1d ago'
  }
];

const PotholeMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([28.6129, 77.2295], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Create custom icons for different severity levels
    const createCustomIcon = (severity: string) => {
      const colors = {
        high: '#dc2626',
        medium: '#f59e0b', 
        low: '#16a34a'
      };
      
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${colors[severity as keyof typeof colors]};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    };

    // Add markers for each pothole
    potholeData.forEach(pothole => {
      const marker = L.marker([pothole.lat, pothole.lng], {
        icon: createCustomIcon(pothole.severity)
      }).addTo(map.current!);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${pothole.title}</h3>
          <p class="text-xs text-gray-600 mt-1">Severity: ${pothole.severity}</p>
          <p class="text-xs text-gray-500">${pothole.timestamp}</p>
        </div>
      `);
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-severity-high"></div>
            <span className="text-sm text-card-foreground">High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-severity-medium"></div>
            <span className="text-sm text-card-foreground">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-severity-low"></div>
            <span className="text-sm text-card-foreground">Low Severity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PotholeMap;