import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, ShieldAlert, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="profile-page">
      <div className="page-header">
        <h2>My Account</h2>
        <p className="subtitle">Overview of your account profile</p>
      </div>

      <div className="card profile-card max-w-lg mx-auto">
        <div className="profile-hero">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h3 className="profile-username">{user?.username}</h3>
          <span className="profile-role">SpendWise Member</span>
        </div>

        <div className="profile-details">
          <div className="profile-detail-item">
            <div className="detail-icon">
              <User size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Username</span>
              <span className="detail-value">{user?.username || '—'}</span>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="detail-icon">
              <Mail size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user?.email || '—'}</span>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="detail-icon">
              <ShieldAlert size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Security</span>
              <span className="detail-value">Protected by JWT Authentication</span>
            </div>
          </div>
        </div>

        <div className="profile-actions pt-6">
          <button className="btn btn-danger btn-block" onClick={logout}>
            <LogOut size={18} />
            <span>Logout from Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
