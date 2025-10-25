import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/api/clients/${id}`);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      inactive: 'badge-default',
      suspended: 'badge-danger'
    };
    return badges[status] || 'badge-default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-gray-400 mt-1">Manage client relationships</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Client</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client._id} className="card hover:border-primary-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <Building2 size={24} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                  <p className="text-sm text-gray-400">{client.clientCode}</p>
                </div>
              </div>
              <span className={`badge ${getStatusBadge(client.status)}`}>
                {client.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Company:</span>
                <span>{client.companyName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Email:</span>
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Phone:</span>
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Billing:</span>
                <span className="capitalize">{client.billingType}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-dark-800">
              <Link
                to={`/clients/${client._id}`}
                className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1"
              >
                <Eye size={16} />
                <span>View</span>
              </Link>
              <button className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1">
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(client._id)}
                className="btn-outline text-sm py-2 px-3 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No clients found</p>
        </div>
      )}
    </div>
  );
};

export default ClientList;
