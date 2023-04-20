import { IBackDropContext } from './interfaces';

class BackDropContext implements IBackDropContext {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #id: string;

  constructor() {
    this.#id = `__dropback_${Date.now()}`;
  }

  show() {
    this.#canvas = document.createElement('canvas');
    this.#canvas.id = this.#id;
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
    this.#canvas.style.position = 'absolute';
    this.#canvas.style.top = '0';
    this.#canvas.style.left = '0';
    this.#canvas.style.zIndex = '99999';

    this.#ctx = this.#canvas.getContext('2d');

    document.body.append(this.#canvas);
  }

  hide() {
    document.getElementById(this.#id).remove();
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
