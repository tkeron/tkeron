import { logo } from "./comps/logo/logo";
import { tkeron } from "./tkeron";


tkeron()
    .add(logo())
    .add(tkeron({ type: "h1", value: "Welcome to tkeron!!!" }))
    .appendIn("body");



