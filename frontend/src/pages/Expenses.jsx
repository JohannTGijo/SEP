import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Loader,
  AlertTriangle,
} from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Education',
  'Health',
  'Travel',
  'Other',
];

const MONTHS = [
  { value: '', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [ordering, setOrdering] = useState('-date');

  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    
    const params = {};
    if (search.trim()) params.search = search;
    if (category) params.category = category;
    if (month) params.month = month;
    if (year) params.year = year;
    if (date) params.date = date;
    if (ordering) params.ordering = ordering;

    try {
      const res = await api.get('expenses/', { params });
      setExpenses(res.data);
    } catch (err) {
      setError('Failed to fetch expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [category, month, year, date, ordering]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMonth('');
    setYear('');
    setDate('');
    setOrdering('-date');
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`expenses/${expenseToDelete.id}/`);
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedExpense(null);
    fetchExpenses();
  };

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h2>Manage Expenses</h2>
          <p className="subtitle">View, search, filter, and modify your expenses list</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedExpense(null);
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search expenses by title or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div className="filters-grid">
          <div className="filter-item">
            <label htmlFor="filter-category">Category</label>
            <select id="filter-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-month">Month</label>
            <select id="filter-month" value={month} onChange={(e) => setMonth(e.target.value)}>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-year">Year</label>
            <input
              id="filter-year"
              type="number"
              placeholder="e.g. 2026"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-date">Specific Date</label>
            <input id="filter-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-sort">Sort By</label>
            <select id="filter-sort" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
              <option value="-date">Date (Newest First)</option>
              <option value="date">Date (Oldest First)</option>
              <option value="-amount">Amount (Highest First)</option>
              <option value="amount">Amount (Lowest First)</option>
            </select>
          </div>
        </div>

        <div className="filter-actions-flex">
          <button type="button" className="btn-link" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <Loader className="spinner" size={40} />
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-dashboard card py-8 text-center">
          <AlertTriangle size={48} className="text-slate-400 mx-auto" />
          <h3 className="mt-4">No expenses found</h3>
          <p className="text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="font-semibold">{exp.title}</td>
                    <td>
                      <span className={`badge badge-category badge-${exp.category.toLowerCase()}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td>
                      <div className="flex-align gap-1 text-slate-500">
                        <Calendar size={14} />
                        <span>{exp.date}</span>
                      </div>
                    </td>
                    <td className="text-slate-500 text-sm max-w-xs truncate" title={exp.description}>
                      {exp.description || '—'}
                    </td>
                    <td className="font-bold text-rose-600">-${parseFloat(exp.amount).toFixed(2)}</td>
                    <td className="text-right">
                      <div className="actions-cell flex-justify-end gap-2">
                        <button
                          className="btn-icon btn-secondary"
                          onClick={() => handleEditClick(exp)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDeleteClick(exp)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ExpenseForm
          expense={selectedExpense}
          onClose={() => {
            setShowForm(false);
            setSelectedExpense(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {expenseToDelete && (
        <div className="modal-backdrop" onClick={() => setExpenseToDelete(null)}>
          <div className="modal-container modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body py-4">
              <p>Are you sure you want to delete the expense <strong>"{expenseToDelete.title}"</strong>?</p>
              <p className="text-slate-500 text-sm mt-1">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setExpenseToDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
