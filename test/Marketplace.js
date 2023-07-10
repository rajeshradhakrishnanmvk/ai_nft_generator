const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Marketplace", () => {
  const NAME = "Famous Paintings"
  const SYMBOL = "PAINT"
  const METADATA_URL = "ipfs://CID/"
  const ROYALTY_FEE = 500 // 5%
  const COST = ethers.utils.parseUnits("1", "ether")

  let deployer, artist, minter, buyer
  let nft, marketplace

  beforeEach(async () => {
    [deployer, artist, minter, buyer] = await ethers.getSigners()

    const NFT = await ethers.getContractFactory("RoyaltyNFT")
    nft = await NFT.deploy(NAME, SYMBOL, COST, ROYALTY_FEE)

    const Marketplace = await ethers.getContractFactory("Marketplace")
    marketplace = await Marketplace.deploy(nft.address)

    // let transaction = await nft.connect(deployer).mintNFT(minter.address, METADATA_URL, "Monkey shoe", "Print Monkey on a shoe")
    // await transaction.wait()

    let transaction = await nft.connect(deployer).mintNFTWithRoyalty(minter.address, METADATA_URL, artist.address, ROYALTY_FEE, "Monkey shoe", "Print Monkey on a shoe", { value: COST })
    await transaction.wait()

    transaction = await nft.connect(minter).approve(marketplace.address, 1)
    await transaction.wait()

    transaction = await marketplace.connect(minter).list(1, COST)
    await transaction.wait()
  })

  describe('Deployment', () => {
    it('Returns the NFT address', async () => {
      const result = await marketplace.nft()
      expect(result).to.equal(nft.address)
    })
  })

  describe('Buying & Royalty', () => {
    let minterBalanceBefore, buyerBalanceBefore, artistBalanceBefore

    beforeEach(async () => {
      minterBalanceBefore = await ethers.provider.getBalance(minter.address)
      buyerBalanceBefore = await ethers.provider.getBalance(buyer.address)
      artistBalanceBefore = await ethers.provider.getBalance(artist.address)

      const transaction = await marketplace.connect(buyer).buy(1, { value: COST })
      await transaction.wait()
    })

    it('Sends royalty fee to artist', async () => {
      const result = await ethers.provider.getBalance(artist.address)
      console.log("artist address: " + artist.address)
      console.log("artist balance: " + result)
      expect(result).to.be.equal("10000050000000000000000") // 0.05 ETH (5% of 1 ETH)
    })

    it('Check royalty fee to artist', async () => {
      var tokenRoyaltyInfo = await nft.royaltyInfo(2, ROYALTY_FEE);
      expect(tokenRoyaltyInfo[0], "Royalty receiver is not a different account").to.be.equal(artist.address);
      // Default royalty percentage taken should be 1%. 
      expect(tokenRoyaltyInfo[1].toNumber(), "Royalty fee is not 25").to.be.equal(25);
      console.log("royalty address: " + tokenRoyaltyInfo[0])

    })

    it('Updates the original minter\'s balance', async () => {
      const result = await ethers.provider.getBalance(minter.address)
      console.log("minter address: " + minter.address)
      console.log("minter balance: " + result)
      expect(result).to.be.greaterThan((minterBalanceBefore))
    })

    it('Updates the buyer\'s balance', async () => {
      const result = await ethers.provider.getBalance(buyer.address)
      console.log("buyer address: " + buyer.address)
      console.log("buyer balance: " + result)
      expect(result).to.be.lessThan(buyerBalanceBefore)
    })

    it('Updates ownership', async () => {
      const result = await nft.ownerOf(1)
      expect(result).to.equal(buyer.address)
    })
  })
})