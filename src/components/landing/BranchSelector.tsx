import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Building2 } from 'lucide-react';
import { BRANCHES } from '../../utils/constants';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface BranchSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBranch: (branchId: string) => void;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  isOpen,
  onClose,
  onSelectBranch
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Your Branch"
      size="lg"
    >
      <div className="space-y-6">
        <p className="text-gray-600 text-center">
          Choose your preferred branch location to get started with Millennium Potter
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BRANCHES.map((branch) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => onSelectBranch(branch.id)}
            >
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-electric-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-electric-500 to-electric-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-electric-600 transition-colors">
                        {branch.name}
                      </h3>
                      <span className="inline-block bg-electric-100 text-electric-700 text-xs font-medium px-2 py-1 rounded-full mt-1">
                        {branch.code}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{branch.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{branch.phone}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-4 group-hover:bg-electric-700"
                    >
                      Select {branch.name}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-6">
          You can always change your branch later in your account settings
        </div>
      </div>
    </Modal>
  );
};

export default BranchSelector;
