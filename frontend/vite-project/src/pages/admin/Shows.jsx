import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../api/admin.api.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';

export const Shows = () => {
  const [shows, setShows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter dropdowns
  const [moviesList, setMoviesList] = useState([]);
  const [theatresList, setTheatresList] = useState([]);
  const [screensList, setScreensList] = useState([]);

  const [filterMovie, setFilterMovie] = useState('');
  const [filterTheatre, setFilterTheatre] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Schedule modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [language, setLanguage] = useState('');
  const [format, setFormat] = useState('2D');
  const [pricing, setPricing] = useState({});
  const [overlapError, setOverlapError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Cancellation modal state
  const [cancelModalShow, setCancelModalShow] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Fetch initial dropdown options
  useEffect(() => {
    adminApi.getMovies({ limit: 50 }).then((res) => {
      const data = res?.data || res;
      setMoviesList(Array.isArray(data) ? data : data?.items || []);
    });
    adminApi.getTheatres().then((res) => {
      const data = res?.data || res;
      setTheatresList(Array.isArray(data) ? data : data?.items || []);
    });
  }, []);

  // Fetch screens when modal theatre changes
  useEffect(() => {
    if (!selectedTheatreId) {
      setScreensList([]);
      return;
    }
    adminApi.getScreens({ theatre: selectedTheatreId }).then((res) => {
      const data = res?.data || res;
      const list = Array.isArray(data) ? data : data?.items || [];
      setScreensList(list);
      if (list.length > 0) {
        setSelectedScreenId(list[0].id || list[0]._id);
      } else {
        setSelectedScreenId('');
      }
    });
  }, [selectedTheatreId]);

  // Dynamically extract categories from chosen screen to generate pricing inputs (Spec C7, C8)
  const screenCategories = useMemo(() => {
    const screen = screensList.find((s) => (s.id || s._id) === selectedScreenId);
    if (!screen || !screen.layout?.rows) return ['Classic'];
    const cats = Array.from(new Set(screen.layout.rows.map((r) => r.category)));
    return cats.length > 0 ? cats : ['Classic'];
  }, [screensList, selectedScreenId]);

  // Keep pricing map synchronized with screen categories
  useEffect(() => {
    setPricing((prev) => {
      const next = { ...prev };
      screenCategories.forEach((cat) => {
        if (!next[cat]) next[cat] = 200;
      });
      return next;
    });
  }, [screenCategories]);

  // Fetch shows
  const fetchShows = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filterMovie) params.movie = filterMovie;
      if (filterTheatre) params.theatre = filterTheatre;
      if (filterDate) params.date = filterDate;

      const res = await adminApi.getShows(params);
      const data = res?.data || res;
      setShows(data?.items || []);
      setPagination(data?.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load shows.');
    } finally {
      setLoading(false);
    }
  }, [filterMovie, filterTheatre, filterDate]);

  useEffect(() => {
    fetchShows(1);
  }, [fetchShows]);

  const handleOpenSchedule = () => {
    setOverlapError('');
    if (moviesList.length > 0) {
      setSelectedMovieId(moviesList[0].id || moviesList[0]._id);
      setLanguage(moviesList[0].languages?.[0] || 'Hindi');
      setFormat(moviesList[0].formats?.[0] || '2D');
    }
    if (theatresList.length > 0) {
      setSelectedTheatreId(theatresList[0].id || theatresList[0]._id);
    }
    // Set default tomorrow at 18:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    setStartTime(tomorrow.toISOString().slice(0, 16));
    setIsModalOpen(true);
  };

  const handleMovieChange = (movieId) => {
    setSelectedMovieId(movieId);
    const m = moviesList.find((x) => (x.id || x._id) === movieId);
    if (m) {
      if (m.languages?.length > 0) setLanguage(m.languages[0]);
      if (m.formats?.length > 0) setFormat(m.formats[0]);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setOverlapError('');

    if (!selectedMovieId || !selectedScreenId || !startTime) {
      toast.error('Please fill in all show details.');
      return;
    }

    setSubmitting(true);
    const payload = {
      movie: selectedMovieId,
      screen: selectedScreenId,
      startTime: new Date(startTime).toISOString(),
      language,
      format,
      pricing: Object.fromEntries(
        Object.entries(pricing).map(([k, v]) => [k, parseInt(v, 10) || 0])
      ),
    };

    try {
      await adminApi.createShow(payload);
      toast.success('Show scheduled successfully.');
      setIsModalOpen(false);
      fetchShows(pagination.page);
    } catch (err) {
      const msg = err?.message || 'Failed to schedule show.';
      if (err?.code === 'SHOW_OVERLAP' || err?.status === 409) {
        setOverlapError(`Scheduling Conflict: ${msg}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalShow) return;
    setCancelling(true);
    try {
      await adminApi.cancelShow(cancelModalShow.id || cancelModalShow._id);
      toast.success('Show cancelled.');
      setCancelModalShow(null);
      fetchShows(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel show.');
    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const columns = [
    {
      key: 'movie',
      label: 'Movie',
      render: (s) => (
        <div>
          <span className="font-bold text-ink block">{s.movie?.title}</span>
          <span className="text-[10px] text-primary font-semibold uppercase">
            {s.format} • {s.language}
          </span>
        </div>
      ),
    },
    {
      key: 'theatre',
      label: 'Theatre & Screen',
      render: (s) => (
        <div>
          <span className="font-semibold text-ink block">{s.theatre?.name}</span>
          <span className="text-[10px] text-muted">{s.screen?.name}</span>
        </div>
      ),
    },
    {
      key: 'startTime',
      label: 'Timing',
      render: (s) => (
        <span className="font-medium text-ink flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted" />
          <span>{formatDateTime(s.startTime)}</span>
        </span>
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing Tiers',
      render: (s) => {
        const pr = s.pricing || {};
        const entries = Object.entries(pr);
        return (
          <span className="text-muted text-[11px]">
            {entries.map(([k, v]) => `${k}: ₹${v}`).join(' • ')}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (s) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            s.status === 'scheduled'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-danger'
          }`}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end">
          {s.status === 'scheduled' && (
            <button
              type="button"
              onClick={() => setCancelModalShow(s)}
              className="p-1.5 rounded-sm hover:bg-red-50 text-muted hover:text-danger transition-colors cursor-pointer"
              title="Cancel show"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const currentMovie = moviesList.find((m) => (m.id || m._id) === selectedMovieId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight">Show Schedules</h1>
          <p className="text-xs text-muted mt-0.5">
            Schedule screening sessions, configure show formats, and set category pricing.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenSchedule}
          className="gap-2 font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Show</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-border shadow-card flex flex-wrap items-center gap-3">
        {/* Movie Filter */}
        <select
          value={filterMovie}
          onChange={(e) => setFilterMovie(e.target.value)}
          className="bg-gray-50 border border-border rounded-xs px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
        >
          <option value="">All Movies</option>
          {moviesList.map((m) => (
            <option key={m.id || m._id} value={m.id || m._id}>
              {m.title}
            </option>
          ))}
        </select>

        {/* Theatre Filter */}
        <select
          value={filterTheatre}
          onChange={(e) => setFilterTheatre(e.target.value)}
          className="bg-gray-50 border border-border rounded-xs px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
        >
          <option value="">All Theatres</option>
          {theatresList.map((t) => (
            <option key={t.id || t._id} value={t.id || t._id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="bg-gray-50 border border-border rounded-xs px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
        />

        {(filterMovie || filterTheatre || filterDate) && (
          <button
            type="button"
            onClick={() => {
              setFilterMovie('');
              setFilterTheatre('');
              setFilterDate('');
            }}
            className="text-xs font-semibold text-primary hover:text-primary-dark ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Shows Table */}
      <DataTable
        columns={columns}
        data={shows}
        loading={loading}
        emptyMessage="No scheduled shows match your criteria."
        pagination={{
          page: pagination.page,
          pages: pagination.pages,
          onPageChange: (newPage) => fetchShows(newPage),
        }}
      />

      {/* Schedule Show Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Screening Session"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 py-2">
          {/* Overlap Error Alert */}
          {overlapError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-danger font-semibold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{overlapError}</span>
            </div>
          )}

          {/* Select Movie */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">Movie</label>
            <select
              value={selectedMovieId}
              onChange={(e) => handleMovieChange(e.target.value)}
              required
              className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
            >
              {moviesList.map((m) => (
                <option key={m.id || m._id} value={m.id || m._id}>
                  {m.title} ({m.durationMin} mins)
                </option>
              ))}
            </select>
          </div>

          {/* Theatre & Screen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Theatre</label>
              <select
                value={selectedTheatreId}
                onChange={(e) => setSelectedTheatreId(e.target.value)}
                required
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              >
                {theatresList.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Screen / Hall</label>
              <select
                value={selectedScreenId}
                onChange={(e) => setSelectedScreenId(e.target.value)}
                required
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              >
                {screensList.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.name} ({s.totalSeats} seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Start Date & Time (Future)
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
            />
          </div>

          {/* Language & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              >
                {(currentMovie?.languages || ['Hindi']).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                required
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              >
                {(currentMovie?.formats || ['2D']).map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC PRICING INPUTS (MUST GET RIGHT: generated from screen's layout categories) */}
          <div className="p-3 bg-gray-50 border border-border rounded-md space-y-2.5">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              Category Pricing (₹)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {screenCategories.map((cat) => (
                <div key={cat}>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    {cat}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={50}
                      max={5000}
                      required
                      value={pricing[cat] || 200}
                      onChange={(e) =>
                        setPricing({ ...pricing, [cat]: e.target.value })
                      }
                      className="w-full pl-6 pr-2 py-1 bg-white border border-border rounded-xs text-xs font-bold text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule Show'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Show Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelModalShow)}
        onClose={() => setCancelModalShow(null)}
        title="Cancel Screening?"
        maxWidth="max-w-md"
      >
        {cancelModalShow && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to cancel the <span className="font-bold text-ink">{cancelModalShow.movie?.title}</span> screening at {cancelModalShow.theatre?.name}?
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setCancelModalShow(null)}
                disabled={cancelling}
              >
                Keep Show
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Shows;
