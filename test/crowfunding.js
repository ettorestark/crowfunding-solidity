const { expect, should } = require('chai');
const { ethers } = require('hardhat');

const project = {
  id: '27c84d49-ba75-4454-bf89-91ac5301c95f',
  name: 'Crowfunding Project',
  description: 'Lorem ipsum dolor sit amet',
  fundraisingGoal: '1000000000000000000'
};

describe('Crowfunding contract', () => {
  let Crowfunding, crowfunding, owner, account;

  before(async () => {
    Crowfunding = await ethers.getContractFactory('Crowfunding');
    crowfunding = await Crowfunding.deploy();

    [owner, user] = await ethers.getSigners();
  });

  describe('Project creation', async () => {
    it('should be reverted if fundraising goal is not greater than 0 ', async () => {
      await expect(
        crowfunding.createProject(project.id, project.name, project.description, 0)
      )
      .to.be.revertedWith('Fundrasing goal must be greater than 0');
    });

    it('shoud emit ProjectCreated event', async () => {
      await expect(
        crowfunding.createProject(project.id, project.name, project.description, project.fundraisingGoal)
      )
        .to.emit(crowfunding, 'ProjectCreated')
        .withArgs(project.id, project.name, project.description, project.fundraisingGoal);
    });

    it('should have at least one project in projects array', async () => {
      const project = await crowfunding.projects(0);
      await expect(project).to.be.not.a('null');
    });
  });

  describe('Change project state', async () => {
    it('shoud be reverted if the new project state is equal to the previous one', async () => {
      await expect(
        crowfunding.changeProjectState(0, 0)
      )
      .to.be.revertedWith('New state must be different');
    });

    it('should emit ProjectStateChanged event', async () => {
      await expect(
        crowfunding.changeProjectState(1, 0)
      )
      .to.emit(crowfunding, 'ProjectStateChanged')
      .withArgs(project.id, 1);
    });

  });

  describe('Project funding', async () => {
    it('Should be reverted if authour is trying to fund his own project', async () => {
      await crowfunding.changeProjectState(0, 0)

      await expect(
        crowfunding.fundProject(0, { value: ethers.utils.parseEther('1') })
      )
      .to.be.revertedWith('As authour you cannot fund your own project');
    });

    it('Should be reverted if fund value is equal or less than zero', async () => {
      await expect(
        crowfunding.connect(user).fundProject(0, { value: ethers.utils.parseEther('0') })
      )
      .to.be.revertedWith('Fund value must be greater than 0');
    });

    it('should emit ProjectFunded event', async () => {
      const amount = ethers.utils.parseEther('1');

      await expect(
        crowfunding.connect(user).fundProject(0, { value: amount })
      )
      .to.emit(crowfunding, 'ProjectFunded')
      .withArgs(project.id, amount);
    });

    it('Should be reverted if project state is equal to closed', async () => {
      await crowfunding.changeProjectState(1, 0);

      await expect(
        crowfunding.connect(user).fundProject(0, { value: ethers.utils.parseEther('1') })
      )
      .to.be.revertedWith('The project cannot receive funds');
    });
  }); 
});