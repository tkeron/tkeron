export const componentItem = (name: string) => ({
  ts: `import { addCss, tk, TkeronElement } from "@tkeron";\nimport css from "./${name}.css";\n\n\nexport const ${name} = (): TkeronElement => {\n    const com = tk.addClass("${name}");\n\n    return com;\n};\n\naddCss(css);\n`,
  css: `.${name} {\n    \n}\n`,
});
export const pageItem = (name: string) => ({
  html: `<!DOCTYPE html>\n<html lang="en">\n\n<head>\n    <meta charset="UTF-8" />\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${name}</title>\n</head>\n\n<body></body>\n\n</html>`,
  ts: `import { tk } from "@tkeron";\n\n\ntk("h1").setText("h1 rendered in front (browser)").appendIn.body;\n`,
  back: `import { addCss, tk } from "@tkeron";\nimport css from "./${name}.page.css";\n\n\naddCss(css);\n\ntk("h1").setText("h1 rendered in back (pre rendered)").appendIn.body;\n`,
  css: `html, body {\n    margin: 0;\n    padding: 0;\n}\n`,
});

export const validItems = ["component", "c", "page", "p"];
