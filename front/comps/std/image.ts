import { Component, tkeron as t } from "@tkeron";

export const enum imageType {
  gif = "image/gif",
  png = "image/png",
  jpg = "image/jpeg",
  bmp = "image/bmp",
  webp = "image/webp",
  svg = "image/svg+xml",
  avif = "image/avif",
  ico = "image/x-icon",
}

export interface imageSource {
  url: string;
  type: imageType;
}

export interface image extends Component {
  setWidth: (width: string) => image;
  setHeight: (height: string) => image;
  onClick: (fn: () => void) => image;
}

export const image = (alt: string, width: string, height: string, ...images: imageSource[]) => {
  const com = t({ type: "picture" }).addClass("image") as image;
  const img = t({ type: "img" });
  img.addAttribute("alt", alt);
  img.addAttribute("src", images[0].url);
  images.forEach((imgSource) => {
    const Img = t({ type: "source" });
    Img.addAttribute("type", imgSource.type);
    Img.addAttribute("srcset", imgSource.url);
    com.add(Img);
  });
  com.setWidth = (width: string) => {
    img.getElement().style.width = width;
    return com;
  };
  com.setHeight = (height: string) => {
    img.getElement().style.height = height;
    return com;
  };
  com.setWidth(width);
  com.setHeight(height);
  com.add(img);
  com.onClick = (fn) => {
    com.addClass("clickable");
    com.getElement().addEventListener("click", fn);
    return com;
  };
  return com;
};

t.css("image", `
  picture.image {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  picture.image.clickable {
    cursor: pointer;
  }
`);
