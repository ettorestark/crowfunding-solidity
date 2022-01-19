const { ethers } = require('hardhat');

async function main() {
    const Crowfunding = await ethers.getContractFactory('Crowfunding');
    const crowfunding = await Crowfunding.deploy();
    await crowfunding.deployed();

    console.log('Crowfunding contract deployed to: ', crowfunding.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });