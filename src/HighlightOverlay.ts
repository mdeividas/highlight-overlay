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
  #elements: DOMRect[];
  #params: IBackDropParams;
  #cursor: { x: number; y: number };
  #mouseHandler: IMouseHandler;
  #lastTime: number;
  #timer: number;
  #animation: number;
  #backdropColor: number[];
  #backdropIncrement: number[];

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

  // TODO add animation to backdrop
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

    this.#elements.forEach((element) => {
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

  constructor(params?: IBackDropParams) {
    this.#context = new BackDropContext();
    this.#params = { ...defaultOptions, ...params, cursor: { ...defaultOptions.cursor, ...params?.cursor } };
    this.#elements = [];
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

    this.#backdropIncrement = this.#calculateBackdropIncrement();

    console.log(this.#backdropIncrement);
  }

  show(elements: NodeList) {
    this.#elements = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as Element;
      const rect = element.getBoundingClientRect();

      if (isVisible(element, rect)) {
        this.#elements.push({
          ...rect,
          x: rect.x - this.#params.offset,
          y: rect.y - this.#params.offset,
          width: rect.width + this.#params.offset * 2,
          height: rect.height + this.#params.offset * 2,
        });
      }
    }

    this.#context.show();
    this.#animate();
    this.#mouseHandler.mount();
  }

  hide() {
    this.#context.hide();

    this.#mouseHandler.unmount();

    this.#backdropColor = [0, 0, 0, 0];

    cancelAnimationFrame(this.#animation);
  }
}

export default HighlightOverlay;
