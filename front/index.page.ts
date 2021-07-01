import { tkeron } from "@tkeron";

tkeron({ type: "h1", value: "This element was rendered on the frontend" })
    .css(`color: red;`)
    .appendIn("body");