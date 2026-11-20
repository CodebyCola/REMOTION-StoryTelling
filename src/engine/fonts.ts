import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontsReady = Promise.all([
  loadFont({
    family: "Plus Jakarta Sans",
    url: staticFile("fonts/plus-jakarta-sans-latin-600-normal.woff2"),
    weight: "600",
  }),
  loadFont({
    family: "Plus Jakarta Sans",
    url: staticFile("fonts/plus-jakarta-sans-latin-700-normal.woff2"),
    weight: "700",
  }),
  loadFont({
    family: "Silkscreen",
    url: staticFile("fonts/silkscreen-latin-400-normal.woff2"),
    weight: "400",
  }),
  loadFont({
    family: "Silkscreen",
    url: staticFile("fonts/silkscreen-latin-700-normal.woff2"),
    weight: "700",
  }),
]);
