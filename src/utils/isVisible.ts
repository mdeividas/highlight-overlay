const getScrollableElement = (element: Element, iteration = 0): Element => {
  if (element.scrollHeight > element.clientHeight) {
    return element;
  }

  if (iteration < 5) {
    return getScrollableElement(element.parentNode as Element, iteration + 1);
  }

  return null;
};

export const isVisible = (element: Element, bounds: DOMRect) => {
  const scrollableElement = getScrollableElement(element as Element) || (element.parentNode as Element);

  const parentBounds = scrollableElement.getBoundingClientRect();

  return bounds.y < parentBounds.y + parentBounds.height;
};
