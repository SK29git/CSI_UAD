import React, { useState, useMemo } from 'react';
import {
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaTrashAlt,
  FaUserTie,
  FaEnvelope,
  FaBuilding,
  FaIdBadge,
  FaTimes,
  FaCheck,
  FaFilter
} from 'react-icons/fa';

export default function UsersManagerTab({ users, onUpdateUsers, complaintDepartments }) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: '',
    roleName: '',
    departmentType: 'Service',
    departmentDescription: 'Service Workshop',
    email: '',
    employeeNumber: ''
  });

  const departmentList = useMemo(() => {
    const list = Array.isArray(complaintDepartments) ? complaintDepartments : [];
    const deptsFromUsers = Array.from(new Set(users.map(u => u.departmentType).filter(Boolean)));
    return Array.from(new Set([...list, ...deptsFromUsers]));
  }, [complaintDepartments, users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter(u => {
      const matchSearch =
        !q ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.roleName || u.role || '').toLowerCase().includes(q);

      const matchDept =
        selectedDept === 'ALL' ||
        (u.departmentType || '').toLowerCase() === selectedDept.toLowerCase() ||
        (u.departmentDescription || '').toLowerCase().includes(selectedDept.toLowerCase());

      return matchSearch && matchDept;
    });
  }, [users, search, selectedDept]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      id: `USR${Date.now().toString().slice(-4)}`,
      name: '',
      role: 'Staff',
      roleName: 'Customer Service Representative',
      departmentType: departmentList[0] || 'Service',
      departmentDescription: `${departmentList[0] || 'Service'} Team`,
      email: '',
      employeeNumber: `EMP${Math.floor(1000 + Math.random() * 9000)}`
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      id: user.id || '',
      name: user.name || '',
      role: user.role || '',
      roleName: user.roleName || user.role || '',
      departmentType: user.departmentType || 'Service',
      departmentDescription: user.departmentDescription || '',
      email: user.email || '',
      employeeNumber: user.employeeNumber || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm(`Are you sure you want to delete user ID "${userId}"?`)) {
      const next = users.filter(u => u.id !== userId);
      onUpdateUsers(next);
    }
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingUser) {
      const next = users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
      onUpdateUsers(next);
    } else {
      const next = [formData, ...users];
      onUpdateUsers(next);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, user ID, or email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full text-xs">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
            <FaFilter className="text-[10px]" /> Dept:
          </span>
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
              selectedDept === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({users.length})
          </button>
          {departmentList.slice(0, 6).map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded-full font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Add User Button */}
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer ml-auto"
        >
          <FaUserPlus className="text-xs" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {filteredUsers.length} of {users.length} total staff</span>
        {selectedDept !== 'ALL' && (
          <span className="text-indigo-600 font-semibold">Filtered by {selectedDept}</span>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="max-h-[560px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">User ID</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.slice(0, 100).map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-600">{u.id}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {u.departmentType || 'General'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-medium">{u.roleName || u.role}</td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{u.email || '—'}</td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        title="Edit user"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Delete user"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? 'Edit User Details' : 'Add New Department User'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">User ID *</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  disabled={Boolean(editingUser)}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department *</label>
                <select
                  value={formData.departmentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      departmentType: e.target.value,
                      departmentDescription: `${e.target.value} Department`
                    })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  {departmentList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Role / Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.roleName}
                  onChange={(e) =>
                    setFormData({ ...formData, roleName: e.target.value, role: e.target.value })
                  }
                  placeholder="e.g. Service Advisor / Sales Consultant"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@agmc.ae"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
