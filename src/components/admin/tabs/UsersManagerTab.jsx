import React, { useState, useMemo, useRef } from 'react';
import ExcelJS from 'exceljs';
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
  FaFilter,
  FaFileExcel,
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function UsersManagerTab({ users, onUpdateUsers, complaintDepartments }) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

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
    return [
      'ALL',
      'Service',
      'Sales',
      'Parts',
      'Business Development Centre',
      'Accounts',
      'Balance Sheet'
    ];
  }, []);

  // Department filter matcher
  const matchesDepartment = (user, deptFilter) => {
    if (deptFilter === 'ALL') return true;
    const target = deptFilter.toLowerCase().trim();
    const userDept = String(user.department || '').toLowerCase().trim();
    const userType = String(user.departmentType || '').toLowerCase().trim();
    const userDesc = String(user.departmentDescription || '').toLowerCase().trim();

    if (userDept === target) return true;
    if (target === 'service') {
      return (
        userDept.includes('serv') ||
        userType === 'w' ||
        userType.includes('serv') ||
        userDesc.includes('serv') ||
        userDesc.includes('workshop')
      );
    }
    if (target === 'sales') {
      return (
        userDept.includes('sale') ||
        userType === 's' ||
        userType.includes('sale') ||
        userDesc.includes('showroom')
      );
    }
    if (target === 'parts') {
      return (
        userDept.includes('part') ||
        userType === 'p' ||
        userType.includes('part')
      );
    }
    if (target === 'business development centre' || target === 'bdc') {
      return (
        userDept.includes('bdc') ||
        userDept.includes('business dev') ||
        userType.includes('bdc') ||
        userDesc.includes('bdc')
      );
    }
    if (target === 'accounts' || target === 'finance') {
      return (
        userDept.includes('account') ||
        userDept.includes('fin') ||
        userType === 'f' ||
        userDesc.includes('account')
      );
    }
    if (target === 'balance sheet') {
      return (
        userDept.includes('balance') ||
        userType.includes('balance') ||
        userDesc.includes('sheet')
      );
    }
    return userDept.includes(target) || userType.includes(target) || userDesc.includes(target);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchSearch =
        !q ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.roleName || u.role || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q);

      const matchDept = matchesDepartment(u, selectedDept);
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
      departmentType: 'Service',
      departmentDescription: 'Service Department',
      email: '',
      employeeNumber: `EMP${Math.floor(1000 + Math.random() * 9000)}`
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    const dept = user.department || user.departmentType || 'Service';
    setFormData({
      id: user.id || '',
      name: user.name || '',
      role: user.role || '',
      roleName: user.roleName || user.role || '',
      departmentType: dept,
      departmentDescription: user.departmentDescription || `${dept} Department`,
      email: user.email || '',
      employeeNumber: user.employeeNumber || user.empNo || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm(`Are you sure you want to delete user ID "${userId}"?`)) {
      const next = users.filter((u) => u.id !== userId);
      onUpdateUsers(next);
    }
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const record = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      role: formData.roleName || formData.role || 'Staff',
      roleName: formData.roleName || formData.role || 'Staff',
      department: formData.departmentType,
      departmentType: formData.departmentType,
      departmentDescription: `${formData.departmentType} Department`,
      email: formData.email.trim(),
      employeeNumber: formData.employeeNumber.trim()
    };

    if (editingUser) {
      const next = users.map((u) => (u.id === editingUser.id ? { ...u, ...record } : u));
      onUpdateUsers(next);
    } else {
      const next = [record, ...users];
      onUpdateUsers(next);
      setSelectedDept('ALL');
    }
    setIsModalOpen(false);
  };

  // ─── Excel Bulk Upload ──────────────────────────────────────────────────────
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFeedback(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('No sheet found in uploaded Excel file.');
      }

      // Read header row
      const headers = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value || '').trim().toLowerCase();
      });

      const findCol = (names) => {
        for (let i = 1; i < headers.length; i++) {
          const h = headers[i];
          if (h && names.some((n) => h.includes(n))) return i;
        }
        return -1;
      };

      const idCol = findCol(['user id', 'userid', 'id', 'emp id']);
      const nameCol = findCol(['user name', 'name', 'full name', 'employee name']);
      const roleCol = findCol(['role name', 'role', 'designation', 'job']);
      const deptCol = findCol(['department', 'dept', 'department type', 'department description']);
      const emailCol = findCol(['email', 'mail', 'e-mail']);
      const empNoCol = findCol(['employee number', 'emp no', 'emp number', 'employee no']);

      const parsedUsers = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header

        const getVal = (col) => {
          if (col === -1) return '';
          const val = row.getCell(col).value;
          if (val === null || val === undefined) return '';
          if (typeof val === 'object' && val.text) return String(val.text).trim();
          return String(val).trim();
        };

        const name = getVal(nameCol);
        if (!name) return; // skip empty rows

        const id = getVal(idCol) || `USR${Math.floor(10000 + Math.random() * 90000)}`;
        const roleName = getVal(roleCol) || 'Staff';
        const department = getVal(deptCol) || 'Service';
        const email = getVal(emailCol) || '';
        const employeeNumber = getVal(empNoCol) || '';

        parsedUsers.push({
          id,
          name,
          role: roleName,
          roleName,
          department,
          departmentType: department,
          departmentDescription: `${department} Department`,
          email,
          employeeNumber
        });
      });

      if (parsedUsers.length === 0) {
        throw new Error('No valid user records found in this Excel sheet.');
      }

      // Merge with existing users (upsert by id)
      const existingMap = new Map(users.map((u) => [u.id, u]));
      parsedUsers.forEach((u) => existingMap.set(u.id, u));
      const mergedList = Array.from(existingMap.values());

      onUpdateUsers(mergedList);
      setUploadFeedback({
        type: 'success',
        message: `Successfully imported ${parsedUsers.length} staff records from Excel!`
      });
      setSelectedDept('ALL');
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err) {
      console.error('Excel upload error:', err);
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Failed to parse Excel file.'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Users');
      sheet.columns = [
        { header: 'User ID', key: 'id', width: 15 },
        { header: 'User Name', key: 'name', width: 25 },
        { header: 'Department', key: 'department', width: 25 },
        { header: 'Role Name', key: 'roleName', width: 25 },
        { header: 'E-mail Address', key: 'email', width: 25 },
        { header: 'Employee Number', key: 'empNo', width: 18 }
      ];

      sheet.addRow({
        id: 'USR101',
        name: 'Ahmed Al Mansoori',
        department: 'Service',
        roleName: 'Service Advisor',
        email: 'ahmed.m@agmc.ae',
        empNo: '5021'
      });
      sheet.addRow({
        id: 'USR102',
        name: 'Fatima Al Zarooni',
        department: 'Sales',
        roleName: 'Sales Consultant',
        email: 'fatima.z@agmc.ae',
        empNo: '5022'
      });
      sheet.addRow({
        id: 'USR103',
        name: 'Suresh Kumar',
        department: 'Parts',
        roleName: 'Parts Specialist',
        email: 'suresh.k@agmc.ae',
        empNo: '5023'
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AGMC_Users_Upload_Template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating template:', e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Feedback Toast */}
      {uploadFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn ${
            uploadFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {uploadFeedback.type === 'success' ? (
              <FaCheckCircle className="text-emerald-600 text-sm" />
            ) : (
              <FaExclamationTriangle className="text-rose-600 text-sm" />
            )}
            <span>{uploadFeedback.message}</span>
          </div>
          <button
            onClick={() => setUploadFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, user ID, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Action Buttons: Add User, Excel Bulk Upload, Download Template */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Download Template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer"
            title="Download blank Excel sample template"
          >
            <FaDownload className="text-[10px]" />
            <span className="hidden sm:inline">Template</span>
          </button>

          {/* Hidden Excel File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          {/* Bulk Upload Excel */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <FaSpinner className="animate-spin text-xs" />
            ) : (
              <FaFileExcel className="text-xs" />
            )}
            <span>Bulk Upload (Excel)</span>
          </button>

          {/* Add Single User */}
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <FaUserPlus className="text-xs" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="bg-white px-4 py-2.5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1 mr-1 shrink-0">
          <FaFilter className="text-[10px]" /> Filter:
        </span>
        {departmentList.map((dept) => {
          const isSelected = selectedDept === dept;
          const count =
            dept === 'ALL'
              ? users.length
              : users.filter((u) => matchesDepartment(u, dept)).length;

          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{dept}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Users Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-bold text-slate-700">{filteredUsers.length}</span> of{' '}
          <span className="font-bold text-slate-700">{users.length}</span> total staff
        </span>
        {selectedDept !== 'ALL' && (
          <span className="text-indigo-600 font-semibold">Active Filter: {selectedDept}</span>
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
              {filteredUsers.slice(0, 150).map((u) => (
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
                      {u.department || u.departmentType || 'General'}
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
                    No users found matching your search or filter.
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
                  {departmentList
                    .filter((d) => d !== 'ALL')
                    .map((d) => (
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
