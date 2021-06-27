
export const componentItem = (name: string) =>
({
    ts: `import { tkeron, Component } from "@tkeron";\nimport css from "./${name}.css";\n\nexport interface ${name} extends Component {\n    \n}\n\nexport const ${name} = () => {\n    const com = tkeron("${name}") as ${name};\n    \n    return com;\n};\ntkeron.css("${name}",css);\n`,
    css: `.${name} {\n    \n}\n`
});
export const pageItem = (name: string) => ({
    html: `<!DOCTYPE html>\n<html lang="en">\n    <head>\n    <meta charset="UTF-8" />\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${name}</title>\n    </head>\n    <body></body>\n</html>\n`,
    ts: `import { tkeron } from "@tkeron";\n\ntkeron({type:"h1",value:"${name} page front works"}).appendIn("body")`,
    back: `import { tkeron } from "@tkeron";\n\ntkeron({type:"h1",value:"${name} page back works"}).appendIn("body")`,
    css: `html, body {\n    margin: 0;\n    padding: 0;\n}\n`
});

export const validItems = ["component", "c", "page", "p"];


