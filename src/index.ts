import { PhysicsRenderer as Renderer } from './renderer.js';
import Graph from './graph.js';

const resize = (canvas: HTMLCanvasElement) => {
  const scale = window.devicePixelRatio;
  const parent = canvas.parentElement!;
  const size = [parent.clientWidth, parent.clientHeight];
  const ctx = canvas.getContext('2d')!;

  canvas.width = size[0] * scale;
  canvas.height = size[1] * scale;

  ctx.scale(scale, scale);
};

await new Promise((res) => {
  window.addEventListener('load', res);
});

const canvas = document.querySelector('canvas')!;

window.addEventListener('resize', () => resize(canvas));
resize(canvas);

const graph = new Graph<number>();
const renderer = new Renderer<number>(graph, canvas);

const vertices = Array(10)
  .fill(0)
  .map((_v, i) => i);

for (const vertex of vertices) {
  graph.addVertex(vertex);
}

for (const vertex of vertices) {
  console.log(vertex, (vertex + 1) % vertices.length);
  graph.addEdge(vertex, (vertex + 1) % vertices.length);
}

let previous: number;
const run = (timestamp: number) => {
  if (previous === undefined) previous = timestamp;
  renderer.draw(timestamp - previous);
  previous = timestamp;
  requestAnimationFrame(run);
};
requestAnimationFrame(run);
