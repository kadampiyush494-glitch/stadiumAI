import React, { useRef, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, Info, X } from 'lucide-react';

const STADIUM_ZONES = [
  { id: 1, name: 'North Concourse', density: 45 },
  { id: 2, name: 'South Entrance', density: 82 },
  { id: 3, name: 'West Food Court', density: 60 },
  { id: 4, name: 'East Plaza', density: 25 },
];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0A0E1A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0E1A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#00D4FF" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#00D4FF" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0c1328" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#00D4FF" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#161b2e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1f2640" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8da0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#030815" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

const STADIUM_CENTER = { lat: 37.7749, lng: -122.4194 }; // Placeholder target coordinate

export default function StadiumMap({ onRouteAnnounce }) {
  const mapRef = useRef(null);
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [activeWaitTimes, setActiveWaitTimes] = useState([]);
  
  const mapOptions = useMemo(() => ({
    center: STADIUM_CENTER,
    zoom: 17,
    styles: darkMapStyle,
    disableDefaultUI: true,
  }), []);

  const { isLoaded, loadError, map, coreApi } = useGoogleMaps(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    mapRef,
    mapOptions
  );

  // Focus management and aria-live announcements
  const announceToScreenReader = (message) => {
    if (onRouteAnnounce) onRouteAnnounce(message);
  };

  useEffect(() => {
    if (!isLoaded || !map || !coreApi) return;

    // 3. Initialize HeatmapLayer
    const newHeatmap = new coreApi.maps.visualization.HeatmapLayer({
      data: [],
      map: map,
      radius: 40,
      opacity: 0.7,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 212, 255, 1)',
        'rgba(255, 140, 0, 1)',
        'rgba(255, 0, 0, 1)'
      ] // Futuristic thermal look
    });
    setHeatmapLayer(newHeatmap);

    // 6. Initialize DirectionsRenderer
    const renderer = new coreApi.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#00D4FF',
        strokeOpacity: 0.9,
        strokeWeight: 5,
      }
    });
    setDirectionsRenderer(renderer);

    const infoWindow = new coreApi.maps.InfoWindow();

    // 4. Custom SVG Markers
    const createMarker = (position, type, name, waitTime, crowdLevel) => {
      let color = '#FF8C00'; // food by default
      if (type === 'restroom') color = '#00D4FF';
      if (type === 'gate') color = '#00FF00';
      if (type === 'medical') color = '#FF0000';

      const svgMarker = {
        path: coreApi.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.9,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 10,
      };

      const marker = new coreApi.maps.Marker({
        position,
        map,
        icon: svgMarker,
        title: name,
        optimized: false,
      });

      // 9. Accessibility mapping for Markers (if rendered to DOM)
      // Since Google Maps renders markers into canvas/divs, we handle a11y primarily
      // by setting the title attribute above which gets read as `aria-label` by some screen readers.
      
      // 5. InfoWindow Click
      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="color: black; padding: 5px;">
            <h3 style="margin: 0; font-weight: bold;">${name}</h3>
            <p style="margin: 5px 0;">Wait Time: ${waitTime} mins</p>
            <p style="margin: 5px 0;">Crowd: ${crowdLevel}</p>
          </div>
        `);
        infoWindow.open(map, marker);
      });
    };

    // Plot simulated markers
    createMarker({ lat: 37.7750, lng: -122.4190 }, 'food', 'Burger Stand', 10, 'Medium');
    createMarker({ lat: 37.7748, lng: -122.4196 }, 'restroom', 'North Restroom', 5, 'Low');

    return () => {
      newHeatmap.setMap(null);
      renderer.setMap(null);
    };
  }, [isLoaded, map, coreApi]);

  // 7. Real-time updates - Firestore Listener every 5s conceptually
  useEffect(() => {
    if (!heatmapLayer || !coreApi) return;

    // We assume there's a Firestore 'zones' collection updating density
    // Setting up the listener
    const q = query(collection(db, 'zones'));
    
    // Simulate updating heatmap data every 5s if Firestore isn't connected yet
    const interval = setInterval(() => {
       const mockHeatmapData = Array.from({ length: 15 }).map(() => (
         new coreApi.maps.LatLng(
           STADIUM_CENTER.lat + (Math.random() - 0.5) * 0.005,
           STADIUM_CENTER.lng + (Math.random() - 0.5) * 0.005
         )
       ));
       heatmapLayer.setData(mockHeatmapData);
    }, 5000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const zone = doc.data();
        return {
          location: new coreApi.maps.LatLng(zone.lat, zone.lng),
          weight: zone.density || 1
        };
      });
      if(data.length > 0) heatmapLayer.setData(data);
    }, (error) => {
      console.warn("Firestore listener failed or unconfigured, continuing with fallback", error);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [heatmapLayer, coreApi]);

  // Handle routing request
  const calculateRoute = (start, end) => {
    if (!coreApi || !directionsRenderer) return;
    const directionsService = new coreApi.maps.DirectionsService();

    directionsService.route({
      origin: start,
      destination: end,
      travelMode: coreApi.maps.TravelMode.WALKING,
    }, (response, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(response);
        announceToScreenReader('A new optimal route has been calculated and displayed on the map.');
      } else {
        announceToScreenReader('Failed to calculate route.');
      }
    });
  };

  const [showDensityTable, setShowDensityTable] = useState(false);

  if (loadError) return <div className="text-red-500">Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center text-white/50 bg-primary animate-pulse">Loading Stadium Map...</div > ;

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden glass-card">
      {/* Map Content for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {activeWaitTimes.length > 0 ? `Current wait times: ${activeWaitTimes.join(', ')}` : ''}
      </div>

      {/* Accessibility Overlays */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button 
           onClick={() => setShowDensityTable(!showDensityTable)}
           className="p-3 bg-slate-900/90 text-white rounded-2xl border border-white/10 shadow-xl flex items-center space-x-2 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all pointer-events-auto"
           aria-expanded={showDensityTable}
           aria-controls="density-table"
        >
           <Users size={16} className="text-cyan-400" />
           <span>{showDensityTable ? 'Hide Density' : 'Show Density Table'}</span>
        </button>
        
        <button 
           className="p-3 bg-slate-900/90 text-white rounded-2xl border border-white/10 shadow-xl flex items-center justify-center text-xs font-bold hover:bg-slate-800 pointer-events-auto"
           aria-label="Map Keyboard Shortcut Guide"
           onClick={() => alert("Keyboard Map Controls:\n+ / - : Zoom\nArrows : Pan\nCtrl + / : Search Facilities")}
        >
           <Info size={16} />
        </button>
      </div>

      {showDensityTable && (
        <div 
          id="density-table"
          className="absolute inset-0 z-50 bg-slate-950 p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="density-title"
        >
           <div className="flex justify-between items-center mb-6">
              <h2 id="density-title" className="text-xl font-black text-white">Zone Density Reports</h2>
              <button 
                onClick={() => setShowDensityTable(false)}
                className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"
                aria-label="Close Density Table"
              >
                <X size={24} />
              </button>
           </div>
           
           <table className="w-full text-left border-collapse">
              <thead className="text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                 <tr>
                    <th className="pb-3 px-2">Zone Name</th>
                    <th className="pb-3 px-2">Density</th>
                    <th className="pb-3 px-2 text-right">Trend</th>
                 </tr>
              </thead>
              <tbody className="text-slate-100 text-sm">
                 {STADIUM_ZONES.map(zone => (
                    <tr key={zone.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                       <td className="py-4 px-2 font-bold">{zone.name}</td>
                       <td className="py-4 px-2">
                          <span className={zone.density > 80 ? 'text-rose-400' : 'text-emerald-400'}>
                             {zone.density}%
                          </span>
                       </td>
                       <td className="py-4 px-2 text-right text-slate-500 font-mono">Stable</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-full"
        role="application"
        aria-label="Interactive Stadium Map with real-time crowd heatmaps"
        tabIndex="0"
      />
    </div>
  );
}

StadiumMap.propTypes = {
  onRouteAnnounce: PropTypes.func,
};
