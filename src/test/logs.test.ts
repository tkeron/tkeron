import { JSDOM } from "jsdom";
import { handleLogs } from "../jsDom/logs";


describe("logs", () => {
    it("handleLogs", async () => {
        const logs = ["log 1", "log B", "log 3"];
        const { window } = new JSDOM(null, { runScripts: "dangerously", resources: "usable" });
        const { document } = window;
        handleLogs(logs, document);
        const logNodes = document.querySelectorAll(".tkeron_log");
        const [log1, log2, log3] = logNodes;
        expect(log1.innerHTML).toBe(logs[0]);
        expect(log2.innerHTML).toBe(logs[1]);
        expect(log3.innerHTML).toBe(logs[2]);
    });
});
