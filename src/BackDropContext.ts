import { IBackDropContext } from './interfaces/interfaces';

class BackDropContext implements IBackDropContext {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #id: string;
  #updateView: () => void;

  constructor(updateView: () => void) {
    this.#id = `__dropback_${Date.now()}`;
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
    this.#updateCanvasDimensions();

    this.#updateView();
  }

  show() {
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
