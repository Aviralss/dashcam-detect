import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePotholes } from '@/hooks/usePotholes';
import { toast } from '@/hooks/use-toast';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PotholeMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { potholes, updatePothole } = usePotholes();

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView([28.6129, 77.2295], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when potholes data changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    potholes.forEach(pothole => {
      const marker = L.marker([pothole.latitude, pothole.longitude], {
        icon: createCustomIcon(pothole.severity)
      }).addTo(map.current!);

      const handleMarkRepaired = async () => {
        try {
          await updatePothole(pothole.id, { status: 'repaired' });
          toast({
            title: "Success",
            description: "Pothole marked as repaired"
          });
        } catch (error) {
          // Error is handled in the hook
        }
      };

      const statusColor = pothole.status === 'repaired' ? 'text-green-600' : 
                         pothole.status === 'verified' ? 'text-blue-600' : 'text-orange-600';

      marker.bindPopup(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-sm mb-1">${pothole.title}</h3>
          <p class="text-xs text-gray-600 mb-1">${pothole.description}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-medium capitalize">Severity: ${pothole.severity}</span>
            <span class="text-xs ${statusColor} capitalize">${pothole.status}</span>
          </div>
          <p class="text-xs text-gray-500 mb-2">${new Date(pothole.reported_at).toLocaleString()}</p>
          ${pothole.status !== 'repaired' ? 
            `<button onclick="(${handleMarkRepaired.toString()})()" 
             class="w-full bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600">
             Mark as Repaired
            </button>` : 
            '<span class="text-xs text-green-600 font-medium">✓ Repaired</span>'
          }
        </div>
      `);

      markersRef.current.push(marker);
    });
  }, [potholes, updatePothole]);

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