import React, { useState, useEffect, useCallback } from 'react';
import {
  Film,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../api/admin.api.js';
import DataTable from '../../components/admin/DataTable.jsx';
import ImageUpload from '../../components/admin/ImageUpload.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';

const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller',
];

const ALL_LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada',
  'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi',
];

const ALL_FORMATS = ['2D', '3D', 'IMAX', '4DX'];
const ALL_CERTIFICATES = ['U', 'UA', 'A', 'S'];

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMin, setDurationMin] = useState(120);
  const [releaseDate, setReleaseDate] = useState('');
  const [certificate, setCertificate] = useState('UA');
  const [status, setStatus] = useState('now_showing');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(['Action']);
  const [selectedLanguages, setSelectedLanguages] = useState(['Hindi']);
  const [selectedFormats, setSelectedFormats] = useState(['2D']);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [backdropFile, setBackdropFile] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState('');
  const [cast, setCast] = useState([]);

  // Soft delete modal state
  const [deleteModalMovie, setDeleteModalMovie] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMovies = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getMovies(params);
      const data = res?.data || res;
      setMovies(data?.items || []);
      setPagination(data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      toast.error('Failed to load movies.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingMovie(null);
    setTitle('');
    setDescription('');
    setDurationMin(120);
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setCertificate('UA');
    setStatus('now_showing');
    setTrailerUrl('');
    setSelectedGenres(['Action']);
    setSelectedLanguages(['Hindi']);
    setSelectedFormats(['2D']);
    setPosterFile(null);
    setPosterPreview('');
    setBackdropFile(null);
    setBackdropPreview('');
    setCast([{ name: '', role: 'Lead Actor' }]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (movie) => {
    setEditingMovie(movie);
    try {
      const res = await adminApi.getMovieById(movie.id || movie._id);
      const m = res?.data || res;

      setTitle(m.title || '');
      setDescription(m.description || '');
      setDurationMin(m.durationMin || 120);
      setReleaseDate(m.releaseDate ? m.releaseDate.split('T')[0] : '');
      setCertificate(m.certificate || 'UA');
      setStatus(m.status || 'now_showing');
      setTrailerUrl(m.trailerUrl || '');
      setSelectedGenres(m.genres || ['Action']);
      setSelectedLanguages(m.languages || ['Hindi']);
      setSelectedFormats(m.formats || ['2D']);
      setPosterFile(null);
      setPosterPreview(m.posterUrl || '');
      setBackdropFile(null);
      setBackdropPreview(m.backdropUrl || '');
      setCast(m.cast && m.cast.length > 0 ? m.cast : [{ name: '', role: 'Actor' }]);
      setIsModalOpen(true);
    } catch {
      toast.error('Failed to load movie details.');
    }
  };

  // Submit Create or Edit
  const handleSubmitMovie = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description.');
      return;
    }
    if (!editingMovie && !posterFile) {
      toast.error('Movie poster is required for new movies.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('durationMin', durationMin);
    formData.append('releaseDate', releaseDate);
    formData.append('certificate', certificate);
    formData.append('status', status);
    formData.append('trailerUrl', trailerUrl.trim());
    formData.append('genres', JSON.stringify(selectedGenres));
    formData.append('languages', JSON.stringify(selectedLanguages));
    formData.append('formats', JSON.stringify(selectedFormats));

    const validCast = cast.filter((c) => c.name.trim() !== '');
    formData.append('cast', JSON.stringify(validCast));

    if (posterFile) formData.append('poster', posterFile);
    if (backdropFile) formData.append('backdrop', backdropFile);

    try {
      if (editingMovie) {
        await adminApi.updateMovie(editingMovie.id || editingMovie._id, formData);
        toast.success('Movie updated successfully.');
      } else {
        await adminApi.createMovie(formData);
        toast.success('Movie created successfully.');
      }
      setIsModalOpen(false);
      fetchMovies(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Soft Delete
  const handleConfirmDelete = async () => {
    if (!deleteModalMovie) return;
    setDeleting(true);
    try {
      await adminApi.deleteMovie(deleteModalMovie.id || deleteModalMovie._id);
      toast.success('Movie archived and removed from public catalogue.');
      setDeleteModalMovie(null);
      fetchMovies(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to archive movie.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      if (list.length === 1) return; // Keep at least one
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const columns = [
    {
      key: 'posterUrl',
      label: 'Poster',
      className: 'w-16',
      render: (m) => (
        <div className="w-10 h-14 rounded-xs overflow-hidden bg-gray-100 border border-border">
          {m.posterUrl ? (
            <img src={m.posterUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Film className="w-4 h-4 opacity-40" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title & Cert',
      render: (m) => (
        <div>
          <span className="font-bold text-ink block">{m.title}</span>
          <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">
            {m.certificate} • {m.durationMin} mins
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (m) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            m.status === 'now_showing'
              ? 'bg-emerald-100 text-emerald-700'
              : m.status === 'coming_soon'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {m.status}
        </span>
      ),
    },
    {
      key: 'genres',
      label: 'Genres',
      render: (m) => (
        <span className="text-muted truncate max-w-[140px] block">
          {m.genres?.join(', ') || 'None'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(m)}
            className="p-1.5 rounded-sm hover:bg-gray-100 text-ink hover:text-primary transition-colors cursor-pointer"
            title="Edit movie"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteModalMovie(m)}
            className="p-1.5 rounded-sm hover:bg-red-50 text-muted hover:text-danger transition-colors cursor-pointer"
            title="Archive / Soft delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
          <h1 className="text-2xl font-black text-ink tracking-tight">Movie Catalogue</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage theatrical releases, poster media, certificates, and cast members.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} className="gap-2 font-bold self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </Button>
      </div>

      {/* Filter Toolbar & Data Table */}
      <DataTable
        columns={columns}
        data={movies}
        loading={loading}
        emptyMessage="No movies found in catalogue."
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search movies by title..."
        headerActions={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-border rounded-xs px-2.5 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="now_showing">Now Showing</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        }
        pagination={{
          page: pagination.page,
          pages: pagination.pages,
          onPageChange: (newPage) => fetchMovies(newPage),
        }}
      />

      {/* Create / Edit Movie Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMovie ? 'Edit Movie' : 'Add New Movie'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitMovie} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          {/* Title & Certificate */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-ink mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Inception"
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Certificate</label>
              <select
                value={certificate}
                onChange={(e) => setCertificate(e.target.value)}
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              >
                {ALL_CERTIFICATES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">Synopsis / Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Movie synopsis..."
              className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Duration, Release Date, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Duration (Min)</label>
              <input
                type="number"
                min={30}
                max={400}
                required
                value={durationMin}
                onChange={(e) => setDurationMin(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Release Date</label>
              <input
                type="date"
                required
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
              >
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Trailer URL */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">YouTube Trailer URL</label>
            <input
              type="url"
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-white border border-border rounded-xs px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
            />
          </div>

          {/* Multi-Select Chips: Genres */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Genres (1-4)</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRES.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleItem(selectedGenres, setSelectedGenres, g)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-ink border-border hover:border-gray-400'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Select Chips: Languages */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Languages (1-4)</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_LANGUAGES.map((l) => {
                const isSelected = selectedLanguages.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleItem(selectedLanguages, setSelectedLanguages, l)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-ink border-border hover:border-gray-400'
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formats */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Available Formats</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_FORMATS.map((fmt) => {
                const isSelected = selectedFormats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleItem(selectedFormats, setSelectedFormats, fmt)}
                    className={`px-3 py-1 rounded-xs text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-navy text-white border-navy shadow-xs'
                        : 'bg-white text-ink border-border hover:border-gray-400'
                    }`}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Uploads: Poster & Backdrop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <ImageUpload
              label="Poster Image (Required)"
              file={posterFile}
              previewUrl={posterPreview}
              onChange={setPosterFile}
              aspectRatio="aspect-[2/3]"
            />
            <ImageUpload
              label="Backdrop Image (Optional)"
              file={backdropFile}
              previewUrl={backdropPreview}
              onChange={setBackdropFile}
              aspectRatio="aspect-video"
            />
          </div>

          {/* Cast Rows */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-ink">Cast Members</label>
              <button
                type="button"
                onClick={() => setCast([...cast, { name: '', role: 'Actor' }])}
                className="text-xs font-semibold text-primary hover:text-primary-dark"
              >
                + Add Cast
              </button>
            </div>
            {cast.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Actor name"
                  value={c.name}
                  onChange={(e) => {
                    const next = [...cast];
                    next[i].name = e.target.value;
                    setCast(next);
                  }}
                  className="flex-1 bg-white border border-border rounded-xs px-2.5 py-1 text-xs text-ink"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Lead)"
                  value={c.role}
                  onChange={(e) => {
                    const next = [...cast];
                    next[i].role = e.target.value;
                    setCast(next);
                  }}
                  className="w-32 bg-white border border-border rounded-xs px-2.5 py-1 text-xs text-ink"
                />
                <button
                  type="button"
                  onClick={() => setCast(cast.filter((_, idx) => idx !== i))}
                  className="text-muted hover:text-danger p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

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
              {submitting ? 'Saving Movie...' : editingMovie ? 'Update Movie' : 'Create Movie'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Modal */}
      <Modal
        isOpen={Boolean(deleteModalMovie)}
        onClose={() => setDeleteModalMovie(null)}
        title="Archive Movie?"
        maxWidth="max-w-md"
      >
        {deleteModalMovie && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted leading-relaxed">
              Archiving <span className="font-bold text-ink">{deleteModalMovie.title}</span> will soft-delete it and remove it from the public cinema discovery screens.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteModalMovie(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Archiving...' : 'Confirm Archive'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Movies;
