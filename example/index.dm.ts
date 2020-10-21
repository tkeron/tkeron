import { tkeron } from "./tkeron";
import { deferred } from "./comps/deferred";
import { tasks } from "./tasks/tasks";

tkeron().add(
    tkeron({ value: "This is rendered from a deferred module." }),
    deferred("Also this is deferred..."),
    tkeron({ value: "This method also allows you to make functionalities, just like inline code, since they are executed in the browser." }),
    tasks()
).appendIn("body")
    .css(`
        background: #0007;
        color: #fff;
        padding: 10px;
        width: 100%;
        flex-wrap: wrap;
    `);
