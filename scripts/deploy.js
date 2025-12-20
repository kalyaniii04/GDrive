import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Upload = await hre.ethers.getContractFactory("Upload");
  const upload = await Upload.deploy();

  await upload.waitForDeployment(); // ✅ ethers v6 style

  console.log("Upload contract deployed to:", await upload.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
