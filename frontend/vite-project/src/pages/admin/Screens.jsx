import React, { useState, useEffect, useCallback } from 'react';
import { Tv, Plus, Pencil, Building2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../api/admin.api.js';
import DataTable from '../../components/admin/DataTable.jsx';
import LayoutBuilder from '../../components/admin/LayoutBuilder.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';

export const Screens = () => {
  const [theatres, setTheatres] = useState([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [theatreForScreen, setTheatreForScreen] = useState('');
  const [screenName, setScreenName] = useState('');
  const [layoutRows, setLayoutRows] = useState([
    { label: 'A', seatCount: 10, category: 'Classic', aisleAfter: [5] },
    { label: 'B', seatCount: 10, category: 'Classic', aisleAfter: [5] },
    { label: 'C', seatCount: 8, category: 'Prime', aisleAfter: [4] },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch theatres for dropdown
  useEffect(() => {
    adminApi.getTheatres().then((res) => {
      const data = res?.data || res;
      const list = Array.isArray(data) ? data : data?.items || [];
      setTheatres(list);
      if (list.length > 0 && !selectedTheatreId) {
        setSelectedTheatreId(list[0].id || list[0]._id);
      }
    });
  }, []);

  // Fetch screens for selected theatre
  const fetchScreens = useCallback(async () => {
    if (!selectedTheatreId) return;
    setLoading(true);
    try {
      const res = await adminApi.getScreens({ theatre: selectedTheatreId });
      const data = res?.data || res;
      setScreens(Array.isArray(data) ? data : data?.items || []);
    } catch {
      toast.error('Failed to load screens.');
    } finally {
      setLoading(false);
    }
  }, [selectedTheatreId]);

  useEffect(() => {
    fetchScreens();
  }, [fetchScreens]);

  const handleOpenCreate = () => {
    setEditingScreen(null);
    setTheatreForScreen(selectedTheatreId || (theatres[0]?.id || theatres[0]?._id));
    setScreenName('');
    setLayoutRows([
      { label: 'A', seatCount: 12, category: 'Classic', aisleAfter: [6] },
      { label: 'B', seatCount: 12, category: 'Classic', aisleAfter: [6] },
      { label: 'C', seatCount: 10, category: 'Prime', aisleAfter: [5] },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (screen) => {
    setEditingScreen(screen);
    setTheatreForScreen(screen.theatre?.id || screen.theatre?._id || screen.theatre || selectedTheatreId);
    setScreenName(screen.name || '');
    setLayoutRows(screen.layout?.rows || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!theatreForScreen || !screenName.trim()) {
      toast.error('Please specify theatre and screen name.');
      return;
    }
    if (layoutRows.length === 0) {
      toast.error('At least one row is required in the layout.');
      return;
    }

    setSubmitting(true);
    const payload = {
      theatre: theatreForScreen,
      name: screenName.trim(),
      layout: {
        rows: layoutRows.map((r) => ({
          label: r.label.trim().toUpperCase(),
          seatCount: parseInt(r.seatCount, 10),
          category: r.category.trim(),
          aisleAfter: Array.isArray(r.aisleAfter) ? r.aisleAfter : [],
        })),
      },
    };

    try {
      if (editingScreen) {
        await adminApi.updateScreen(editingScreen.id || editingScreen._id, payload);
        toast.success('Screen updated successfully.');
      } else {
        await adminApi.createScreen(payload);
        toast.success('Screen created successfully.');
      }
      setIsModalOpen(false);
      fetchScreens();
    } catch (err) {
      toast.error(err?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Screen Name',
      render: (s) => (
        <span className="font-bold text-ink flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5 text-primary" />
          <span>{s.name}</span>
        </span>
      ),
    },
    {
      key: 'totalSeats',
      label: 'Capacity',
      render: (s) => (
        <span className="font-bold text-ink flex items-center gap-1">
          <Users className="w-3 h-3 text-muted" />
          <span>{s.totalSeats} seats</span>
        </span>
      ),
    },
    {
      key: 'rows',
      label: 'Rows & Categories',
      render: (s) => {
        const rows = s.layout?.rows || [];
        const categories = Array.from(new Set(rows.map((r) => r.category)));
        return (
          <span className="text-muted text-[11px]">
            {rows.length} rows ({categories.join(', ')})
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => handleOpenEdit(s)}
            className="p-1.5 rounded-sm hover:bg-gray-100 text-ink hover:text-primary transition-colors cursor-pointer"
            title="Edit screen layout"
          >
            <Pencil className="w-3.5 h-3.5" />
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
          <h1 className="text-2xl font-black text-ink tracking-tight">Cinema Screens</h1>
          <p className="text-xs text-muted mt-0.5">
            Configure auditorium layouts, seat numbering, and category pricing tiers.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="gap-2 font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Screen</span>
        </Button>
      </div>

      {/* Theatre Selector Bar */}
      <div className="bg-white p-4 rounded-lg border border-border shadow-card flex items-center gap-3">
        <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-xs font-bold text-ink">Select Theatre:</span>
        <select
          value={selectedTheatreId}
          onChange={(e) => setSelectedTheatreId(e.target.value)}
          className="bg-gray-50 border border-border rounded-xs px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:border-primary max-w-xs"
        >
          {theatres.map((t) => (
            <option key={t.id || t._id} value={t.id || t._id}>
              {t.name} ({t.city})
            </option>
          ))}
        </select>
      </div>

      {/* Screens Table */}
      <DataTable
        columns={columns}
        data={screens}
        loading={loading}
        emptyMessage="No screens configured for this theatre yet."
      />

      {/* Screen Layout Modal with LayoutBuilder */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingScreen ? 'Edit Screen Layout' : 'Create New Screen'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Theatre</label>
              <select
                value={theatreForScreen}
                onChange={(e) => setTheatreForScreen(e.target.value)}
                required
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              >
                {theatres.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Screen / Audi Name</label>
              <input
                type="text"
                required
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder="e.g. Audi 1 or IMAX Hall"
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Dynamic Layout Builder */}
          <LayoutBuilder rows={layoutRows} onChange={setLayoutRows} />

          {/* Form Actions */}
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
              {submitting ? 'Saving Screen...' : editingScreen ? 'Update Screen' : 'Save Screen'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Screens;
