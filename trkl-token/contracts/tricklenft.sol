// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TrickleNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Trickle NFT", "TNFT") {}

    function mint(address to) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        _tokenIds.increment();
        return newItemId;
    }
}