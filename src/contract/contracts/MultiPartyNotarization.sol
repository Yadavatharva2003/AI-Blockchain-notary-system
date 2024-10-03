// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiPartyNotarization {
    // Event emitted when a party signs the document
    event DocumentSigned(
        bytes32 indexed documentHash,
        address indexed signer,
        uint256 timestamp
    );

    // Event emitted when a document is fully notarized (all parties have signed)
    event DocumentFullyNotarized(
        bytes32 indexed documentHash,
        uint256 timestamp
    );

    // Struct to store information about the document and its signers
    struct NotarizedDocument {
        address[] requiredSigners; // List of required signers for the document
        mapping(address => bool) hasSigned; // Tracks which addresses have signed
        uint256 signCount; // Number of signers who have signed
        bool isFullyNotarized; // Status indicating whether the document is fully notarized
        uint256 notarizationTime; // Timestamp when the document is fully notarized
    }

    // Mapping to store notarized documents by their hash
    mapping(bytes32 => NotarizedDocument) public documents;

    // Modifier to ensure that the sender is one of the required signers
    modifier onlyRequiredSigner(bytes32 documentHash) {
        require(
            isRequiredSigner(documentHash, msg.sender),
            "You are not a required signer for this document."
        );
        _;
    }

    // Function to initialize a document with its required signers
    function initializeDocument(
        bytes32 documentHash,
        address[] memory signers
    ) external {
        require(
            documents[documentHash].requiredSigners.length == 0,
            "Document already initialized."
        );
        require(signers.length > 1, "At least two signers are required.");

        // Create a new NotarizedDocument with the list of required signers
        NotarizedDocument storage doc = documents[documentHash];
        doc.requiredSigners = signers;
    }

    // Function to sign the document as a required signer
    function signDocument(
        bytes32 documentHash
    ) external onlyRequiredSigner(documentHash) {
        NotarizedDocument storage doc = documents[documentHash];

        // Ensure the document is not fully notarized yet
        require(!doc.isFullyNotarized, "Document is already fully notarized.");
        // Ensure the signer hasn't signed yet
        require(
            !doc.hasSigned[msg.sender],
            "You have already signed this document."
        );

        // Mark the signer as having signed
        doc.hasSigned[msg.sender] = true;
        doc.signCount++;

        // Emit event for document signing
        emit DocumentSigned(documentHash, msg.sender, block.timestamp);

        // If all required parties have signed, mark the document as fully notarized
        if (doc.signCount == doc.requiredSigners.length) {
            doc.isFullyNotarized = true;
            doc.notarizationTime = block.timestamp;
            emit DocumentFullyNotarized(documentHash, block.timestamp);
        }
    }

    // Function to verify whether a document is fully notarized
    function isFullyNotarized(
        bytes32 documentHash
    ) external view returns (bool) {
        return documents[documentHash].isFullyNotarized;
    }

    // Function to check whether an address is a required signer for a document
    function isRequiredSigner(
        bytes32 documentHash,
        address signer
    ) public view returns (bool) {
        NotarizedDocument storage doc = documents[documentHash];
        for (uint i = 0; i < doc.requiredSigners.length; i++) {
            if (doc.requiredSigners[i] == signer) {
                return true;
            }
        }
        return false;
    }

    // Helper function to hash the document off-chain (optional; typically done by AI or off-chain systems)
    function hashDocument(
        string memory documentContent
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(documentContent));
    }
}
