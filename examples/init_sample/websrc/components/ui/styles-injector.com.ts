import { join } from "path";

const css = await Bun.file(join(__dirname, "../../styles/main.css")).text();

com.innerHTML = `<style>${css}</style>`;
