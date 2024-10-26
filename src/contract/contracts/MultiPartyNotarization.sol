// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentNotarization {
    // Event emitted when a document is notarized
    event DocumentNotarized(
        bytes32 indexed documentHash,
        address indexed notary,
        uint256 timestamp,
        uint256 expirationTime
    );

    // Event emitted when a notarization is revoked
    event NotarizationRevoked(
        bytes32 indexed documentHash,
        address indexed notary,
        uint256 timestamp
    );

    // Struct to store information about the notarized document
    struct NotarizedDocument {
        address notary; // Address of the notary
        uint256 notarizationTime; // Timestamp when the document was notarized
        bool exists; // Status to check if the document is notarized
        bool revoked; // Status to indicate if the notarization has been revoked
        uint256 expirationTime; // Timestamp when the notarization expires
    }

    // Mapping to store notarized documents by their hash
    mapping(bytes32 => NotarizedDocument) public documents;

    // Optionally: Keep track of all document hashes (for searching)
    bytes32[] private documentHashes;
    uint256 private totalDocuments;

    // Function to notarize a document
    function notarizeDocument(
        bytes32 documentHash,
        uint256 expirationDuration
    ) external {
        require(
            !documents[documentHash].exists,
            "Document is already notarized."
        );

        uint256 expirationTime = block.timestamp + expirationDuration;

        // Create a new notarized document entry
        documents[documentHash] = NotarizedDocument({
            notary: msg.sender,
            notarizationTime: block.timestamp,
            exists: true,
            revoked: false,
            expirationTime: expirationTime // Set the expiration time
        });

        // Add document hash to the tracking array
        addDocumentHash(documentHash);

        emit DocumentNotarized(
            documentHash,
            msg.sender,
            block.timestamp,
            expirationTime
        );
    }

    // Function to revoke a notarization
    function revokeNotarization(bytes32 documentHash) external {
        NotarizedDocument storage doc = documents[documentHash];
        require(doc.exists, "Document is not notarized.");
        require(
            msg.sender == doc.notary,
            "Only the notary can revoke this notarization."
        );
        require(!doc.revoked, "Notarization has already been revoked.");

        // Revoke the notarization
        doc.revoked = true;

        emit NotarizationRevoked(documentHash, msg.sender, block.timestamp);
    }

    // Function to check if a document is notarized
    function isDocumentNotarized(
        bytes32 documentHash
    ) external view returns (bool) {
        NotarizedDocument storage doc = documents[documentHash];
        return doc.exists && !doc.revoked && !isDocumentExpired(documentHash);
    }

    // Function to check if a document is expired
    function isDocumentExpired(
        bytes32 documentHash
    ) public view returns (bool) {
        NotarizedDocument storage doc = documents[documentHash];
        return
            doc.exists && !doc.revoked && block.timestamp > doc.expirationTime;
    }

    // Function to search for notarized documents by notary address
    function searchDocumentsByNotary(
        address notary
    ) external view returns (bytes32[] memory) {
        uint256 count = 0;

        // Count how many documents this notary has notarized
        for (uint256 i = 0; i < totalDocuments; i++) {
            bytes32 docHash = documentHashes[i]; // Assuming you maintain an array of document hashes
            if (
                documents[docHash].notary == notary &&
                !documents[docHash].revoked &&
                !isDocumentExpired(docHash)
            ) {
                count++;
            }
        }

        // Create an array to store the found document hashes
        bytes32[] memory foundDocuments = new bytes32[](count);
        uint256 index = 0;

        // Populate the foundDocuments array
        for (uint256 i = 0; i < totalDocuments; i++) {
            bytes32 docHash = documentHashes[i];
            if (
                documents[docHash].notary == notary &&
                !documents[docHash].revoked &&
                !isDocumentExpired(docHash)
            ) {
                foundDocuments[index] = docHash;
                index++;
            }
        }

        return foundDocuments;
    }

    // Helper function to add document hashes to the array
    function addDocumentHash(bytes32 documentHash) internal {
        documentHashes.push(documentHash);
        totalDocuments++;
    }
}
