import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { useMovies } from '../context/MovieContext';
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Film,
  Sparkles,
  AlertTriangle,
  FileVideo,
  Image as ImageIcon
} from 'lucide-react';

const AdminPage = () => {
  const { movies, addMovie, updateMovie, deleteMovie } = useMovies();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Action');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [duration, setDuration] = useState('2h 00m');
  const [planRequired, setPlanRequired] = useState('super');
  const [posterFile, setPosterFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit modal state
  const [editingMovie, setEditingMovie] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      // Create local object URL for preview
      const preview = URL.createObjectURL(file);
      setPosterPreview(preview);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setUploadSuccess(false);

    if (!title.trim() || !description.trim()) {
      setFormError('Please fill in title and description.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await addMovie(
        {
          title,
          description,
          genre,
          year,
          duration,
          plan_required: planRequired,
          posterUrl: posterPreview || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
          posterFileName: posterFile?.name,
          videoFileName: videoFile?.name
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadSuccess(true);
      // Reset form
      setTitle('');
      setDescription('');
      setPosterFile(null);
      setVideoFile(null);
      setPosterPreview('');
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      setFormError(err.message || 'Failed to upload movie');
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this title?')) {
      await deleteMovie(id);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMovie) return;
    await updateMovie(editingMovie.id, {
      title: editingMovie.title,
      description: editingMovie.description,
      plan_required: editingMovie.plan_required,
      status: editingMovie.status
    });
    setEditingMovie(null);
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-dodger/20 text-blue-dodger text-xs font-bold uppercase tracking-wider mb-2">
            Administrator Console
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Movie Catalog Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Ingest master videos for HLS packaging and administer catalog permissions.
          </p>
        </div>

        {/* Upload Form Card (#232F3E) */}
        <section className="bg-bg-surface border border-text-muted/20 rounded-lg p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-text-muted/20 pb-4">
            <Upload className="w-5 h-5 text-blue-prime" />
            <h2 className="text-xl font-bold text-text-primary">
              Upload New Movie / Master Media
            </h2>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <Input
                label="Movie Title"
                placeholder="e.g. Interstellar Odyssey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              {/* Year & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Release Year"
                  type="number"
                  placeholder="2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
                <Input
                  label="Duration"
                  placeholder="2h 15m"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              {/* Genre Selector */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Primary Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-bg-surface text-text-primary border border-text-muted/20 rounded-lg py-2.5 px-3 text-sm focus:border-blue-prime focus:ring-2 focus:ring-blue-prime outline-none"
                >
                  <option value="Action">Action</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Drama">Drama</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Documentary">Documentary</option>
                </select>
              </div>

              {/* Plan Required Selector */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Required Plan Access
                </label>
                <select
                  value={planRequired}
                  onChange={(e) => setPlanRequired(e.target.value)}
                  className="w-full bg-bg-surface text-text-primary border border-text-muted/20 rounded-lg py-2.5 px-3 text-sm focus:border-blue-prime focus:ring-2 focus:ring-blue-prime outline-none"
                >
                  <option value="mobile">Mobile (Basic)</option>
                  <option value="super">Super (Full HD)</option>
                  <option value="premium">Premium (4K Ultra HD)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Synopsis / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter compelling synopsis..."
                className="w-full bg-bg-surface text-text-primary placeholder:text-text-muted/60 border border-text-muted/20 rounded-lg p-3 text-sm focus:border-blue-prime focus:ring-2 focus:ring-blue-prime outline-none resize-none"
                required
              />
            </div>

            {/* File Uploads: Poster & Video File */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Poster file input */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Poster Image (JPG/PNG)
                </label>
                <label className="border-2 border-dashed border-text-muted/30 hover:border-blue-prime rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-bg-base/40">
                  <ImageIcon className="w-6 h-6 text-text-muted mb-2" />
                  <span className="text-xs text-text-muted">
                    {posterFile ? posterFile.name : 'Click to select poster image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Video master file input */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Master Video File (MP4/MKV)
                </label>
                <label className="border-2 border-dashed border-text-muted/30 hover:border-blue-prime rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-bg-base/40">
                  <FileVideo className="w-6 h-6 text-text-muted mb-2" />
                  <span className="text-xs text-text-muted">
                    {videoFile ? videoFile.name : 'Click to select master video file'}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Upload Progress Bar (when active) */}
            {isUploading && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-primary">Uploading & Transcoding HLS...</span>
                  <span className="text-blue-prime">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-text-muted/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-prime transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error or Success banners */}
            {formError && (
              <p className="text-xs text-error font-medium">{formError}</p>
            )}
            {uploadSuccess && (
              <p className="text-xs text-success font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Movie queued successfully! Transcoding status is now active.
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isUploading}
                icon={Upload}
              >
                Upload & Ingest Title
              </Button>
            </div>
          </form>
        </section>

        {/* Movies Table */}
        <section className="bg-bg-surface border border-text-muted/20 rounded-lg p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-text-muted/20 pb-4">
            <h2 className="text-xl font-bold text-text-primary">
              Catalog Titles ({movies.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-text-muted uppercase border-b border-text-muted/20 bg-bg-base/40">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Tier Required</th>
                  <th className="py-3 px-4">Transcoding Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text-muted/10">
                {movies.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-base/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-primary flex items-center gap-3">
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-8 h-12 object-cover rounded"
                      />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{m.title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">{m.year}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-dodger text-text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {m.plan_required}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {m.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-prime bg-blue-prime/10 px-2.5 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          Processing HLS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingMovie({ ...m })}
                          className="p-1.5 rounded text-text-muted hover:text-blue-prime hover:bg-bg-base transition-colors"
                          aria-label={`Edit ${m.title}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded text-text-muted hover:text-error hover:bg-bg-base transition-colors"
                          aria-label={`Delete ${m.title}`}
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
        </section>
      </main>

      {/* Edit Movie Modal */}
      <Modal
        isOpen={!!editingMovie}
        onClose={() => setEditingMovie(null)}
        title="Edit Movie Details"
      >
        {editingMovie && (
          <div className="p-6 space-y-5">
            <Input
              label="Title"
              value={editingMovie.title}
              onChange={(e) =>
                setEditingMovie({ ...editingMovie, title: e.target.value })
              }
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Synopsis
              </label>
              <textarea
                rows={3}
                value={editingMovie.description}
                onChange={(e) =>
                  setEditingMovie({ ...editingMovie, description: e.target.value })
                }
                className="w-full bg-bg-surface text-text-primary border border-text-muted/20 rounded-lg p-3 text-sm focus:border-blue-prime focus:ring-2 focus:ring-blue-prime outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Required Plan
                </label>
                <select
                  value={editingMovie.plan_required}
                  onChange={(e) =>
                    setEditingMovie({ ...editingMovie, plan_required: e.target.value })
                  }
                  className="w-full bg-bg-surface text-text-primary border border-text-muted/20 rounded-lg py-2.5 px-3 text-sm outline-none"
                >
                  <option value="mobile">Mobile</option>
                  <option value="super">Super</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Status
                </label>
                <select
                  value={editingMovie.status}
                  onChange={(e) =>
                    setEditingMovie({ ...editingMovie, status: e.target.value })
                  }
                  className="w-full bg-bg-surface text-text-primary border border-text-muted/20 rounded-lg py-2.5 px-3 text-sm outline-none"
                >
                  <option value="ready">Ready</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-text-muted/20">
              <Button variant="secondary" onClick={() => setEditingMovie(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default AdminPage;
