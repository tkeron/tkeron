import { tkeron as t } from "../tkeron";


export const deferred = (msg: string) => {
    return t().setValue(msg);
};
