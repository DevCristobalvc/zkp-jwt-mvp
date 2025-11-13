// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZKPJWTVerifier
 * @notice Verifies Merkle membership proofs for ZKPJWT access control
 * @dev Simplified version for MVP - stores Merkle roots and verifies proofs
 */
contract ZKPJWTVerifier {
    
    // Events
    event RootPublished(bytes32 indexed root, address indexed publisher, uint256 timestamp);
    event AccessGranted(bytes32 indexed root, address indexed accessor, uint256 timestamp);
    event AccessDenied(bytes32 indexed root, address indexed accessor, uint256 timestamp);
    
    // Mapping of Merkle roots to their metadata
    struct RootMetadata {
        address publisher;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(bytes32 => RootMetadata) public roots;
    
    // Access logs
    mapping(bytes32 => mapping(address => uint256)) public lastAccess;
    
    /**
     * @notice Publish a Merkle root for a group of authorized wallets
     * @param root The Merkle root hash
     */
    function publishRoot(bytes32 root) external {
        require(root != bytes32(0), "Invalid root");
        
        roots[root] = RootMetadata({
            publisher: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit RootPublished(root, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Verify a Merkle proof for membership
     * @param root The Merkle root
     * @param leaf The leaf node (hashed wallet address)
     * @param proof Array of sibling hashes
     * @return isValid True if proof is valid
     */
    function verifyProof(
        bytes32 root,
        bytes32 leaf,
        bytes32[] calldata proof
    ) public pure returns (bool isValid) {
        bytes32 computedHash = leaf;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (computedHash <= proofElement) {
                // Hash(current, proofElement)
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Hash(proofElement, current)
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == root;
    }
    
    /**
     * @notice Unlock access by verifying membership proof
     * @param root The Merkle root to verify against
     * @param leaf The leaf node (hashed wallet address)
     * @param proof Array of sibling hashes
     * @return success True if access is granted
     */
    function unlockAccess(
        bytes32 root,
        bytes32 leaf,
        bytes32[] calldata proof
    ) external returns (bool success) {
        require(roots[root].exists, "Root not found");
        
        bool isValid = verifyProof(root, leaf, proof);
        
        if (isValid) {
            lastAccess[root][msg.sender] = block.timestamp;
            emit AccessGranted(root, msg.sender, block.timestamp);
            return true;
        } else {
            emit AccessDenied(root, msg.sender, block.timestamp);
            return false;
        }
    }
    
    /**
     * @notice Check if a root exists
     * @param root The Merkle root
     * @return exists True if root was published
     */
    function rootExists(bytes32 root) external view returns (bool exists) {
        return roots[root].exists;
    }
    
    /**
     * @notice Get root metadata
     * @param root The Merkle root
     * @return publisher Address that published the root
     * @return timestamp When the root was published
     */
    function getRootInfo(bytes32 root) external view returns (
        address publisher,
        uint256 timestamp
    ) {
        RootMetadata memory metadata = roots[root];
        return (metadata.publisher, metadata.timestamp);
    }
    
    /**
     * @notice Check last access time for an address
     * @param root The Merkle root
     * @param accessor The address to check
     * @return timestamp Last access timestamp (0 if never accessed)
     */
    function getLastAccess(bytes32 root, address accessor) external view returns (uint256 timestamp) {
        return lastAccess[root][accessor];
    }
}
