/**
 * routingService.js
 * Implements A* pathfinding for stadium navigation with density awareness.
 */

export class RoutingService {
  /**
   * Finds the optimal path between two nodes in the stadium graph.
   * @param {string} start - Start node ID.
   * @param {string} goal - Goal node ID.
   * @param {Object} graph - The stadium graph structure { nodes, edges }.
   * @param {Object} densityMap - Current zone densities { nodeId: value }.
   * @returns {Array<string>|null} List of node IDs representing the path, or null if no path.
   */
  static findPath(start, goal, graph, densityMap = {}) {
    if (!graph.nodes[start] || !graph.nodes[goal]) return null;

    const openSet = [start];
    const cameFrom = {};
    
    const gScore = {}; // Cost from start to current node
    const fScore = {}; // Estimated total cost (g + h)
    
    Object.keys(graph.nodes).forEach(id => {
      gScore[id] = Infinity;
      fScore[id] = Infinity;
    });

    gScore[start] = 0;
    fScore[start] = this._heuristic(start, goal, graph);

    while (openSet.length > 0) {
      // Get node in openSet with lowest fScore
      let current = openSet.reduce((a, b) => fScore[a] < fScore[b] ? a : b);

      if (current === goal) {
        return this._reconstructPath(cameFrom, current);
      }

      openSet.splice(openSet.indexOf(current), 1);

      const neighbors = graph.edges
        .filter(e => e.from === current || e.to === current)
        .map(e => e.from === current ? e.to : e.from);

      for (const neighbor of neighbors) {
        // Accessibility Check: Avoid highly congested zones (>90% density)
        if (densityMap[neighbor] > 90) continue;

        const weight = graph.edges.find(e => 
          (e.from === current && e.to === neighbor) || 
          (e.to === current && e.from === neighbor)
        ).weight || 1;

        // Penalty for moderate density
        const densityFactor = 1 + (densityMap[neighbor] || 0) / 50;
        const tentativeGScore = gScore[current] + (weight * densityFactor);

        if (tentativeGScore < gScore[neighbor]) {
          cameFrom[neighbor] = current;
          gScore[neighbor] = tentativeGScore;
          fScore[neighbor] = gScore[neighbor] + this._heuristic(neighbor, goal, graph);
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return null;
  }

  static _heuristic(a, b, graph) {
    const nodeA = graph.nodes[a];
    const nodeB = graph.nodes[b];
    // Euclidean distance
    return Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2));
  }

  static _reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (cameFrom[current]) {
      current = cameFrom[current];
      totalPath.unshift(current);
    }
    return totalPath;
  }
}
