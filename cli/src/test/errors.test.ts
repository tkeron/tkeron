import { join } from "path";
import { getDocument } from "../getDocument";

const front = join(__dirname, "..", "..", "front");
const web = join(__dirname, "..", "..", "web");

describe("jsdom errors", () => {
  it("custom error", async () => {
    const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>jsdom errors</title>
                <script>
                    throw "custom error";
                </script>
            </head>
            <body></body>
            </html>
        `;
    const { document } = getDocument(html);
    const node = document.querySelector(".tkeron_error");
    expect(node).toBeTruthy();
    expect(node.innerHTML).toMatch(/custom error/);
  });
});
