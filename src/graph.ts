interface Edge<T> {
  from: T;
  to: T;
}

export default class Graph<T> {
  vertices: Set<T>;
  edges: Set<Edge<T>>;

  constructor() {
    this.vertices = new Set();
    this.edges = new Set();
  }

  addVertex(key: T) {
    this.vertices.add(key);
  }

  addEdge(from: T, to: T) {
    this.edges.add({ from, to });
  }
}
