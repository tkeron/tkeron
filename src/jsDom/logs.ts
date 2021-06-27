
const writeLogElement = (message: string, document: Document) => {
    if (!document.head.querySelector(".tkeron_back_logs_css")) {
        const css = document.createElement("style");
        css.classList.add("tkeron_back_logs_css");
        css.innerHTML = `
            .tkeron_back_logs {
                font-family: consolas;
                position: fixed;
                top: 10px;
                left: 10px;
                color: #fa69;
                font-weight: bold;
            }
            .tkeron_error {
                background: #0009;
                padding: 20px;
            }
            .tkeron_log {
                background: #0009;
                padding: 20px;
                color: #fff9;
            }
        `;
        document.head.appendChild(css);
        const div = document.createElement("tkeron_back_logs");
        div.innerHTML = "TKERON BACK LOGS:";
        div.classList.add("tkeron_back_logs");
        document.body.appendChild(div);
    }
    const container = document.body.querySelector(".tkeron_back_logs");
    const div = document.createElement("div");
    div.classList.add("tkeron_log");
    if (typeof message !== "string") div.innerHTML = JSON.stringify(message, null, 4);
    else div.innerHTML = message;
    container.appendChild(div);
};

export const handleLogs = (logs: any[], document: Document) => {
    for (const log of logs) {
        writeLogElement(log, document);
    }
};
