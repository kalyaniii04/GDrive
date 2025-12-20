import React, { useState } from "react";
import axios from "axios";
import "./fileUpload.css";

export default function FileUpload({ contract, account }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !contract || !account) {
      alert("Please connect wallet and select a file.");
      return;
    }

    console.log("api key", process.env.REACT_APP_PINATA_API_KEY);
    console.log("api secrect key", process.env.REACT_APP_PINATA_SECRET_API_KEY);

    try {
      setLoading(true);

      // Upload to Pinata
      const formData = new FormData();
      formData.append("file", file);

      const resFile = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // IPFS hash returned
      const imgHash = `ipfs://${resFile.data.IpfsHash}`;
      console.log("Uploaded to IPFS:", imgHash);

      // Send transaction to contract
      const tx = await contract.add(account, imgHash);
      console.log("Transaction sent:", tx.hash);

      await tx.wait(); // Wait until confirmed
      alert("✅ Successfully uploaded and stored on blockchain!");

      // Reset state
      setFileName("No image selected");
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      if (err.code === 4001) {
        alert("❌ Transaction rejected by user.");
      } else {
        alert("❌ Upload failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle file select
  const retriveFile = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const data = files[0];
    setFile(data);
    setFileName(data.name);
    console.log("Selected file:", data);
  };

  return (
    <div className="top">
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="file-upload" className="choose">
          Choose Image
        </label>
        <input
          disabled={!account}
          type="file"
          id="file-upload"
          name="data"
          onChange={retriveFile}
        />
        <span className="textArea">Image: {fileName}</span>
        <button type="submit" className="upload" disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
}
