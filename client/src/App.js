import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import Fileupload from "./components/fileUpload.js";
import Display from "./components/display.js";
import Modal from "./components/modal.js";

import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Connect wallet and setup contract
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found! Please install MetaMask.");
      return;
    }

    try {
      const newProvider = new BrowserProvider(window.ethereum);

      // Get connected accounts
      let accounts = await newProvider.send("eth_accounts", []);
      if (accounts.length === 0) {
        try {
          accounts = await newProvider.send("eth_requestAccounts", []);
        } catch (err) {
          if (err.code === -32002) {
            alert("MetaMask connection request already open. Please approve it.");
          } else {
            console.error("User rejected connection:", err);
          }
          return;
        }
      }

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const signer = await newProvider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const contractInstance = new Contract(contractAddress, Upload.abi, signer);

        setContract(contractInstance);
        setProvider(newProvider);
        console.log("Connected contract:", contractInstance);
      }

      // Reload page if network changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) setAccount(accounts[0]);
      else setAccount("");
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  return (
    <>
      {/* Share Button */}
      {!modalOpen && (
        <button 
          className="share" 
          onClick={() => setModalOpen(true)}
          disabled={!contract} // Only enable if wallet connected
        >
          Share
        </button>
      )}

      {/* Modal */}
      {modalOpen && <Modal setModalOpen={setModalOpen} contract={contract} />}

      {/* App Container */}
      <div className="app-wrapper">
        <div className="app-container">
          <h1>GDrive 3.0</h1>

          {account ? (
            <p>Connected: {account}</p>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}

          <br />
          <br />

          <Fileupload account={account} provider={provider} contract={contract} />
        </div>

        {/* Display Section */}
        <Display account={account} contract={contract} />
      </div>
    </>
  );
}

export default App;
