import { JSDOM } from "jsdom";
import { pageItem } from "../generateItems";
import { handleLogs } from "../jsDom/logs";


describe("logs", () => {
    it("handleLogs", async () => {
        const logs = ["log 1", "log B", "log 3"];
        const { window } = new JSDOM(pageItem("test").html, { runScripts: "dangerously", resources: "usable" });
        const { document } = window;
        await new Promise(ok => document.addEventListener("load", ok));
        handleLogs(logs, document);
        const logNodes = document.querySelectorAll(".tkeron_log");
        expect(logNodes).toHaveLength(3);
        const [log1, log2, log3] = logNodes;
        expect(log1.innerHTML).toBe(logs[0]);
        expect(log2.innerHTML).toBe(logs[1]);
        expect(log3.innerHTML).toBe(logs[2]);
    });
});
