import { join } from "path";

const css = await Bun.file(join(__dirname, "styles.css")).text();

com.innerHTML = `<style>${css}</style>`;
