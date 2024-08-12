// @ts-ignore

import ColorThief from "@/node_modules/colorthief/dist/color-thief.mjs";

const colorThief = new ColorThief();

const GetImageColor = async (imgUrl: string): Promise<string> => {
  // Fetch the image data
  const response = await fetch(imgUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    // Create an Image object from the Blob
    const img = new Image();
    img.src = URL.createObjectURL(blob);

    // Ensure the image is loaded before using ColorThief
    img.onload = () => {
      try {
        const color = colorThief.getColor(img);
        const hexColor =
          "#" +
          color
            .map((component: number) => {
              const hex = component.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            })
            .join("");
        resolve(hexColor);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};

export default GetImageColor;
