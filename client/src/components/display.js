import React, { useState } from "react";
import "./display.css";

export default function Display({ contract, account }) {
  const [images, setImages] = useState([]);
  const [otherAddress, setOtherAddress] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // 🔹 For modal

  const getData = async () => {
    if (!contract) {
      alert("Contract not connected!");
      return;
    }

    try {
      const dataArray = await contract.display(otherAddress || account);
      console.log("Fetched from contract:", dataArray);

      if (dataArray.length === 0) {
        alert("No image to display");
        setImages([]);
        return;
      }

      const imgs = dataArray.map((item, i) => {
        const cleanUrl = item.startsWith("ipfs://")
          ? `https://gateway.pinata.cloud/ipfs/${item.slice(7)}`
          : item;

        return (
          <img
            src={cleanUrl}
            key={i}
            alt="Uploaded"
            onClick={() => setSelectedImage(cleanUrl)} // 🔹 open modal
          />
        );
      });

      setImages(imgs);
    } catch (err) {
      console.error("Error fetching images:", err);
      alert("You don't have access to this Account.");
    }
  };

  return (
    <>
      <div className="image-list">{images}</div>

      <input
        type="text"
        placeholder="Enter Address"
        className="address"
        value={otherAddress}
        onChange={(e) => setOtherAddress(e.target.value)}
      />

      <button className="center-button" onClick={getData}>
        Get Data
      </button>

      {/* 🔹 Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Enlarged" />
            <button
              className="close-button"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
