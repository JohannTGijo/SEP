import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import SummaryCard from '../components/SummaryCard';
import { MonthlyExpensesChart, CategoryExpensesChart } from '../components/charts/ExpenseCharts';
import ExpenseForm from '../components/ExpenseForm';
import api from '../services/api';
import {
  DollarSign,
  TrendingUp,
  Hash,
  Scale,
  Plus,
  PlusCircle,
  Calendar,
  Loader,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, listRes] = await Promise.all([
        api.get('expenses/summary/'),
        api.get('expenses/'),
      ]);
      setStats(summaryRes.data);
      setRecentExpenses(listRes.data.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchDashboardData();
  };

  if (loading && !stats) {
    return (
      <div className="loading-spinner-container">
        <Loader className="spinner" size={48} />
      </div>
    );
  }

  const summary = stats?.summary_stats || {
    total_current_month: 0,
    count_current_month: 0,
    highest_current_month: 0,
    avg_current_month: 0,
  };

  const hasExpenses = summary.count_current_month > 0 || recentExpenses.length > 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>Welcome, {user?.username || 'User'}!</h2>
          <p className="subtitle">Here's your monthly expense breakdown</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="summary-grid">
        <SummaryCard
          title="Total Spent This Month"
          value={`$${summary.total_current_month.toFixed(2)}`}
          icon={<DollarSign size={24} />}
          color="indigo"
        />
        <SummaryCard
          title="Total Expenses"
          value={summary.count_current_month}
          icon={<Hash size={24} />}
          color="emerald"
        />
        <SummaryCard
          title="Highest Expense"
          value={`$${summary.highest_current_month.toFixed(2)}`}
          icon={<TrendingUp size={24} />}
          color="rose"
        />
        <SummaryCard
          title="Average Expense"
          value={`$${summary.avg_current_month.toFixed(2)}`}
          icon={<Scale size={24} />}
          color="amber"
        />
      </div>

      {hasExpenses ? (
        <div className="dashboard-charts">
          <MonthlyExpensesChart data={stats?.monthly_totals || []} />
          <CategoryExpensesChart data={stats?.category_totals || []} />
        </div>
      ) : (
        <div className="empty-dashboard">
          <div className="empty-icon-container">
            <PlusCircle size={48} />
          </div>
          <h3>No expenses recorded yet!</h3>
          <p>Get started by tracking your first personal expense.</p>
          <button className="btn btn-primary mt-4" onClick={() => setShowAddForm(true)}>
            Add Your First Expense
          </button>
        </div>
      )}

      {hasExpenses && (
        <div className="recent-expenses-section card">
          <div className="card-header-flex">
            <h3>Recent Expenses</h3>
            <Link to="/expenses" className="view-all-link">
              View All
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="font-semibold">{exp.title}</td>
                      <td>
                        <span className={`badge badge-category badge-${exp.category.toLowerCase()}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td>
                        <div className="flex-align gap-1">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{exp.date}</span>
                        </div>
                      </td>
                      <td className="font-bold text-rose-600">-${parseFloat(exp.amount).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-slate-400">
                      No expenses recorded for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddForm && (
        <ExpenseForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
