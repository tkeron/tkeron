


export const injectCode = (html: string, code: string) => html.replace(/\<\/head\>/, `<script>${code}</script></head>`);


