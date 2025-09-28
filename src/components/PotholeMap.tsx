import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePotholes } from '@/hooks/usePotholes';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

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
  const userLocationMarker = useRef<L.Marker | null>(null);
  const userLocationCircle = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
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

  // Create user location icon
  const createUserLocationIcon = () => {
    return L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #3b82f6;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -2px;
            left: -2px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: rgba(59, 130, 246, 0.3);
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
        </style>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  // Request user location
  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);
      
      if (permission.state === 'granted' || permission.state === 'prompt') {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          });
        });
        
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(newLocation);
        setLocationPermission('granted');
        
        // Center map on user location
        if (map.current) {
          map.current.setView([newLocation.lat, newLocation.lng], 16);
        }
        
        startLocationTracking();
        
        toast({
          title: "Location Found",
          description: "Map centered on your current location"
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationPermission('denied');
      toast({
        title: "Location Error",
        description: "Could not get your location. Please check permissions.",
        variant: "destructive"
      });
    } finally {
      setLocationLoading(false);
    }
  };

  // Start continuous location tracking
  const startLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        
        // Update user location marker
        if (map.current) {
          updateUserLocationMarker(newLocation, position.coords.accuracy);
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  };

  // Update user location marker on map
  const updateUserLocationMarker = (location: { lat: number; lng: number }, accuracy?: number) => {
    if (!map.current) return;
    
    // Remove existing user location marker and circle
    if (userLocationMarker.current) {
      userLocationMarker.current.remove();
    }
    if (userLocationCircle.current) {
      userLocationCircle.current.remove();
    }
    
    // Add accuracy circle if available
    if (accuracy) {
      userLocationCircle.current = L.circle([location.lat, location.lng], {
        radius: accuracy,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        color: '#3b82f6',
        weight: 1,
        opacity: 0.3
      }).addTo(map.current);
    }
    
    // Add user location marker
    userLocationMarker.current = L.marker([location.lat, location.lng], {
      icon: createUserLocationIcon(),
      zIndexOffset: 1000
    }).addTo(map.current);
    
    userLocationMarker.current.bindPopup(`
      <div class="p-2">
        <h3 class="font-semibold text-sm mb-1">Your Location</h3>
        <p class="text-xs text-gray-600">Lat: ${location.lat.toFixed(6)}</p>
        <p class="text-xs text-gray-600">Lng: ${location.lng.toFixed(6)}</p>
        ${accuracy ? `<p class="text-xs text-gray-500">Accuracy: ±${Math.round(accuracy)}m</p>` : ''}
      </div>
    `);
  };

  // Center map on user location
  const centerOnUser = () => {
    if (userLocation && map.current) {
      map.current.setView([userLocation.lat, userLocation.lng], 16);
      toast({
        title: "Map Centered",
        description: "Centered on your current location"
      });
    }
  };

  // Initialize map and request location
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Use setTimeout to ensure container is fully rendered
    const initializeMap = () => {
      if (!mapContainer.current) return;
      
      map.current = L.map(mapContainer.current, {
        preferCanvas: true,
        zoomControl: true
      }).setView([28.6129, 77.2295], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map.current);

      // Force map to recalculate size after initialization
      setTimeout(() => {
        if (map.current) {
          map.current.invalidateSize();
        }
      }, 100);

      // Auto-request location on mount
      requestLocation();
    };

    // Delay initialization to ensure container dimensions are set
    const timeoutId = setTimeout(initializeMap, 0);

    return () => {
      clearTimeout(timeoutId);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle window resize and container size changes
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        setTimeout(() => {
          map.current?.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Also handle when tab content becomes visible
    const resizeObserver = new ResizeObserver(handleResize);
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
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
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg" 
        style={{ minHeight: '400px' }}
      />
      
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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-card-foreground">Your Location</span>
          </div>
        </div>
      </div>

      {/* Location Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {locationPermission !== 'granted' && (
          <Button 
            size="sm" 
            onClick={requestLocation}
            disabled={locationLoading}
            className="shadow-lg"
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {locationLoading ? 'Finding...' : 'Find Me'}
          </Button>
        )}
        
        {userLocation && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={centerOnUser}
            className="shadow-lg bg-card/95 backdrop-blur-sm"
          >
            <Navigation className="h-4 w-4" />
            Center
          </Button>
        )}
      </div>

      {/* Location Status */}
      {userLocation && (
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-card-foreground">
              Live Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotholeMap;