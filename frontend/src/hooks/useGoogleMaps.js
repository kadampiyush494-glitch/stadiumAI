import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

/**
 * Custom hook to load Google Maps API asynchronously.
 * @param {string} apiKey - Google Maps API Key
 * @param {HTMLDivElement} mapRef - Reference to the DOM element for the map
 * @param {Object} mapOptions - Google Maps options
 * @returns {Object} { isLoaded, loadError, map, coreApi }
 */
export function useGoogleMaps(apiKey, mapRef, mapOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [map, setMap] = useState(null);
  const [coreApi, setCoreApi] = useState(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error('Google Maps API key is required'));
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['visualization', 'places', 'geometry'], // We need visualization for Heatmap
    });

    loader.load()
      .then((google) => {
        setCoreApi(google);
        setIsLoaded(true);

        if (mapRef.current && !mapInstance.current) {
          const newMap = new google.maps.Map(mapRef.current, mapOptions);
          mapInstance.current = newMap;
          setMap(newMap);
        }
      })
      .catch((err) => {
        setLoadError(err);
      });

    // Cleanup memory references on unmount. 
    // Google Maps JS API doesn't have an explicit 'destroy' method, 
    // but clearing events and references helps avoid memory leaks.
    return () => {
      if (mapInstance.current && coreApi) {
        coreApi.maps.event.clearInstanceListeners(mapInstance.current);
        mapInstance.current = null;
        setMap(null);
      }
    };
  }, [apiKey, mapRef, mapOptions, coreApi]);

  return { isLoaded, loadError, map, coreApi };
}
