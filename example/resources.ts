
        //@ts-ignore
        globalThis.tkeron_resources = {} as any;
        export const resources = {"gif_skcustker":{"url":"/skcustker.gif"},"ico_skcustker":{"url":"/skcustker.ico"}};
        const r0 = JSON.parse(JSON.stringify(resources));
        

            Object.defineProperty(resources.gif_skcustker, "url", {
                get() {
                    //@ts-ignore
                    globalThis.tkeron_resources.gif_skcustker = "/skcustker.gif";
                    return r0.gif_skcustker.url;
                }
            });
       

            Object.defineProperty(resources.ico_skcustker, "url", {
                get() {
                    //@ts-ignore
                    globalThis.tkeron_resources.ico_skcustker = "/skcustker.ico";
                    return r0.ico_skcustker.url;
                }
            });
        
    