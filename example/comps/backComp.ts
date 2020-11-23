import { tkeron as t } from "../tkeron";

const value = "Tkeron is a microframework for develop web user interfaces.";

export const back = () => t()
    .setValue(value)
    .add(t({ type: "p" })
        .setValue("Up to this point everything has been rendered on the backend.")
    )
    .css(`
        border: 2px solid #fff;
        color: #fff;
        background: #0009;
        padding: 10px;
        border-radius: 8px;
        user-select: none;
    `);

