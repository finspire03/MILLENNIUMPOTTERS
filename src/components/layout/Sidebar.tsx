import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  Users,
  CreditCard,
  Banknote,
  BarChart3,
  Building2,
  UserCheck,
  FileText,
  Calendar,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/helpers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: user?.role === 'admin' ? '/admin' : user?.role === 'sub_admin' ? '/subadmin' : '/agent',
        icon: LayoutDashboard
      }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Branch Management', href: '/admin/branches', icon: Building2 },
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Loan Management', href: '/admin/loans', icon: CreditCard },
          { name: 'Transactions', href: '/admin/transactions', icon: Banknote },
          { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
          { name: 'Settings', href: '/admin/settings', icon: Settings }
        ];

      case 'sub_admin':
        return [
          ...baseItems,
          { name: 'Agent Management', href: '/subadmin/agents', icon: UserCheck },
          { name: 'Branch Analytics', href: '/subadmin/analytics', icon: BarChart3 },
          { name: 'Loan Approvals', href: '/subadmin/loans', icon: CreditCard },
          { name: 'Settings', href: '/subadmin/settings', icon: Settings }
        ];

      case 'agent':
        return [
          ...baseItems,
          { name: 'New Customer', href: '/agent/customers/new', icon: Users },
          { name: 'My Customers', href: '/agent/customers', icon: Users },
          { name: 'New Loan', href: '/agent/loans/new', icon: CreditCard },
          { name: 'Daily Payments', href: '/agent/payments', icon: Banknote },
          { name: 'Weekly Sheet', href: '/agent/weekly-sheet', icon: Calendar },
          { name: 'Reports', href: '/agent/reports', icon: FileText }
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center h-16 px-6 bg-gradient-to-r from-navy-900 to-electric-900">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Millennium Potter</h2>
                <p className="text-gold-300 text-xs">{user?.branch?.name || 'Admin Panel'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-electric-50 text-electric-700 border-l-4 border-electric-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-electric-600'
                  )
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <motion.div
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          exit={{ x: -320 }}
          className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden"
        >
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-navy-900 to-electric-900">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold">Millennium Potter</h2>
                  <p className="text-gold-300 text-xs">{user?.branch?.name || 'Admin Panel'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-electric-50 text-electric-700 border-l-4 border-electric-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-electric-600'
                    )
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Sidebar;
