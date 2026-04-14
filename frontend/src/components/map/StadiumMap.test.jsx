import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StadiumMap from './StadiumMap';

// Mock the Custom Hook to simulate Google Maps being loaded
vi.mock('../../hooks/useGoogleMaps', () => ({
  useGoogleMaps: vi.fn(),
}));

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn().mockReturnValue(vi.fn()), // returns an unsubscribe mock
  query: vi.fn(),
  getFirestore: vi.fn(),
}));

import { useGoogleMaps } from '../../hooks/useGoogleMaps';

describe('StadiumMap', () => {
  let mockSetData;
  let mockSetDirections;
  let mockRoute;
  
  beforeEach(() => {
    mockSetData = vi.fn();
    mockSetDirections = vi.fn();
    mockRoute = vi.fn((request, callback) => {
      callback({ routes: [] }, 'OK');
    });

    const mockGoogleApi = {
      maps: {
        Map: vi.fn(function() { return {}; }),
        LatLng: vi.fn(function(lat, lng) { return { lat, lng }; }),
        Marker: vi.fn(function() { return { addListener: vi.fn() }; }),
        InfoWindow: vi.fn(function() { return {
          setContent: vi.fn(),
          open: vi.fn(),
        }; }),
        DirectionsService: vi.fn(function() { return {
          route: mockRoute,
        }; }),
        DirectionsRenderer: vi.fn(function() { return {
          setMap: vi.fn(),
          setDirections: mockSetDirections,
        }; }),
        SymbolPath: { CIRCLE: 0 },
        TravelMode: { WALKING: 'WALKING' },
        visualization: {
          HeatmapLayer: vi.fn(function() { return {
            setData: mockSetData,
            setMap: vi.fn(),
          }; }),
        },
      },
    };

    useGoogleMaps.mockReturnValue({
      isLoaded: true,
      loadError: null,
      map: {},
      coreApi: mockGoogleApi,
    });
  });

  it('renders without crashing and announces loading state if not loaded', () => {
    useGoogleMaps.mockReturnValueOnce({ isLoaded: false });
    render(<StadiumMap />);
    expect(screen.getByText(/Loading Stadium Map.../i)).toBeDefined();
  });

  it('renders map div when API is loaded', () => {
    render(<StadiumMap />);
    // The inner div has aria-label="Interactive Stadium Map..."
    expect(screen.getByLabelText(/Interactive Stadium Map/i)).toBeDefined();
  });

  it('tests heatmap data update hook initializes', () => {
    vi.useFakeTimers();
    render(<StadiumMap />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(mockSetData).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('tests route calculation accessibility announce', () => {
    const mockAnnounce = vi.fn();
    render(<StadiumMap onRouteAnnounce={mockAnnounce} />);
    
    const { fireEvent } = require('@testing-library/react');
    const btn = screen.getByText(/Calculate Route to Burger Stand/i);
    fireEvent.click(btn);

    expect(mockRoute).toHaveBeenCalled();
    expect(mockSetDirections).toHaveBeenCalledWith({ routes: [] });
    expect(mockAnnounce).toHaveBeenCalledWith('A new optimal route has been calculated and displayed on the map.');
  });
});
