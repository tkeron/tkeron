// Augment global scope for .pre.ts files
declare module "*.pre.ts" {
  global {
    const document: Document;
  }
}

// Augment global scope for .com.ts files
declare module "*.com.ts" {
  global {
    const com: HTMLElement;
  }
}
