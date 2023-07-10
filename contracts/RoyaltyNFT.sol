// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RoyaltyNFT is ERC721URIStorage, ERC2981, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(string => uint8) existingURIs;

    address public artist;
    uint96 public royaltyFee;
    uint256 public cost;

    struct TransactionStruct {
        uint256 id;
        address owner;
        uint256 cost;
        string title;
        string description;
        string metadataURI;
        uint256 timestamp;
    }

    TransactionStruct[] minted;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint96 _royaltyFee
    ) ERC721(_name, _symbol) {
        cost = _cost;
        artist = msg.sender;
        _setDefaultRoyalty(artist, _royaltyFee);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }

    function burnNFT(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    function mintNFT(
        address recipient,
        string memory tokenURI,
        string memory title,
        string memory description
    ) public onlyOwner returns (uint256) {
        require(existingURIs[tokenURI] == 0, "This NFT is already minted!");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        minted.push(
            TransactionStruct(
                newItemId,
                msg.sender,
                cost,
                title,
                description,
                tokenURI,
                block.timestamp
            )
        );
        existingURIs[tokenURI] = 1;

        return newItemId;
    }

    function mintNFTWithRoyalty(
        address recipient,
        string memory tokenURI,
        address royaltyReceiver,
        uint96 feeNumerator,
        string memory title,
        string memory description
    ) public payable onlyOwner returns (uint256) {
        require(msg.value >= cost);

        uint256 tokenId = mintNFT(recipient, tokenURI, title, description);
        _setTokenRoyalty(tokenId, royaltyReceiver, feeNumerator);

        return tokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function getAllNFTs() external view returns (TransactionStruct[] memory) {
        return minted;
    }
}
