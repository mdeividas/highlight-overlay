import { IBackDrop, IBackDropContext, IBackDropParams, IMouseHandler } from './interfaces/interfaces';
import MouseHandler from './MouseHandler';
import BackDropContext from './BackDropContext';
import { isVisible } from './utils/isVisible';
import { CloseTypes } from './interfaces/enums';

// TODO add params validation
const defaultOptions: Partial<IBackDropParams> = {
  offset: 3,
  duration: 100,
  close: CloseTypes.ALWAYS,
  backDropColor: [0, 0, 0, 0.3], // RGBA
  cursor: {
    enabled: false,
    size: 15,
  },
};

class HighlightOverlay implements IBackDrop {
  #context: IBackDropContext;
  #elementsBounds: DOMRect[];
  #elements: NodeList;
  #params: IBackDropParams;
  #cursor: { x: number; y: number };
  #mouseHandler: IMouseHandler;
  #lastTime: number;
  #timer: number;
  #animation: number;
  #backdropColor: number[];
  #backdropIncrement: number[];
  #isVisible: boolean;

  static FRAME_INTERVAL = 1000 / 60;

  #isAnimated() {
    return this.#backdropColor.every((value, index) => value >= this.#params.backDropColor[index]);
  }

  #calculateBackdropIncrement() {
    const numberOfIterations = this.#params.duration / HighlightOverlay.FRAME_INTERVAL;

    return this.#params.backDropColor.map((value) => value / numberOfIterations);
  }

  #increaseBackdropValues() {
    return this.#backdropColor.map((value, index) => {
      if (value < this.#params.backDropColor[index]) {
        return value + this.#backdropIncrement[index];
      }

      return value;
    });
  }

  #draw() {
    const ctx = this.#context.getCtx();
    const width = this.#context.getWidth();
    const height = this.#context.getHeight();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    // Set fill style for fillRect
    ctx.fillStyle = `rgba(${this.#backdropColor.toString()})`;
    // Reset to default globalCompositeOperation
    ctx.globalCompositeOperation = 'source-over';
    // Set background for whole canvas
    ctx.fillRect(0, 0, width, height);
    // Apply destination-out operation
    ctx.globalCompositeOperation = 'destination-out';
    // draw arc
    ctx.fillStyle = 'black';

    this.#elementsBounds.forEach((element) => {
      ctx.fillRect(element.x, element.y, element.width, element.height);
    });

    ctx.stroke();

    if (this.#params.cursor.enabled) {
      ctx.arc(this.#cursor.x, this.#cursor.y, this.#params.cursor.size, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  #updateCursor(x: number, y: number) {
    this.#cursor.x = x;
    this.#cursor.y = y;

    this.#draw();
  }

  #handleClick(event: MouseEvent) {
    if (!this.#isVisible) {
      return;
    }

    switch (this.#params.close) {
      case CloseTypes.NONE:
        return;
      case CloseTypes.ALWAYS:
        return this.hide();
      case CloseTypes.BACKDROP:
        const alpha = this.#context.getCtx().getImageData(event.clientX, event.clientY, 1, 1).data[3];

        if (alpha !== 0) {
          this.hide();
        }

        return;
    }
  }

  #animate(timestamp = 0) {
    const deltaTime = timestamp - this.#lastTime;

    if (this.#isAnimated()) {
      this.#isVisible = true;
      cancelAnimationFrame(this.#animation);
    }

    if (this.#timer > HighlightOverlay.FRAME_INTERVAL) {
      this.#draw();

      this.#backdropColor = this.#increaseBackdropValues();

      this.#timer = 0;
    } else {
      this.#timer += deltaTime;
    }

    this.#lastTime = timestamp;
    this.#animation = requestAnimationFrame(this.#animate.bind(this));
  }

  #calculateBounds() {
    for (let i = 0; i < this.#elements.length; i++) {
      const element = this.#elements[i] as Element;
      const rect = element.getBoundingClientRect();

      if (isVisible(element, rect)) {
        this.#elementsBounds.push({
          ...rect,
          x: rect.x - this.#params.offset,
          y: rect.y - this.#params.offset,
          width: rect.width + this.#params.offset * 2,
          height: rect.height + this.#params.offset * 2,
        });
      }
    }
  }

  #onResize() {
    this.#elementsBounds = [];

    this.#calculateBounds();

    this.#draw();
  }

  constructor(params?: IBackDropParams) {
    this.#context = new BackDropContext(this.#onResize.bind(this));
    this.#params = { ...defaultOptions, ...params, cursor: { ...defaultOptions.cursor, ...params?.cursor } };
    this.#elementsBounds = [];
    this.#cursor = { x: 0, y: 0 };
    this.#timer = 0;
    this.#lastTime = 0;
    this.#backdropColor = [0, 0, 0, 0];
    this.#backdropIncrement = [];
    this.#mouseHandler = new MouseHandler({
      cursorMonitoring: this.#params.cursor.enabled,
      onMove: this.#updateCursor.bind(this),
      onClick: this.#handleClick.bind(this),
    });
    this.#isVisible = false;
    this.#backdropIncrement = this.#calculateBackdropIncrement();
  }

  show(elements: NodeList) {
    this.#elements = elements;
    this.#elementsBounds = [];

    this.#calculateBounds();

    this.#context.show();
    this.#animate();
    this.#mouseHandler.mount();
  }

  hide() {
    this.#backdropColor = [0, 0, 0, 0];
    this.#isVisible = false;

    this.#context.hide();

    this.#mouseHandler.unmount();

    cancelAnimationFrame(this.#animation);
  }
}

export default HighlightOverlay;
