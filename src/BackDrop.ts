import { IBackDropParams, IBackDropContext, IBackDrop, IMouseHandler } from './interfaces';
import MouseHandler from './MouseHandler';
import BackDropContext from './BackDropContext';
import { isVisible } from './utils/isVisible';

const defaultOptions: Partial<IBackDropParams> = {
  offset: 3,
  close: 'always',
  backDropColor: [0, 0, 0, 0.3],
  cursor: {
    enabled: false,
    size: 15,
  },
};

class BackDrop implements IBackDrop {
  #context: IBackDropContext;
  #elements: DOMRect[];
  #params: IBackDropParams;
  #cursor: { x: number; y: number };
  #mouseHandler: IMouseHandler;

  // TODO add animation to backdrop
  #draw() {
    const ctx = this.#context.getCtx();
    const width = this.#context.getWidth();
    const height = this.#context.getHeight();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    // Set fill style for fillRect
    ctx.fillStyle = `rgba(${this.#params.backDropColor.toString()})`;
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
    if (this.#params.close === 'onBackDrop') {
      const alpha = this.#context.getCtx().getImageData(event.clientX, event.clientY, 1, 1).data[3];

      if (alpha !== 0) {
        this.close();
      }
    } else {
      this.close();
    }
  }

  constructor(params?: IBackDropParams) {
    this.#context = new BackDropContext();
    this.#params = { ...defaultOptions, ...params, cursor: { ...defaultOptions.cursor, ...params?.cursor } };
    this.#elements = [];
    this.#cursor = { x: 0, y: 0 };

    this.#mouseHandler = new MouseHandler({
      cursorMonitoring: this.#params.cursor.enabled,
      onMove: this.#updateCursor.bind(this),
      onClick: this.#handleClick.bind(this),
    });
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
    this.#draw();
    this.#mouseHandler.mount();
  }

  close() {
    this.#context.hide();

    this.#mouseHandler.unmount();
  }
}

export default BackDrop;
