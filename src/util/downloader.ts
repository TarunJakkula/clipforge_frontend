export const handleDownload =
  (videoLink: string, videoName: string, extension: ".mp4" | ".mp3") =>
  async () => {
    try {
      const response = await fetch(videoLink);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = videoName + extension;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };
