import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CATEGORY_COLORS = {
  Food: '#6366f1',          // Indigo
  Transport: '#10b981',     // Emerald
  Shopping: '#f43f5e',      // Rose
  Entertainment: '#8b5cf6', // Violet
  Bills: '#f59e0b',          // Amber
  Education: '#06b6d4',     // Cyan
  Health: '#ec4899',        // Pink
  Travel: '#eab308',        // Yellow
  Other: '#64748b',         // Slate
};

export const MonthlyExpensesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No monthly trends available.</p>
      </div>
    );
  }

  const formatMonth = (monthStr) => {
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(year, parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return monthStr;
    }
  };

  const chartData = data.map((item) => ({
    ...item,
    formattedMonth: formatMonth(item.month),
  }));

  return (
    <div className="chart-container">
      <h4 className="chart-title">Monthly Spending Trends</h4>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="formattedMonth" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: '#1e293b',
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']}
            />
            <Bar dataKey="total" fill="url(#colorTotal)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const CategoryExpensesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No category breakdown available.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h4 className="chart-title">Category Breakdown</h4>
      <div style={{ width: '100%', height: 300 }} className="flex-center">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="total"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: '#1e293b',
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconSize={10}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
