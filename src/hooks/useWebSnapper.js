import { useState } from "react";
import Papa from "papaparse";

const THUM_IO_BASE = "https://api.thum.io/get";

export function useWebSnapper() {
  const [urls, setUrls] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [screenshots, setScreenshots] = useState({});

  const handleTextInput = (e) => {
    const list = e.target.value.split("\n").map((url) => url.trim()).filter(Boolean);
    setUrls(list);
    setStatusMap(Object.fromEntries(list.map((url) => [url, "Pending"])));
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const parsedUrls = results.data.flat().filter(Boolean);
          setUrls(parsedUrls);
          setStatusMap(Object.fromEntries(parsedUrls.map((url) => [url, "Pending"])));
        }
      });
    }
  };

  const startCapture = async () => {
    for (const url of urls) {
      setStatusMap((prev) => ({ ...prev, [url]: "Capturing" }));
      try {
        const screenshotUrl = `${THUM_IO_BASE}/width/800/crop/600/${encodeURIComponent(url)}`;
        const res = await fetch(screenshotUrl);
        if (!res.ok) throw new Error("Failed to fetch");
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setScreenshots((prev) => ({ ...prev, [url]: { blob, objectUrl } }));
        setStatusMap((prev) => ({ ...prev, [url]: "Completed" }));
      } catch (err) {
        setStatusMap((prev) => ({ ...prev, [url]: "Failed" }));
      }
    }
  };

  const resetAll = () => {
    setUrls([]);
    setStatusMap({});
    setScreenshots({});
  };

  return {
    urls,
    statusMap,
    screenshots,
    handleTextInput,
    handleCSVUpload,
    startCapture,
    resetAll,
  };
}