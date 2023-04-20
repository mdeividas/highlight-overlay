import { IMouseHandler, IMouseParams } from './interfaces/interfaces';

// TODo handle mouse leaving the area
class MouseHandler implements IMouseHandler {
  #x: number;
  #y: number;
  #params: IMouseParams;

  #handleMouse(event: MouseEvent) {
    this.#x = event.clientX;
    this.#y = event.clientY;

    this.#params.onMove(this.#x, this.#y);
  }

  constructor(params: IMouseParams) {
    this.#params = params;
  }

  mount() {
    if (this.#params.cursorMonitoring) {
      window.addEventListener('mousemove', this.#handleMouse.bind(this));
    }

    window.addEventListener('click', this.#params.onClick);
  }

  unmount() {
    window.removeEventListener('mousemove', this.#handleMouse.bind(this));
    window.removeEventListener('click', this.#params.onClick);
  }
}

export default MouseHandler;
