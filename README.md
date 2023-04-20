# Highlight Overlay
This is a tiny vanilla JavaScript library that can be used to apply overlays with highlighted areas on web pages. It is not tied to any particular framework and can be easily integrated into any framework.

## Usage
```
// Create an instance of overlay
const highlightOverlay = new HighlightOverlay();

// Show the overlay
highlightOverlay.show(document.querySelectorAll(`#element-1, #element-2`));

// In case the cloing is controlled by consumer:
highlightOverlay.hide();
```

<details>
  <summary>Using in react</summary>

  ```js
    import React from 'react';
    import HighlightOverlay from 'highlight-overlay-js';
    
    const highlightOverlay = new HighlightOverlay();
    
    export const HyHeader: React.FC = () => (
        <div>
            <h1 id="myHeader">My header title</h1>
    
            <button onClick={() => highlightOverlay.show(document.querySelectorAll('#myHeader'))}>Highlight</button>
        </div>
    )
    
    highlightOverlay.show(document.querySelectorAll('#myHeader'));
  ```
</details>

## Methods
| Method | Description                                                                     |
|--------|---------------------------------------------------------------------------------|
| show   | Is required to provide a list of elements to which highlight should be applied. |
| hide   | Method used for controlled hiding of overlay.                                   |


## Parameters
| Name           | Default value     | Type       | Description                                            |
|----------------|-------------------|------------|--------------------------------------------------------|
| offset         | 3                 | number     | Defines transparent area's offset size.                |
| close          | CloseTypes.ALWAYS | CloseTypes | Defines closing logic behavior.                        |
| backDropColor  | [0, 0, 0, 0.3]    | number[]   | Defines overlay color. Is required to use rgba format. |
| cursor.enabled | false             | boolean    | Enables cursor highlight.                              |
| cursor.size    | 15                | number     | Defines radius size of cursor highlight.               |

### Enums 
| Name | Value | Description                                                   |
|------|-------|---------------------------------------------------------------|
|  CloseTypes    |   BACKDROP    | Closes overlay when click is clicked on non-transparent area  |
|      |   ALWAYS    | Closes overlay on any click                                   |
|      |   NONE    | Ignores any click and persists overlay till is closed manually |

## Add example showcases 

### Todos
- [ ] Add support for resize screen
- [ ] Clear cursor position after losing screen view port
- [ ] Add backdrop animation
