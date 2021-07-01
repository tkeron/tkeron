

export const writeLogElement = (message: string, document: Document, type: "tkeron_log" | "tkeron_error" = "tkeron_log") => {
    let tkeronBackLogs = document.body.querySelector(".tkeron_back_logs") || document.createElement("div");
    if (!document.body.querySelector(".tkeron_back_logs")) {
        tkeronBackLogs.classList.add("tkeron_back_logs");
        tkeronBackLogs.innerHTML = "TKERON BACK LOGS:";
        if (document.body) document.body.appendChild(tkeronBackLogs);
        else document.addEventListener("load", () => document.body.appendChild(tkeronBackLogs));
    }
    if (!document.head.querySelector(".tkeron_back_logs_css")) {
        const css = document.createElement("style");
        css.classList.add("tkeron_back_logs_css");
        css.innerHTML = `
            .tkeron_back_logs {
                font-family: consolas;
                position: fixed;
                top: 10px;
                left: 10px;
                width: calc(100% - 20px);
                color: #fff;
                background: #310c;
                font-weight: bold;
                padding: 10px;
                box-sizing: border-box;
                border: 1px solid #fff;
            }
            .tkeron_error {
                background: #0009;
                padding: 20px;
                color: #f66c;
            }
            .tkeron_log {
                background: #0009;
                padding: 20px;
                color: #fff9;
            }
        `;
        document.head.appendChild(css);
    }
    const messageNode = document.createElement("div");
    messageNode.classList.add(type);
    messageNode.innerHTML = message;
    tkeronBackLogs.appendChild(messageNode);
};
