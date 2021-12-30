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

const vertices = Array(8)
  .fill(0)
  .map((_v, i) => i);

for (const vertex of vertices) {
  graph.addVertex(vertex);
}

for (const v1 of vertices) {
  for (const v2 of vertices) {
    if (v1 == v2) continue;
    if (Math.random() < 0.2) {
      graph.addEdge(v1, v2);
    }
  }
}

let previous: number;
const run = (timestamp: number) => {
  if (previous === undefined) previous = timestamp;
  renderer.draw(timestamp - previous);
  previous = timestamp;
  requestAnimationFrame(run);
};
requestAnimationFrame(run);
