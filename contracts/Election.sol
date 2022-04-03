// SPDX-License-Identifier: UNLICENSED
pragma solidity  ^0.7.4;

contract Election {
    // read/write candidate
    string public candidate;

    // constructor
    constructor() public {
        // candidate = "candidate 1";
        addCandidate("c1");
        addCandidate("c2");
    }

    // candidate model
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // read/write candidates
    mapping(uint => Candidate) public candidates;

    // candidates count
    uint public candidatesCount;

    function addCandidate(string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // store accounts that have voted
    mapping(address => bool) public voters;

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

    event votedEvent(
        uint indexed _candidateId
    );
}