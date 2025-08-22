import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import BranchSelector from '../components/landing/BranchSelector';
import LiveMetrics from '../components/landing/LiveMetrics';

const LandingPage: React.FC = () => {
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setShowBranchSelector(true);
  };

  const handleSelectBranch = (branchId: string) => {
    // Store selected branch in localStorage for now
    localStorage.setItem('selectedBranch', branchId);
    setShowBranchSelector(false);
    
    // Navigate to login with branch context
    navigate('/auth/login', { state: { branchId } });
  };

  return (
    <div className="min-h-screen">
      <HeroSection onGetStarted={handleGetStarted} />
      
      {/* Live Metrics Section */}
      <div className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-electric-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LiveMetrics />
        </div>
      </div>
      
      <BranchSelector
        isOpen={showBranchSelector}
        onClose={() => setShowBranchSelector(false)}
        onSelectBranch={handleSelectBranch}
      />
    </div>
  );
};

export default LandingPage;
