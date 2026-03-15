import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Trash2, Edit2, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

const formatDateTime = (value) => {
    if (!value) {
        return '—';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString();
};

const parseBrowserFromUserAgent = (userAgent = '') => {
    const ua = userAgent.toLowerCase();

    if (!ua) return 'Unknown';
    if (ua.includes('edg/')) return 'Microsoft Edge';
    if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
    if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
    if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
    if (ua.includes('firefox/')) return 'Firefox';

    return 'Unknown';
};

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSessions, setUserSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [sessionsError, setSessionsError] = useState(null);
    const [expandedSessions, setExpandedSessions] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const roleOptions = ['Admin', 'Operator', 'Viewer'];

    // Form states
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: '',
        password: '' // Optional, for password change
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleUserRowClick = async (user) => {
        setSelectedUser(user);
        setSessionsLoading(true);
        setSessionsError(null);
        setExpandedSessions({});

        try {
            const response = await api.get(`/user/${user.id}/sessions`);
            setUserSessions(response.data);
        } catch (err) {
            try {
                const fallbackResponse = await api.get(`/users/${user.id}/sessions`);
                setUserSessions(fallbackResponse.data);
            } catch (fallbackErr) {
                setSessionsError('Failed to fetch session history');
                setUserSessions([]);
            }
        } finally {
            setSessionsLoading(false);
        }
    };

    const toggleSessionExpanded = (sessionId) => {
        setExpandedSessions((prev) => ({
            ...prev,
            [sessionId]: !prev[sessionId],
        }));
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            password: ''
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                id: editingUser.id,
                name: editForm.name,
                email: editForm.email,
                role: editForm.role
            };

            // Note: Password update might not be supported by backend yet, but sending it if present
            if (editForm.password) {
                payload.password = editForm.password;
            }

            await api.post('/user', payload);

            // Refresh list
            fetchUsers();
            setEditingUser(null);
        } catch (err) {
            console.error("Failed to update user", err);
            alert("Failed to update user. Please try again.");
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            // Note: DELETE /user might not be supported by backend yet
            await api.delete('/user', { data: { id: userId } });
            fetchUsers();
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete user", err);
            alert("Failed to delete user. Backend might not support this operation yet.");
            setShowDeleteConfirm(null);
        }
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return {
                    key,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc',
                };
            }

            return { key, direction: 'asc' };
        });
    };

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm.toLowerCase();
        return users.filter((user) =>
            user.name.toLowerCase().includes(normalizedSearch) ||
            user.email.toLowerCase().includes(normalizedSearch)
        );
    }, [users, searchTerm]);

    const sortedUsers = useMemo(() => {
        const sorted = [...filteredUsers].sort((a, b) => {
            let comparison = 0;

            if (sortConfig.key === 'last_sign_on') {
                const dateA = a.last_sign_on ? new Date(a.last_sign_on).getTime() : 0;
                const dateB = b.last_sign_on ? new Date(b.last_sign_on).getTime() : 0;
                comparison = dateA - dateB;
            } else if (sortConfig.key === 'id') {
                const idA = Number(a.id) || 0;
                const idB = Number(b.id) || 0;
                comparison = idA - idB;
            } else {
                const valueA = String(a[sortConfig.key] ?? '').toLowerCase();
                const valueB = String(b[sortConfig.key] ?? '').toLowerCase();
                comparison = valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: 'base' });
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [filteredUsers, sortConfig]);

    const renderSortIndicator = (key) => {
        if (sortConfig.key !== key) {
            return <ChevronDown className="w-4 h-4 text-gray-500" />;
        }

        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 text-primary" />
            : <ChevronDown className="w-4 h-4 text-primary" />;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Shield className="w-8 h-8 text-primary" />
                            Admin Panel
                        </h1>
                        <p className="text-gray-400 mt-2">Manage users and permissions</p>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('name')}
                                            className="inline-flex items-center gap-2 hover:text-white transition-colors"
                                        >
                                            User
                                            {renderSortIndicator('name')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('role')}
                                            className="inline-flex items-center gap-2 hover:text-white transition-colors"
                                        >
                                            Role
                                            {renderSortIndicator('role')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('last_sign_on')}
                                            className="inline-flex items-center gap-2 hover:text-white transition-colors"
                                        >
                                            Last Sign On
                                            {renderSortIndicator('last_sign_on')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('id')}
                                            className="inline-flex items-center gap-2 hover:text-white transition-colors"
                                        >
                                            ID
                                            {renderSortIndicator('id')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => handleUserRowClick(user)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <span className="text-primary font-bold text-lg">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.name}</div>
                                                    <div className="text-sm text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'Admin'
                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                : user.role === 'Operator'
                                                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                                    : 'bg-gray-700/50 text-gray-300 border-gray-600/50'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                            {formatDateTime(user.last_sign_on)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {user.id}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(user);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDeleteConfirm(user);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Edit User</h2>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                                    >
                                        {roleOptions.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        placeholder="Leave empty to keep current"
                                        className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary text-dark-900 font-medium rounded-lg hover:bg-primary-hover transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-dark-900 border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                    <Trash2 className="w-6 h-6 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                                <p className="text-gray-400 mb-6">
                                    Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="flex-1 px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(showDeleteConfirm.id)}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {/* User Session History Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-6xl p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">User Session History</h2>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Name</p>
                                <p className="text-white font-medium">{selectedUser.name}</p>
                            </div>
                            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</p>
                                <p className="text-white font-medium">{selectedUser.email}</p>
                            </div>
                            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Created At</p>
                                <p className="text-white font-medium">{formatDateTime(selectedUser.created_at)}</p>
                            </div>
                            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Last Sign On</p>
                                <p className="text-white font-medium">{formatDateTime(selectedUser.last_sign_on)}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto border border-white/10 rounded-lg">
                            {sessionsLoading ? (
                                <div className="h-40 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                                </div>
                            ) : sessionsError ? (
                                <div className="p-4 text-red-400">{sessionsError}</div>
                            ) : userSessions.length === 0 ? (
                                <div className="p-4 text-gray-400">No session history available.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 sticky top-0">
                                            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Date/Time</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-gray-300">IP Address</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Browser</th>
                                            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {userSessions.map((session) => (
                                            <React.Fragment key={session.id}>
                                                <tr className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap">
                                                        {formatDateTime(session.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                                                        {session.ip_address || 'unknown'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-300">
                                                        {parseBrowserFromUserAgent(session.user_agent)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <button
                                                            onClick={() => toggleSessionExpanded(session.id)}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-dark-700 text-gray-200 hover:text-white hover:bg-dark-600 transition-colors"
                                                        >
                                                            Raw JSON
                                                            {expandedSessions[session.id] ? (
                                                                <ChevronUp className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedSessions[session.id] && (
                                                    <tr className="bg-black/20">
                                                        <td colSpan={4} className="px-4 py-3">
                                                            <pre className="text-xs text-gray-200 overflow-x-auto whitespace-pre-wrap break-words bg-dark-800 border border-white/10 rounded-lg p-3 max-h-72 overflow-y-auto">
                                                                {JSON.stringify(session.fingerprint_data, null, 2)}
                                                            </pre>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
