const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("RoyaltyNFT", () => {
  const NAME = "AI Generated Royalty NFT"
  const SYMBOL = "AINFT"
  const METADATA_URL = "https://ipfs.io/ipfs/bafyreigdrzlwrga2e6uf3daxwns573eejo7rifzxed4w5iaeszruchsjoy/metadata.json"
  const COST = tokens(1) // 1 ETH
  const ROYALTY_FEE = 100 // 5%

  let deployer, artist, minter
  let nft

  beforeEach(async () => {
    [deployer, artist, minter] = await ethers.getSigners()

    const NFT = await ethers.getContractFactory("RoyaltyNFT")
    nft = await NFT.deploy(NAME, SYMBOL, COST, ROYALTY_FEE)

    // Mint 
    // const transaction1 = await nft.connect(deployer).mintNFT(deployer.address, METADATA_URL, "Monkey shoe", "Print Monkey on a shoe")
    // await transaction1.wait()

    const transaction2 = await nft.connect(deployer).mintNFTWithRoyalty(deployer.address, METADATA_URL, artist.address, ROYALTY_FEE, "Monkey shoe", "Print Monkey on a shoe", { value: COST })
    await transaction2.wait()

  })

  describe('Deployment', () => {
    it('Returns owner', async () => {
      const result = await nft.owner()
      expect(result).to.be.equal(deployer.address)
    })

    it('Returns cost', async () => {
      let result = await nft.cost()
      expect(result).to.be.equal(COST)
    })
  })

  describe('Minting', () => {
    it('Returns owner', async () => {
      const result = await nft.ownerOf("1")
      expect(result).to.be.equal(deployer.address)
    })

    it('Returns URI', async () => {
      const result = await nft.tokenURI("1")
      expect(result).to.be.equal(METADATA_URL)
    })

    it('Updates total supply', async () => {
      const result = await nft.totalSupply()
      expect(result).to.be.equal("1")
    })
    it("should support the ERC721 and ERC2198 standards", async () => {
      //const royalPetsInstance = await RoyalPets.deployed();
      const ERC721InterfaceId = "0x80ac58cd";
      const ERC2981InterfaceId = "0x2a55205a";
      var isERC721 = await nft.supportsInterface(ERC721InterfaceId);
      var isER2981 = await nft.supportsInterface(ERC2981InterfaceId);
      expect(isERC721, "RoyalPets is not an ERC721").to.be.equal(true);
      expect(isER2981, "RoyalPets is not an ERC2981").to.be.equal(true);
    })
    it("should return the correct royalty info when specified and burned", async () => {
      await nft.connect(deployer).mintNFT(deployer.address, "ipfs://CID-0/", "Monkey shoe", "Print Monkey on a shoe");
      // Override royalty for this token to be 5% and paid to a different account
      await nft.connect(deployer).mintNFTWithRoyalty(deployer.address, "ipfs://CID-1/", artist.address, 1000, "Monkey shoe", "Print Monkey on a shoe", { value: COST });

      const defaultRoyaltyInfo = await nft.royaltyInfo(1, 1000);
      var tokenRoyaltyInfo = await nft.royaltyInfo(2, 1000);
      const owner = await nft.owner();
      expect(defaultRoyaltyInfo[0], "Default receiver is not the owner").to.be.equal(owner)
      // Default royalty percentage taken should be 1%. 
      expect(defaultRoyaltyInfo[1].toNumber(), "Royalty fee is not 10").to.be.equal(10);
      expect(tokenRoyaltyInfo[0], "Royalty receiver is not a different account").to.be.equal(artist.address);
      // Default royalty percentage taken should be 1%. 
      expect(tokenRoyaltyInfo[1].toNumber(), "Royalty fee is not 10").to.be.equal(10);

      //Royalty info should be set back to default when NFT is burned
      await nft.burnNFT(1);
      tokenRoyaltyInfo = await nft.royaltyInfo(1, 1000);
      expect(tokenRoyaltyInfo[0], "Royalty receiver has not been set back to default").to.be.equal(owner);
      expect(tokenRoyaltyInfo[1].toNumber(), "Royalty has not been set back to default").to.be.equal(10);
    })
  })
})
