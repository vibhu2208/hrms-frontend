import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createAllowedNetwork, deleteAllowedNetwork, listAllowedNetworks } from '../../api/network';

const AllowedNetworks = () => {
  const [loading, setLoading] = useState(true);
  const [networks, setNetworks] = useState([]);

  const [networkName, setNetworkName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [location, setLocation] = useState('');

  const canSubmit = useMemo(() => {
    return networkName.trim() && ipAddress.trim();
  }, [networkName, ipAddress]);

  const fetchNetworks = async () => {
    try {
      setLoading(true);
      const res = await listAllowedNetworks();
      setNetworks(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load allowed networks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      if (!canSubmit) return;
      await createAllowedNetwork({
        networkName: networkName.trim(),
        ipAddress: ipAddress.trim(),
        location: location.trim()
      });
      toast.success('Network added');
      setNetworkName('');
      setIpAddress('');
      setLocation('');
      fetchNetworks();
    } catch (e2) {
      toast.error(e2?.response?.data?.message || 'Failed to add network');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAllowedNetwork(id);
      toast.success('Network removed');
      fetchNetworks();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to remove network');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold theme-text">Allowed Office Networks</h1>
        <p className="mt-1 theme-text-secondary">
          Employees can mark attendance only when their public IP matches one of the whitelisted office IPs.
        </p>
      </div>

      <div className="theme-surface border theme-border rounded-xl p-6">
        <h2 className="text-lg font-semibold theme-text mb-4">Add Network</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2 theme-text">Network Name</label>
            <input
              value={networkName}
              onChange={(e) => setNetworkName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border theme-border theme-surface"
              placeholder="Office WiFi"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 theme-text">Public IP Address</label>
            <input
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border theme-border theme-surface"
              placeholder="103.208.68.87"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 theme-text">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border theme-border theme-surface"
              placeholder="Delhi Office"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                canSubmit ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              Add Network
            </button>
          </div>
        </form>
      </div>

      <div className="theme-surface border theme-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold theme-text">Whitelisted Networks</h2>
          <button
            onClick={fetchNetworks}
            className="px-4 py-2 rounded-lg border theme-border theme-surface hover:bg-gray-50 dark:hover:bg-dark-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center theme-text-secondary">Loading...</div>
        ) : networks.length === 0 ? (
          <div className="py-10 text-center theme-text-secondary">No office IPs added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b theme-border">
                  <th className="text-left py-3 px-2 theme-text-secondary">Network</th>
                  <th className="text-left py-3 px-2 theme-text-secondary">IP</th>
                  <th className="text-left py-3 px-2 theme-text-secondary">Location</th>
                  <th className="text-right py-3 px-2 theme-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {networks.map((n) => (
                  <tr key={n._id} className="border-b theme-border">
                    <td className="py-3 px-2 theme-text">{n.networkName}</td>
                    <td className="py-3 px-2 theme-text">{n.ipAddress}</td>
                    <td className="py-3 px-2 theme-text">{n.location || '-'}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllowedNetworks;
