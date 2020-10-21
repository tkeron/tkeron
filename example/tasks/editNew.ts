import { tkeron as t } from "../tkeron";

export const editNew = (add: (task: string) => void) => {
    const r = t().addClass("editNew");
    const inp = t({ type: "input" }).addAttribute("type", "text");
    r.add(inp);
    const btn = t({ value: "ADD" }).addClass("add");
    const addf = () => {
        const v = inp.value.trim();
        if (v === "") return;
        add(inp.value);
        inp.value = "";
        btn.value = "ADD";
    };
    btn.getElement().addEventListener("click", addf);
    inp.getElement().addEventListener("keyup", e => {
        if (e.key !== "Enter") return;
        addf();
    });
    r.add(btn);
    return r;
};


t.css("editNew", `
    .editNew {
        align-items: center;
    }
    .editNew input {
        border-radius: 8px 0px 0px 8px;
        border: none;
    }
    .editNew .add {
        border-radius: 0px 8px 8px 0px;
        border: none;
        background: #0009;
        color: #fff;
        font-weight: bold;
        padding: 0px 5px;
        cursor: pointer;
        user-select: none;
    }
    .editNew .add:hover {
        background: #0f36;
    }
`);
