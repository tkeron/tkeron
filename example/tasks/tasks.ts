import { Component, tkeron as t } from "../tkeron";
import { editNew } from "./editNew";
import { task } from "./task";


export const tasks = () => {
    const cont = t().addClass("cont");
    const store = {
        tasks: [] as Component[],
        add: (tsk: string) => {
            const ctsk = task(tsk, store.remove);
            store.tasks.push(ctsk);
            cont.add(ctsk);
        },
        remove: (tsk: Component) => {
            store.tasks = store.tasks.filter(tk => tk.id !== tsk.id);
            cont.remove(tsk);
        }
    };
    const r = t()
        .add(
            t({ type: "h2", value: "Example task UI" }),
            editNew(store.add),
            cont
        )
        .addClass("taskui");
    return r;
};

t.css("tasks", `
    .taskui {
        height: auto;
        min-height: 300px;
        border-radius: 5px;
        border: 2px solid #fff9;
        background: #fff6;
        flex-direction: column;
        width: 100%;
        justify-content: start;
        align-items: center;
    }
    .taskui .cont {
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
    }
`);

