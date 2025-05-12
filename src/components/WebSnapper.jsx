// src/components/WebSnapper.jsx


import React, { useState } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import Button from './ui/Button'; // Ensure this path is correct

const THUM_IO_BASE = "https://image.thum.io"; // Base URL for the API
const API_KEY = import.meta.env.VITE_API_KEY; // Use the API key from the .env file

export default function WebSnapper() {
  const [urls, setUrls] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [screenshots, setScreenshots] = useState({});

  const processUrls = (lines) => {
    const filteredLines = lines.filter(line => line.trim());
    setUrls(filteredLines);
    const initialStatus = {};
    filteredLines.forEach(url => (initialStatus[url] = 'Pending'));
    setStatusMap(initialStatus);
  };

  const handleTextAreaChange = (e) => {
    const lines = e.target.value.split('\n');
    processUrls(lines);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const lines = reader.result.split('\n').map(line => line.trim());
        processUrls(lines);
      } catch (err) {
        console.error("Error processing CSV file:", err);
        alert("Invalid CSV file. Please try again.");
      }
    };
    reader.readAsText(file);
  };

  const startCapture = async () => {
    for (const url of urls) {
      setStatusMap((prev) => ({ ...prev, [url]: "Capturing" }));
      try {
        const screenshotUrl = `${THUM_IO_BASE}/get/auth/${API_KEY}/${url}`;

        const response = await fetch(screenshotUrl, {

        });
        if (!response.ok) throw new Error("Failed to fetch");
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setScreenshots((prev) => ({ ...prev, [url]: { blob, objectUrl } }));
        setStatusMap((prev) => ({ ...prev, [url]: "Completed" }));
      } catch (err) {
        setStatusMap((prev) => ({ ...prev, [url]: "Failed" }));
      }
    }
  };

  const downloadScreenshot = (url) => {
    console.log(`Attempting to download for ${url}`);
    const screenshot = screenshots[url];
    if (!screenshot || !screenshot.blob) {
      console.error("No blob found for URL:", url);
      return;
    }
    const filename = `${new URL(url).hostname}.png`;
    saveAs(screenshot.blob, filename);
  };


  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    for (const [url, { blob }] of Object.entries(screenshots)) {
      const filename = `${new URL(url).hostname}.png`;
      zip.file(filename, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'screenshots.zip');
  };

  const cleanupScreenshots = () => {
    Object.values(screenshots).forEach(({ objectUrl }) => {
      URL.revokeObjectURL(objectUrl);
    });
  };

  const resetAll = () => {
    cleanupScreenshots();
    setUrls([]);
    setStatusMap({});
    setScreenshots({});
  };

  return (
    <div className="p-4 space-y-4 max-w-full overflow-x-auto">
      <h1 className="text-xl font-bold text-center">WebSnapper</h1>
      <a href= "https://t.me/@prince_lion97">How can  contact me?</a>

      <textarea
        rows={10}
        spellCheck={false}
        className="w-full p-2 border rounded animate-border"
        placeholder="Paste URLs here, one per line"
        onChange={handleTextAreaChange}
      />
      <div className="relative inline-block">
        <label
          htmlFor="file-upload"
          className="block px-4 py-2 border border-blue-500 rounded-lg bg-blue-500 text-white cursor-pointer transition-transform transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Choose File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={startCapture}>Start Capture</Button>
        <Button onClick={downloadAllAsZip}>Download All as ZIP</Button>
        <Button onClick={resetAll} variant="destructive">Reset</Button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full mt-4 border text-sm">
          <thead>
            <tr>
              <th className="border px-2">URL</th>
              <th className="border px-2">Status</th>
              <th className="border px-2">Preview</th>
              <th className="border px-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url, index) => (
              <tr key={`${url}-${index}`}>
                <td className="border px-2 max-w-[200px] truncate">
                  <span title={url}>{url}</span>
                </td>
                <td className="border px-2">{statusMap[url]}</td>
                <td className="border px-2">
                  {statusMap[url] === 'Completed' && (
                    <img
                      src={screenshots[url]?.objectUrl}
                      alt="screenshot"
                      className="w-24"
                    />
                  )}
                </td>
                <td className="border px-2">
                  {statusMap[url] === 'Completed' && (
                    <Button onClick={() => downloadScreenshot(url)}>Download</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
