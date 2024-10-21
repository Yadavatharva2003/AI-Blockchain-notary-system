import React from 'react';
import './BlockchainLoader.css'; // Make sure to create this CSS file

const BlockchainLoader = () => {
  return (
    <div className="robot-loader">
      <div className="robot-body">
        <div className="robot-head">
          <div className="eyes">
            <div className="eye"></div>
            <div className="eye"></div>
          </div>
          <div className="antenna"></div>
        </div>
        <div className="robot-arms">
          <div className="robot-arm left-arm"></div>
          <div className="robot-arm right-arm"></div>
        </div>
        <div className="robot-legs">
          <div className="robot-leg left-leg"></div>
          <div className="robot-leg right-leg"></div>
        </div>
      </div>
      <div className="loading-text">Processing...</div>
    </div>
  );
};

export default BlockchainLoader;
