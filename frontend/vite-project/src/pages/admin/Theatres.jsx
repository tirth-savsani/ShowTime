import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Power,
  MapPin,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../api/admin.api.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';

const AMENITY_OPTIONS = [
  'M-Ticket',
  'Food & Beverage',
  'Parking',
  'Dolby Atmos',
  'Wheelchair Accessible',
  'Recliner Seats',
];

export const Theatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState(['M-Ticket', 'Food & Beverage']);
  const [submitting, setSubmitting] = useState(false);

  const fetchTheatres = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTheatres({ search: search.trim() || undefined });
      const data = res?.data || res;
      setTheatres(Array.isArray(data) ? data : data?.items || []);
    } catch {
      toast.error('Failed to load theatres.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTheatres();
  }, [fetchTheatres]);

  const handleOpenCreate = () => {
    setEditingTheatre(null);
    setName('');
    setCity('');
    setAddress('');
    setSelectedAmenities(['M-Ticket', 'Food & Beverage']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (theatre) => {
    setEditingTheatre(theatre);
    setName(theatre.name || '');
    setCity(theatre.city || '');
    setAddress(theatre.address || '');
    setSelectedAmenities(theatre.amenities || ['M-Ticket']);
    setIsModalOpen(true);
  };

  const handleToggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !address.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      amenities: selectedAmenities,
    };

    try {
      if (editingTheatre) {
        await adminApi.updateTheatre(editingTheatre.id || editingTheatre._id, payload);
        toast.success('Theatre updated successfully.');
      } else {
        await adminApi.createTheatre(payload);
        toast.success('Theatre created successfully.');
      }
      setIsModalOpen(false);
      fetchTheatres();
    } catch (err) {
      toast.error(err?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (theatre) => {
    const nextStatus = !theatre.isActive;
    try {
      await adminApi.updateTheatreStatus(theatre.id || theatre._id, nextStatus);
      toast.success(`Theatre ${nextStatus ? 'activated' : 'deactivated'}.`);
      fetchTheatres();
    } catch (err) {
      toast.error(err?.message || 'Failed to update theatre status.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Theatre Name',
      render: (t) => (
        <div>
          <span className="font-bold text-ink block">{t.name}</span>
          <span className="text-[10px] text-muted">{t.address}</span>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'City',
      render: (t) => (
        <span className="font-semibold text-ink flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary" />
          <span>{t.city}</span>
        </span>
      ),
    },
    {
      key: 'amenities',
      label: 'Amenities',
      render: (t) => (
        <span className="text-muted text-[11px]">
          {t.amenities?.join(', ') || 'Standard'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (t) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            t.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {t.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(t)}
            className="p-1.5 rounded-sm hover:bg-gray-100 text-ink hover:text-primary transition-colors cursor-pointer"
            title="Edit theatre"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(t)}
            className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
              t.isActive
                ? 'hover:bg-red-50 text-muted hover:text-danger'
                : 'hover:bg-emerald-50 text-muted hover:text-emerald-600'
            }`}
            title={t.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight">Theatres & Venues</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage cinema complexes, host cities, and venue-wide amenities.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="gap-2 font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Theatre</span>
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={theatres}
        loading={loading}
        emptyMessage="No theatres registered."
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search theatres by name or city..."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTheatre ? 'Edit Theatre' : 'Add New Theatre'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-ink mb-1">Theatre Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PVR Grand Cinemas"
              className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1">City</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1">Address</label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full street address..."
              className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Amenities</label>
            <div className="flex flex-wrap gap-1.5">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-ink border-border hover:border-gray-400'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingTheatre ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Theatres;
