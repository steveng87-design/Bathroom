// Test file to check JSX syntax
import React from 'react';

// Extract just the problematic part
const TestComponent = () => {
  return (
    <div>
      {getTotalAdjustedCost() !== quote?.total_cost && Object.keys(adjustedCosts).length > 0 
        ? "Will include your cost adjustments" 
        : "Will use original AI-generated costs"}
    </div>
  );
};

export default TestComponent;