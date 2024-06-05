import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalise(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function createSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\-]/g, "-");
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price / 100);
}

export function getImageDimensions(
  image: File,
): Promise<{ width: number; height: number; dataURL: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function () {
      const dataURL = reader.result as string;
      var img = new Image();
      img.onload = function () {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          dataURL,
        });
      };
      img.src = dataURL;
    };
    reader.readAsDataURL(image);
  });
}
