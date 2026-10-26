import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Power, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../api/admin.api.js';
import DataTable from '../../components/admin/DataTable.jsx';

export const Users = () => {
  const { user: currentAdmin } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getUsers(params);
      const data = res?.data || res;
      setUsers(data?.items || []);
      setPagination(data?.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    // Check self-deactivation guard
    if (user.id === currentAdmin?.id || user._id === currentAdmin?.id) {
      toast.error('You cannot deactivate your own administrative account.');
      return;
    }

    const nextStatus = !user.isActive;
    try {
      await adminApi.updateUserStatus(user.id || user._id, nextStatus);
      toast.success(`User ${nextStatus ? 'activated' : 'deactivated'}.`);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to update user status.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User Name',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-navy/10 text-navy font-bold flex items-center justify-center text-xs">
            {u.name ? u.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <span className="font-bold text-ink block">{u.name}</span>
            <span className="text-[10px] text-muted">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (u) => <span className="text-muted">{u.phone || 'N/A'}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            u.role === 'admin'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
          <span>{u.role}</span>
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
      render: (u) => <span className="text-muted">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'status',
      label: 'Account Status',
      render: (u) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            u.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-danger'
          }`}
        >
          {u.isActive ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (u) => {
        const isSelf = u.id === currentAdmin?.id || u._id === currentAdmin?.id;

        return (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => handleToggleStatus(u)}
              disabled={isSelf}
              className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                isSelf
                  ? 'opacity-30 cursor-not-allowed text-muted'
                  : u.isActive
                  ? 'hover:bg-red-50 text-muted hover:text-danger'
                  : 'hover:bg-emerald-50 text-muted hover:text-emerald-600'
              }`}
              title={
                isSelf
                  ? 'Cannot deactivate yourself'
                  : u.isActive
                  ? 'Deactivate User'
                  : 'Activate User'
              }
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-ink tracking-tight">User Accounts</h1>
        <p className="text-xs text-muted mt-0.5">
          Manage registered customer accounts, view permissions, and toggle access controls.
        </p>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found matching your search."
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users by name, email, or phone..."
        pagination={{
          page: pagination.page,
          pages: pagination.pages,
          onPageChange: (newPage) => fetchUsers(newPage),
        }}
      />
    </div>
  );
};

export default Users;
