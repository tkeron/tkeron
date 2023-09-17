


export const injectCode = (html: string, code: string, id = "tkeron_script") => {

    return html.replace(/\<\/head\>/, `<script id='${id}'>${code}</script></head>`);
}


