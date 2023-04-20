export interface IBackDropContext {
  getCtx(): CanvasRenderingContext2D;
  getWidth(): number;
  getHeight(): number;
  show(): void;
  hide(): void;
}

export type IMouseMoveHandler = (x: number, y: number) => void;

export interface IMouseParams {
  cursorMonitoring?: boolean;
  onMove(x: number, y: number): void;
  onClick(e: any): void; //todo
}

export interface IMouseHandler {
  mount(): void;
  unmount(): void;
}

export interface IBackDropParams {
  offset?: number;
  close?: 'always' | 'onBackDrop';
  backDropColor?: number[];
  cursor?: {
    enabled?: boolean;
    size?: number;
  };
}

export interface IBackDropOptions {
  offset?: number;
  cursor?: {
    enabled?: boolean;
    size?: number;
  };
}

export interface IBackDrop {
  show(elements: NodeList): void;
}
