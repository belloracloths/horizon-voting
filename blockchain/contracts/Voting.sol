// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Voting is ERC2771Context {
    address public admin;

    mapping(address => bool) public isWhitelisted;
    
    mapping(address => mapping(uint256 => bool)) public hasVotedForPosition;
    
    mapping(uint256 => uint256) public candidateVotes;

    event VoterWhitelisted(address voter);
    event VoteCast(address voter, uint256 positionId, uint256 candidateId);

    modifier onlyAdmin() {
        require(_msgSender() == admin, "Only admin can perform this action");
        _;
    }

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {
        admin = _msgSender();
    }

    function whitelistVoter(address _voter) public onlyAdmin {
        require(!isWhitelisted[_voter], "Voter is already whitelisted");
        isWhitelisted[_voter] = true;
        emit VoterWhitelisted(_voter);
    }

    function vote(uint256 _positionId, uint256 _candidateId) public {
        address currentVoter = _msgSender(); 

        require(isWhitelisted[currentVoter], "You are not an eligible voter");
        
        require(!hasVotedForPosition[currentVoter][_positionId], "You have already voted for this position");

        hasVotedForPosition[currentVoter][_positionId] = true;
        
        candidateVotes[_candidateId]++;

        emit VoteCast(currentVoter, _positionId, _candidateId);
    }

    function getCandidateVotes(uint256 _candidateId) public view returns (uint256) {
        return candidateVotes[_candidateId];
    }
}