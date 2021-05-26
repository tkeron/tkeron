import { main } from "../main";


describe("main", () => {
    it("command build", async () => {
        main("tk", ["build"]);
    });
});

