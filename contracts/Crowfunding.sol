pragma solidity >= 0.7 < 0.9.0;

contract Crowfunding {

    enum FundraingState { Open, Closed }

    struct Contribution {
        address contributor;
        uint value;
    }

    struct Project {
        string id;
        string name;
        string description;
        address payable author;
        FundraingState state;
        uint funds;
        uint fundraisingGoal;
    }

    Project[] public projects;
    mapping(string => Contribution[]) public contributions;

    event ProjectCreated(
        string id,
        string name,
        string description,
        uint _fundraisingGoal
    );
    
    event ProjectFunded(
        string projectId,
        uint value
    );

    event ProjectStateChanged(
        string id,
        FundraingState state
    );

    modifier isAuthor(uint projectIndex) {
        Project memory project = projects[projectIndex];
        require(msg.sender == project.author, "You need to be the project author");
        _;
    }

    modifier isNotAuthor(uint projectIndex) {
        Project memory project = projects[projectIndex];
        require(msg.sender != project.author, "As authour you cannot fund your own project");
        _;
    }

    function createProject(string memory _id, string memory _name, string memory _description, uint _fundraisingGoal) public {
        require(_fundraisingGoal > 0, "Fundrasing goal must be greater than 0");
        Project memory project = Project(_id, _name, _description, payable(msg.sender), FundraingState.Open, 0, _fundraisingGoal);
        projects.push(project);
        emit ProjectCreated(_id, _name, _description, _fundraisingGoal);
    }

    function fundProject(uint _projectIndex) public payable isNotAuthor(_projectIndex) {
        Project memory project = projects[_projectIndex];
        require(project.state != FundraingState.Closed, "The project cannot receive funds");
        require(msg.value > 0, "Fund value must be greater than 0");
        project.author.transfer(msg.value);
        project.funds += msg.value;

        contributions[project.id].push(Contribution(msg.sender, msg.value));

        emit ProjectFunded(project.id, msg.value);
    }

    function changeProjectState(FundraingState _newState, uint _projectIndex) public isAuthor(_projectIndex) {
        Project memory project = projects[_projectIndex];
        require(project.state != _newState, "New state must be different");
        projects[_projectIndex].state = _newState;
        emit ProjectStateChanged(project.id, _newState);
    }
}