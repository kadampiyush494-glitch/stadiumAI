import { describe, it, expect } from 'vitest';
import { RoutingService } from './routingService';

const MOCK_GRAPH = {
  nodes: {
    'A': { x: 0, y: 0 },
    'B': { x: 1, y: 0 },
    'C': { x: 2, y: 0 },
    'D': { x: 1, y: 1 },
    'E': { x: 2, y: 1 }
  },
  edges: [
    { from: 'A', to: 'B', weight: 1 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'B', to: 'D', weight: 1 },
    { from: 'D', to: 'E', weight: 1 },
    { from: 'C', to: 'E', weight: 1 }
  ]
};

describe('RoutingService', () => {
  it('finds the shortest path on a clean graph', () => {
    const path = RoutingService.findPath('A', 'C', MOCK_GRAPH, {});
    expect(path).toEqual(['A', 'B', 'C']);
  });

  it('avoids blocked zones (density > 90)', () => {
    // Block node B? No, start and goal can't be blocked for this simple test
    // Let's block 'B' and see if it fails (since all routes from A go through B)
    const blockedB = { 'B': 95 };
    const path = RoutingService.findPath('A', 'C', MOCK_GRAPH, blockedB);
    expect(path).toBeNull();

    // Block 'C' on route A-B-C, should take A-B-D-E-C (if E-C existed)
    // Let's block 'D' and force A-B-C
    const blockedD = { 'D': 95 };
    const path2 = RoutingService.findPath('A', 'E', MOCK_GRAPH, blockedD);
    // Path: A -> B -> C -> E
    expect(path2).toEqual(['A', 'B', 'C', 'E']);
  });

  it('updates route dynamically based on density change', () => {
    const density1 = { 'C': 10 }; // A-B-C-E is shorter (or equal distance)
    const path1 = RoutingService.findPath('A', 'E', MOCK_GRAPH, density1);
    
    // Now make C very crowded (but not blocked) and D very empty
    const density2 = { 'C': 80, 'D': 0 };
    const path2 = RoutingService.findPath('A', 'E', MOCK_GRAPH, density2);
    
    // With high density at C, it should prefer D
    // A-B-D-E weight: (A-B:1) + (B-D:1) + (D-E:1) = 3
    // A-B-C-E weight: (A-B:1) + (B-C:1.8) + (C-E:1) = 3.8
    expect(path2).toEqual(['A', 'B', 'D', 'E']);
  });

  it('returns null for non-existent nodes', () => {
    expect(RoutingService.findPath('A', 'Z', MOCK_GRAPH)).toBeNull();
  });
});
