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
    if (!apiKey) return;

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
          mapInstance.current = new google.maps.Map(mapRef.current, mapOptions);
          setMap(mapInstance.current);
        }
      })
      .catch((err) => {
        setLoadError(err);
      });

    return () => {
      if (mapInstance.current && coreApi) {
        coreApi.maps.event.clearInstanceListeners(mapInstance.current);
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, mapRef, mapOptions]);

  return { isLoaded, loadError, map, coreApi };
}
