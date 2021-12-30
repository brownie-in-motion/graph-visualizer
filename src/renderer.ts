import Graph from './graph.js';

class r2vec {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  norm2() {
    return r2vec.dot(this, this);
  }

  norm() {
    return Math.sqrt(this.norm2());
  }

  add(a: r2vec) {
    this.x += a.x;
    this.y += a.y;
  }

  static dot(a: r2vec, b: r2vec): number {
    return a.x * b.x + a.y * b.y;
  }

  static multiply(a: r2vec, b: number): r2vec {
    return new r2vec(a.x * b, a.y * b);
  }

  static add(a: r2vec, b: r2vec): r2vec {
    return new r2vec(a.x + b.x, a.y + b.y);
  }

  static minus(a: r2vec, b: r2vec): r2vec {
    return r2vec.add(a, r2vec.multiply(b, -1));
  }

  static normalize(a: r2vec): r2vec {
    const length = a.norm();
    return r2vec.multiply(a, 1 / length);
  }
}

export class PhysicsRenderer<T> {
  graph: Graph<T>;
  positions: Map<T, r2vec>;
  ctx: CanvasRenderingContext2D;

  constructor(graph: Graph<T>, canvas: HTMLCanvasElement) {
    this.graph = graph;
    this.positions = new Map<T, r2vec>();
    this.ctx = canvas.getContext('2d')!;
  }

  update(elapsed: number) {
    const c1 = 0.01;
    const c2 = 1;
    const c3 = 1000;
    const c4 = 20 * elapsed;

    const forces = new Map<T, r2vec>();

    for (const vertex of this.graph.vertices) {
      for (const other of this.graph.vertices) {
        if (vertex === other) continue;

        const difference = r2vec.minus(
          this.positions.get(other)!,
          this.positions.get(vertex)!
        );

        if (!forces.has(other)) forces.set(other, new r2vec(0, 0));

        forces
          .get(other)!
          .add(
            r2vec.multiply(
              r2vec.normalize(difference),
              Math.min(0.1, c3 / difference.norm2())
            )
          );
      }
    }

    for (const { to, from } of this.graph.edges) {
      const difference = r2vec.minus(
        this.positions.get(to)!,
        this.positions.get(from)!
      );

      const force = r2vec.multiply(
        r2vec.normalize(difference),
        c1 * Math.log(difference.norm() / c2)
      );

      forces.get(to)!.add(r2vec.multiply(force, -1));
      forces.get(from)!.add(force);
    }

    for (const [vertex, force] of forces.entries()) {
      this.positions.get(vertex)!.add(r2vec.multiply(force, c4));
    }
  }

  draw(elapsed: number) {
    const canvas = new r2vec(
      this.ctx.canvas.parentElement!.clientWidth,
      this.ctx.canvas.parentElement!.clientHeight
    );

    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvas.x, canvas.y);

    for (const vertex of this.graph.vertices) {
      if (!this.positions.has(vertex)) {
        // slight offset to get rid of extra equilibria
        this.positions.set(
          vertex,
          new r2vec(
            canvas.x / 4 + (Math.random() * canvas.x) / 2,
            canvas.y / 4 + (Math.random() * canvas.y) / 2
          )
        );
      }
    }

    this.update(elapsed);

    for (const vertex of this.graph.vertices) {
      const { x, y } = this.positions.get(vertex)!;
      this.ctx.fillStyle = 'black';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
      this.ctx.fill();

      for (const { from, to } of this.graph.edges) {
        const { x: x1, y: y1 } = this.positions.get(from)!;
        const { x: x2, y: y2 } = this.positions.get(to)!;
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    }
  }
}
