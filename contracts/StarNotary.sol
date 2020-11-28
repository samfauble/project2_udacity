pragma solidity >=0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    string _name;
    string _symbol;

    constructor (string memory name, string memory symbol) ERC721(_name, _symbol) public {
      _symbol = symbol;
      _name = name;
    }

    struct Star {
        string name;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    mapping(address => uint256) public accounts;

    modifier isOwnerOf (uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender);
        _;
    }

    modifier isExchangeOwner (uint256 token1, uint256 token2) {
        require(ownerOf(token1) == msg.sender || ownerOf(token2) == msg.sender);
        _;
    }

    function getName () public view returns (string memory) {
        return _name;
    }

    function getSymbol () public view returns (string memory) {
        return _symbol;
    }

    // Looks up a star by Id and returns the name
    function lookUpTokenIdToStarInfo(uint256 tokenId) public view returns (string memory starName) {
        starName = tokenIdToStarInfo[tokenId].name;
        return starName;
    }

    // exchanges stars between 2 addresses
    function exchangeStars (uint256 tokenId1, uint256 tokenId2) public isExchangeOwner (tokenId1, tokenId2) returns (bool success) {
        address client1 = ownerOf(tokenId1);
        address client2 = ownerOf(tokenId2);

        transferFrom(client1, client2, tokenId1);
        transferFrom(client2, client1, tokenId2);

        success = true;
    }

    // transfers a star from sender to another address
    function transferStar (address to, uint256 tokenId) public isOwnerOf(tokenId) returns (bool success) {
        transferFrom(msg.sender, to, tokenId);
        success = true;
    }

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId, address owner) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(owner, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] >=0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value >= starCost, "You need to have enough Ether");
        transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value >= starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function getMsgSender() public view returns(address) {
        return msg.sender;
    }

}