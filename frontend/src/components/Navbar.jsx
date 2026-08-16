import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, PiggyBank, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button className="menu-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={24} />
        </button>
        <Link to="/" className="navbar-logo">
          <PiggyBank size={28} className="logo-icon" />
          <span>SpendWise</span>
        </Link>
      </div>

      <div className="navbar-actions">
        {user && (
          <>
            <Link to="/profile" className="navbar-user">
              <div className="avatar">
                <User size={18} />
              </div>
              <span className="username-text">{user.username}</span>
            </Link>
            <button className="logout-btn" onClick={logout} title="Log Out">
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
