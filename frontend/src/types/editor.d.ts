declare module '@editorjs/header' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  export default class Header implements BlockTool {
    constructor(config: any);
  }
}

declare module '@editorjs/list' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  export default class List implements BlockTool {
    constructor(config: any);
  }
}

declare module '@editorjs/checklist' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  export default class Checklist implements BlockTool {
    constructor(config: any);
  }
}

declare module '@editorjs/image' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  export default class Image implements BlockTool {
    constructor(config: any);
  }
} 