import { icon } from "@comps/logo/icon";
import { Component, tkeron } from "@tkeron";
import css from "./header.css";

export interface header extends Component {

}

export const header = () => {
    const com = tkeron("header") as header;
    com.add(icon());
    return com;
};
tkeron.css("header", css);
