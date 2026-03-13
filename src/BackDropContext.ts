import { IBackDropContext } from './interfaces/interfaces';

class BackDropContext implements IBackDropContext {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #id: string;
  #updateView: () => void;
  #delay: number;
  #timeout: number;

  constructor(updateView: () => void, delay = 0) {
    this.#id = `__dropback_${Date.now()}`;
    this.#delay = delay;
    this.#updateView = updateView;
  }

  #updateCanvasDimensions() {
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = Math.max(
      window.innerHeight,
      document.body.scrollHeight,
      document.documentElement?.scrollHeight,
    );
  }

  #onResize() {
    window.clearTimeout(this.#timeout);

    this.#timeout = window.setTimeout(() => {
      this.#updateCanvasDimensions();

      this.#updateView();
    }, this.#delay);
  }

  show() {
    const existing = document.getElementById(this.#id) as HTMLCanvasElement;

    if (existing) {
      this.#canvas = existing;
      this.#ctx = this.#canvas.getContext('2d');
      this.#updateCanvasDimensions();
      return;
    }

    this.#canvas = document.createElement('canvas');
    this.#canvas.id = this.#id;
    this.#canvas.style.position = 'absolute';
    this.#canvas.style.top = '0';
    this.#canvas.style.left = '0';
    this.#canvas.style.zIndex = '99999';
    this.#updateCanvasDimensions();

    this.#ctx = this.#canvas.getContext('2d');

    document.body.append(this.#canvas);

    window.addEventListener('resize', this.#onResize.bind(this));
  }

  isUpdate() {
    return !!document.getElementById(this.#id);
  }

  hide() {
    document.getElementById(this.#id).remove();

    window.removeEventListener('resize', this.#onResize.bind(this));
  }

  getCtx() {
    return this.#ctx;
  }

  getWidth() {
    return this.#canvas.width;
  }

  getHeight() {
    return this.#canvas.height;
  }
}

export default BackDropContext;
