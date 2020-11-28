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

it('should exchange the stars of 2 users', async () => {
    //setup
    let instance = await StarNotary.deployed();
    let owner1 = await instance.getMsgSender();
    let owner2 = accounts[1];
    let id1 = 123;
    let id2 = 456;
    await instance.createStar("pretty star", id1, owner1);
    await instance.createStar("grand star", 456, owner2); 
    
    //assert before exchange
    let beforeTestOwner1 = await instance.ownerOf(id1);
    let beforeTestOwner2 = await instance.ownerOf(id2);
    assert.equal(beforeTestOwner1, owner1);
    assert.equal(beforeTestOwner2, owner2);

    await instance.exchangeStars(id1, id2);

    //after exchange
    let testOwner1 = await instance.ownerOf(id1);
    let testOwner2 = await instance.ownerOf(id2);
    assert.equal(testOwner1, owner2);
    assert.equal(testOwner2, owner1);
});

it('should transfer a star to another user', async () => {
    //setup
    let instance = await StarNotary.deployed();
    let owner1 = owner;
    let owner2 = accounts[1];
    let id1 = 123456;
    await instance.createStar("pretty star", id1, owner1);

    
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
    await instance.createStar('Awesome Star!', tokenId, accounts[0])
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = await instance.getMsgSender();
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, user1);
    await instance.putStarUpForSale(starId, starPrice);
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = await instance.getMsgSender();
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".00", "ether");
    let gasPrice = web3.utils.toWei("1148220000000000", "wei");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, user1);
    await instance.putStarUpForSale(starId, starPrice);
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId);
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) - Number(starPrice) - Number(gasPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = await instance.getMsgSender();
    let user2 = await instance.getMsgSender();
    let starId = 4;
    let starPrice = web3.utils.toWei(".00", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, user1);
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
    await instance.createStar('awesome star', starId, user1);
    await instance.putStarUpForSale(starId, starPrice);
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId);
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });