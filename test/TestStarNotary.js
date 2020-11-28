const chai = require("chai");
const assert = chai.assert;

const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('should return contract name', async () => {
    let instance = await StarNotary.deployed();
    let name = await instance.getName();
    assert.equal(name, "SparklyStars");
});

it('should return contract symbol', async () => {
    let instance = await StarNotary.deployed();
    let symbol = await instance.getSymbol();
    assert.equal(symbol, "SS");
});

it('should transfer a star to another user', async () => {
    //setup
    let instance = await StarNotary.deployed();
    let owner1 = owner;
    let owner2 = accounts[1];
    let id1 = 123456;
    await instance.createStar("pretty star", id1);

    
    //assert before exchange
    let beforeTestOwner1 = await instance.ownerOf(id1);
    assert.equal(beforeTestOwner1, owner1);

    await instance.transferStar(owner2, id1);

    //after exchange
    let testOwner1 = await instance.ownerOf(id1);
    assert.equal(testOwner1, owner2);
});


it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId)
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = await instance.getMsgSender();
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId);
    await instance.putStarUpForSale(starId, starPrice);
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = await instance.getMsgSender();
    let user2 = await instance.getMsgSender();
    let starId = 4;
    let starPrice = web3.utils.toWei(".00", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId);
    await instance.putStarUpForSale(starId, starPrice);
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId);
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = await instance.getMsgSender();
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".00", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId);
    await instance.putStarUpForSale(starId, starPrice);
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId);
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });