import { tkeron } from "@tkeron";

tkeron({ type: "h1", value: "This element was rendered in the backend" })
    .css(`color: blue;`)
    .appendIn("body");