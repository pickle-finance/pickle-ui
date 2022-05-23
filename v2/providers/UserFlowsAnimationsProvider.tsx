import { VFC, useEffect } from "react";

/**
 * There is no support for generating blurred placeholders
 * for animated GIFs in Next.js. Instead, we preload them
 * so they can render almost instantly.
 */
const images = [
  "/animations/working.gif",
  "/animations/waiting.gif",
  "/animations/success.gif",
  "/animations/failure.gif",
];

const preloadImage = (url: string) => {
  const img = new Image();
  img.src = url;
};

const UserFlowsAnimationsProvider: VFC = () => {
  useEffect(() => {
    images.forEach(preloadImage);
  }, []);

  return null;
};

export default UserFlowsAnimationsProvider;
