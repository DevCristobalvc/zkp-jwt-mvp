//! ZKPJWT Verifier - Stylus Implementation
//!
//! Zero-Knowledge Proof JSON Web Token verification contract
//! Built with Arbitrum Stylus for optimal gas efficiency
//!
//! This contract stores Merkle roots for authorized wallet groups
//! and verifies Merkle proofs for membership verification.
//!
//! Note: This is a minimal implementation for bounty demonstration.
//! Production use requires security audit.

#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

extern crate alloc;

use alloc::{vec, vec::Vec, string::ToString};
use stylus_sdk::{
    alloy_primitives::{B256, U256, Address},
    alloy_sol_types::sol,
    prelude::*,
    stylus_core::log,
};

// Storage struct for Merkle root metadata
sol_storage! {
    pub struct RootMetadata {
        address publisher;
        uint256 published_at;
        bool is_active;
    }
}

// Main contract storage
sol_storage! {
    #[entrypoint]
    pub struct ZKPJWTVerifier {
        mapping(bytes32 => RootMetadata) roots;
        mapping(bytes32 => mapping(address => uint256)) last_access;
    }
}

// Events using sol! macro
sol! {
    event RootPublished(bytes32 indexed root, address indexed publisher, uint256 timestamp);
    event AccessGranted(bytes32 indexed root, address indexed user, uint256 timestamp);
    event AccessDenied(bytes32 indexed root, address indexed user, string reason);
}

#[public]
impl ZKPJWTVerifier {
    /// Publish a new Merkle root for access control
    /// @param root The Merkle root to publish
    pub fn publish_root(&mut self, root: B256) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let timestamp = U256::from(self.vm().block_timestamp());
        
        // Store root metadata
        let mut root_data = self.roots.setter(root);
        root_data.publisher.set(sender);
        root_data.published_at.set(timestamp);
        root_data.is_active.set(true);
        
        // Emit event
        log(self.vm(), RootPublished {
            root,
            publisher: sender,
            timestamp,
        });
        
        Ok(())
    }
    
    /// Verify a Merkle proof (pure function for testing)
    /// @param root The Merkle root
    /// @param leaf The leaf node to verify
    /// @param proof Array of proof elements
    /// @return True if proof is valid
    pub fn verify_proof(&self, root: B256, leaf: B256, proof: Vec<B256>) -> bool {
        let mut computed_hash = leaf;
        
        for proof_element in proof.iter() {
            // Sort hashes to maintain consistent tree structure
            if computed_hash <= *proof_element {
                // Hash(current, proof_element)
                computed_hash = keccak256_pair(computed_hash, *proof_element);
            } else {
                // Hash(proof_element, current)
                computed_hash = keccak256_pair(*proof_element, computed_hash);
            }
        }
        
        computed_hash == root
    }
    
    /// Unlock access by verifying membership proof
    /// @param root The Merkle root to verify against
    /// @param leaf The leaf node (hashed wallet address)
    /// @param proof Array of sibling hashes
    /// @return True if access is granted
    pub fn unlock_access(&mut self, root: B256, leaf: B256, proof: Vec<B256>) -> Result<bool, Vec<u8>> {
        let sender = self.vm().msg_sender();
        let timestamp = U256::from(self.vm().block_timestamp());
        
        // Check if root exists
        let root_data = self.roots.getter(root);
        let is_active = root_data.is_active.get();
        
        if !is_active {
            log(self.vm(), AccessDenied {
                root,
                user: sender,
                reason: "Root not found or inactive".to_string(),
            });
            return Err(b"Root not found or inactive".to_vec());
        }
        
        // Verify proof
        let is_valid = self.verify_proof(root, leaf, proof);
        
        if is_valid {
            // Record access
            let mut access_record = self.last_access.setter(root);
            access_record.setter(sender).set(timestamp);
            
            // Emit success event
            log(self.vm(), AccessGranted {
                root,
                user: sender,
                timestamp,
            });
            
            Ok(true)
        } else {
            // Emit denial event
            log(self.vm(), AccessDenied {
                root,
                user: sender,
                reason: "Invalid proof".to_string(),
            });
            
            Ok(false)
        }
    }
    
    /// Check if a root exists and is active
    /// @param root The root to check
    /// @return True if root exists and is active
    pub fn root_exists(&self, root: B256) -> bool {
        let root_data = self.roots.getter(root);
        root_data.is_active.get()
    }
    
    /// Get root metadata
    /// @param root The root to query
    /// @return (publisher, published_at, is_active)
    pub fn get_root_info(&self, root: B256) -> (Address, U256, bool) {
        let root_data = self.roots.getter(root);
        (
            root_data.publisher.get(),
            root_data.published_at.get(),
            root_data.is_active.get(),
        )
    }
    
    /// Get last access time for a user and root
    /// @param root The Merkle root
    /// @param user The user address
    /// @return Timestamp of last access (0 if never accessed)
    pub fn get_last_access(&self, root: B256, user: Address) -> U256 {
        let access_record = self.last_access.getter(root);
        access_record.getter(user).get()
    }
}

// Helper function for Merkle proof hashing
fn keccak256_pair(a: B256, b: B256) -> B256 {
    use stylus_sdk::crypto::keccak;
    let mut data = [0u8; 64];
    data[0..32].copy_from_slice(a.as_slice());
    data[32..64].copy_from_slice(b.as_slice());
    keccak(data)
}
