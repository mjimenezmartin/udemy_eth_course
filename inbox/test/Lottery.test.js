const assert = require('assert');
const ganache = require('ganache-cli'); //test provider
const Web3 = require('web3'); //we are requiring construction function that's why it's uppercase

const provider = ganache.provider();
const web3 = new Web3(provider); //instance

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach( async () => {
	// Get a list of all accounts
	accounts = await web3.eth.getAccounts();
					
	// Use one of those accounts to deploy the contract
	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
    
  lottery.setProvider(provider);
});

describe('Lottery contract', () => {
	it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });
  
  it('address is added to players', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })

    assert.equal(1, players.length);
    assert.equal(accounts[0], players[0]);
  });
  
  it('multiple addresses are added to players', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(3, players.length);
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
  });

  it('should throw an error because of the minimun ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 10 //is in wei
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('only manager can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('sends money to the winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    
    assert(difference > web3.utils.toWei('1.8', 'ether'));
    
    const contractBalance = await web3.eth.getBalance(lottery.options.address);
    assert(contractBalance == 0);
    
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    assert.equal(0, players.length);
  });
});
