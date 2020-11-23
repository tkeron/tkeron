import { tkeron as t } from "../tkeron";

export const front = () => t()
    .setValue("This node has been rendered on the frontend, by inline javascript code in the html document in a script tag.")
    .add(t({ value: "With this method you can make functionalities, with the backend you can only render to html and css." }));

