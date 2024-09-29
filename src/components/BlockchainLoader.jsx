import React from 'react';

const BlockchainLoader = () => {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="loader">
      {/* Circle representing the first node */}
      <circle cx="20" cy="50" r="5" fill="#3498db">
        <animate attributeName="r" from="5" to="10" dur="0.5s" begin="0s" repeatCount="indefinite" />
      </circle>
      {/* Circle representing the second node */}
      <circle cx="50" cy="50" r="5" fill="#2ecc71">
        <animate attributeName="r" from="5" to="10" dur="0.5s" begin="0.2s" repeatCount="indefinite" />
      </circle>
      {/* Circle representing the third node */}
      <circle cx="80" cy="50" r="5" fill="#e74c3c">
        <animate attributeName="r" from="5" to="10" dur="0.5s" begin="0.4s" repeatCount="indefinite" />
      </circle>
      {/* Connecting lines between nodes */}
      <line x1="20" y1="50" x2="50" y2="50" stroke="#3498db" strokeWidth="2" />
      <line x1="50" y1="50" x2="80" y2="50" stroke="#2ecc71" strokeWidth="2" />
    </svg>
  );
};

export default BlockchainLoader;
