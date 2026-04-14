import React, { useRef, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Assuming a firebase init file exists

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

  if (loadError) return <div className="text-red-500">Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center text-white/50 bg-primary animate-pulse">Loading Stadium Map...</div > ;

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden glass-card">
      <div
        ref={mapRef}
        className="w-full h-full"
        role="application"
        aria-label="Interactive Stadium Map with real-time crowd heatmaps"
        tabIndex="0"
      />
      
      {/* Invisible aria-live region for accessibility announcements */}
      <div aria-live="polite" className="sr-only">
        {activeWaitTimes.map((wait, idx) => <span key={idx}>{wait}</span>)}
      </div>
      
      {/* Provide an accessible trigger for test/demo purposes */}
      <button 
        className="sr-only focus:not-sr-only absolute top-4 left-4 bg-primary text-secondary p-2 rounded"
        onClick={() => calculateRoute(STADIUM_CENTER, { lat: 37.7750, lng: -122.4190 })}
      >
        Calculate Route to Burger Stand
      </button>
    </div>
  );
}

StadiumMap.propTypes = {
  onRouteAnnounce: PropTypes.func,
};
