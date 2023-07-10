const hre = require("hardhat");

let artist

async function main() {
  [artist] = await ethers.getSigners()
  const NAME = "AI Generated NFT"
  const SYMBOL = "AINFT"
  const COST = ethers.utils.parseUnits("1", "ether") // 1 ETH
  const METADATA_URL = "https://ipfs.io/ipfs/bafyreigdrzlwrga2e6uf3daxwns573eejo7rifzxed4w5iaeszruchsjoy/metadata.json"
  const ROYALTY_FEE = 500 // 5%

  const NFT = await ethers.getContractFactory("RoyaltyNFT")
  const nft = await NFT.deploy(NAME, SYMBOL, COST, ROYALTY_FEE)
  await nft.deployed()

  console.log(`Deployed NFT Contract at: ${nft.address}`)

  const Marketplace = await ethers.getContractFactory("Marketplace")
  const marketplace = await Marketplace.deploy(nft.address)
  await marketplace.deployed()

  console.log(`Deployed Marketplace Contract at: ${marketplace.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
