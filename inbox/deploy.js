const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'attitude flock segment noodle melody this erosion blood distance twist tobacco duty',
  'https://rinkeby.infura.io/v3/138bf250bfc04605b5ae5a46f32124c4'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
  // .deploy({ data: '0x' + bytecode, arguments: ['Hi there!'] }) //for Inbox.sol
  .deploy({ data: '0x' + bytecode })
  .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
};

deploy();