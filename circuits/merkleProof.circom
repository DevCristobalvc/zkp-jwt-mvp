pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * MerkleProof - Verifies membership in a Merkle tree
 * 
 * Public inputs:
 *   - root: Merkle root
 * 
 * Private inputs:
 *   - leaf: Wallet address hash
 *   - pathIndices: Left/right path (0 = left, 1 = right)
 *   - siblings: Merkle proof siblings
 */
template MerkleProof(levels) {
    // Public input
    signal input root;
    
    // Private inputs
    signal input leaf;
    signal input pathIndices[levels];
    signal input siblings[levels];
    
    // Hash computations
    component hashers[levels];
    component selectors[levels];
    
    signal hashes[levels + 1];
    hashes[0] <== leaf;
    
    for (var i = 0; i < levels; i++) {
        // Select left/right position
        selectors[i] = Selector();
        selectors[i].in[0] <== hashes[i];
        selectors[i].in[1] <== siblings[i];
        selectors[i].s <== pathIndices[i];
        
        // Hash the pair
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== selectors[i].out[0];
        hashers[i].inputs[1] <== selectors[i].out[1];
        
        hashes[i + 1] <== hashers[i].out;
    }
    
    // Verify root matches
    root === hashes[levels];
}

/**
 * Selector - Chooses left or right based on path index
 */
template Selector() {
    signal input in[2];
    signal input s;
    signal output out[2];
    
    out[0] <== (in[1] - in[0]) * s + in[0];
    out[1] <== (in[0] - in[1]) * s + in[1];
}

component main {public [root]} = MerkleProof(4);
