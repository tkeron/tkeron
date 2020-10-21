import { Component, tkeron as t } from "../tkeron";

export const task = (value: string, remove: (c: Component) => void) => {
    const del = t({ value: "X" }).addClass("del");
    const r = t().addClass("task");
    const val = t().addClass("value");
    val.getElement().innerText = value; 
    r.add(
        val,
        del
    );
    del.getElement().addEventListener("click", () => {
        remove(r);
    });
    return r;
};

t.css("task", `
    .task {
        border: 1px solid #fff;
        border-radius: 8px;
        padding: 5px;
        width: 100%;
        justify-content: space-between;
    }
    .task .del {
        background: #0009;
        user-select: none;
        cursor: pointer;
        padding: 5px;
        border: none;
        border-radius: 8px;
    }
    .task .del:hover {
        background: #f309;
    }
`);
