import React, { useEffect, useState } from "react";
import "./modal.css";

export default function Modal({ setModalOpen, contract }) {
  const [address, setAddress] = useState("");
  const [accessList, setAccessList] = useState([]);

  // ✅ Fetch access list from contract
  const fetchAccessList = async () => {
    if (!contract) return;

    try {
      const list = await contract.shareAccess();
      // If contract returns array of struct { user, access }
      const formatted = list.map((item) => item.user ?? item);
      setAccessList(formatted);
    } catch (error) {
      console.error("Error fetching access list:", error);
    }
  };

  // ✅ Share file access
  const sharing = async () => {
    if (!contract) {
      alert("Wallet not connected. Please connect first!");
      return;
    }
    if (!address) {
      alert("Please enter an address first ⚠️");
      return;
    }

    try {
      const tx = await contract.allow(address);
      await tx.wait(); // wait for blockchain confirmation
      alert("File shared successfully ✅");
      setAddress("");
      fetchAccessList(); // refresh from blockchain
    } catch (error) {
      console.error("Error sharing file:", error);
      alert("Failed to share file. Check console for details.");
    }
  };

  // ✅ Remove access and instantly update UI
  const removeAccess = async (userAddress) => {
    if (!contract) {
      alert("Connect wallet first!");
      return;
    }

    try {
      const tx = await contract.disAllow(userAddress);
      await tx.wait();

      // ✅ Optimistically update list (remove user immediately)
      setAccessList((prev) => prev.filter((addr) => addr !== userAddress));

      alert(`Access removed for ${userAddress}`);
    } catch (error) {
      console.error("Error removing access:", error);
      alert("Failed to remove access.");
    }
  };

  // ✅ Load access list on component mount
  useEffect(() => {
    fetchAccessList();
  }, [contract]);

  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="title">Share Access</div>

        {!contract ? (
          <p style={{ color: "red" }}>Connect wallet to share files.</p>
        ) : (
          <>
            <div className="body">
              <input
                type="text"
                className="address"
                placeholder="Enter Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <form id="myForm">
              <label>People With Access:</label>
              <ul>
                {accessList.map((addr, idx) => (
                  <li key={idx} style={{ marginBottom: "5px" }}>
                    {addr}
                    <button
                      type="button"
                      style={{ marginLeft: "10px" }}
                      onClick={() => removeAccess(addr)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </form>

            <div className="footer">
              <button onClick={() => setModalOpen(false)} id="cancelBtn">
                Cancel
              </button>
              <button onClick={sharing}>Share</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
