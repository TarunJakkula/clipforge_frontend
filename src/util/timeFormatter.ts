export const formatTime = (timeInSeconds: number) =>
  `${
    timeInSeconds / 60 < 10
      ? "0" + Math.floor(timeInSeconds / 60)
      : Math.floor(timeInSeconds / 60)
  }:${
    timeInSeconds % 60 < 10 ? "0" + (timeInSeconds % 60) : timeInSeconds % 60
  }`;
