import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StadiumMap from './StadiumMap';
import * as GoogleMapsLoader from '../../hooks/useGoogleMaps';

// Mock the hook
vi.mock('../../hooks/useGoogleMaps', () => ({
  useGoogleMaps: vi.fn()
}));

describe('Maps Integration', () => {
  const mockMap = {
    setOptions: vi.fn(),
    panTo: vi.fn(),
    setZoom: vi.fn(),
  };

  const mockCoreApi = {
    maps: {
      LatLng: vi.fn(item => item),
      visualization: {
        HeatmapLayer: vi.fn().mockImplementation(function() {
          this.setData = vi.fn();
          this.setMap = vi.fn();
          return this;
        })
      },
      DirectionsService: vi.fn().mockImplementation(function() {
        this.route = vi.fn((req, cb) => cb({ routes: [] }, 'OK'));
        return this;
      }),
      DirectionsRenderer: vi.fn().mockImplementation(function() {
        this.setMap = vi.fn();
        this.setDirections = vi.fn();
        return this;
      }),
      TravelMode: { WALKING: 'WALKING' },
      Marker: vi.fn().mockImplementation(function() {
        this.addListener = vi.fn();
        return this;
      }),
      InfoWindow: vi.fn().mockImplementation(function() {
        this.setContent = vi.fn();
        this.open = vi.fn();
        return this;
      }),
      SymbolPath: { CIRCLE: 0 }
    }
  };

  it('binds heatmap data correctly on mount', async () => {
    GoogleMapsLoader.useGoogleMaps.mockReturnValue({
      isLoaded: true,
      loadError: null,
      map: mockMap,
      coreApi: mockCoreApi
    });

    render(<StadiumMap />);
    
    await waitFor(() => {
      expect(mockCoreApi.maps.visualization.HeatmapLayer).toHaveBeenCalled();
    });
  });

  it('renders loading state initially', () => {
    GoogleMapsLoader.useGoogleMaps.mockReturnValue({ isLoaded: false });
    render(<StadiumMap />);
    expect(screen.getByText(/Loading Stadium Map/i)).toBeInTheDocument();
  });

  it('triggers directions rendering on calculation', async () => {
     // I'll need to expose or trigger the route calculation
     // In StadiumMap.jsx, there's a button for testing: "Calculate Route to Burger Stand"
     GoogleMapsLoader.useGoogleMaps.mockReturnValue({
        isLoaded: true,
        loadError: null,
        map: mockMap,
        coreApi: mockCoreApi
      });

      render(<StadiumMap />);
      
      const btn = screen.getByText(/Calculate Route to Burger Stand/i);
      btn.click();

      await waitFor(() => {
        expect(mockCoreApi.maps.DirectionsService).toHaveBeenCalled();
      });
  });
});
