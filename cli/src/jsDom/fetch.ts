import { DOMWindow } from "jsdom";

export const ext_fetch = (window: DOMWindow) => {
  //@ts-ignore
  window.fetch = async () => {
    return {
      json: async () => ({}),
      text: async () => "",
    } as Response;
  };
};
