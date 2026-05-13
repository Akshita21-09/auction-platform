import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../utils/helpers';
import {
  FiUpload, FiImage, FiX, FiDollarSign, FiClock,
  FiTag, FiAlignLeft, FiType, FiCheckCircle
} from 'react-icons/fi';
import Loader from '../components/common/Loader';

const CreateAuction = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    startingPrice: '',
    endTime: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB');
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageSelect(e.dataTransfer.files[0]);
  };

  const getMinEndTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  };

  const validateStep1 = () => {
    if (!form.title.trim() || form.title.length < 3) return toast.error('Title must be at least 3 characters') || false;
    if (!form.description.trim() || form.description.length < 10) return toast.error('Description must be at least 10 characters') || false;
    if (!form.category) return toast.error('Please select a category') || false;
    return true;
  };

  const validateStep2 = () => {
    if (!form.startingPrice || Number(form.startingPrice) < 1) return toast.error('Starting price must be at least $1') || false;
    if (!form.endTime) return toast.error('Please set an end time') || false;
    if (new Date(form.endTime) <= new Date()) return toast.error('End time must be in the future') || false;
    if (!image) return toast.error('Please upload an image') || false;
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('image', image);

      const res = await auctionService.create(formData);
      toast.success('🎉 Auction created successfully!');
      navigate(`/auctions/${res.data.auction._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Create Auction</h1>
          <p className="text-slate-400">List your item for live bidding</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-10">
          {[
            { n: 1, label: 'Item Details' },
            { n: 2, label: 'Pricing & Media' },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-3 flex-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step > n ? 'bg-green-500 text-white'
                : step === n ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-dark-700 text-slate-500 border border-dark-600'
              }`}>
                {step > n ? <FiCheckCircle size={16} /> : n}
              </div>
              <div>
                <p className={`text-sm font-medium ${step === n ? 'text-white' : 'text-slate-500'}`}>{label}</p>
                <p className="text-xs text-slate-600">Step {n} of 2</p>
              </div>
              {i === 0 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${step > 1 ? 'bg-primary-500' : 'bg-dark-600'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="card border border-dark-600 p-7 space-y-5 animate-slide-up">
              <h2 className="text-lg font-display font-semibold text-white border-b border-dark-600 pb-4">
                Item Information
              </h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiType size={13} className="inline mr-1.5" /> Item Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Vintage Rolex Submariner 1968"
                  className="input"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-slate-600 mt-1">{form.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiAlignLeft size={13} className="inline mr-1.5" /> Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your item in detail — condition, history, specifications..."
                  className="input min-h-28 resize-y"
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-slate-600 mt-1">{form.description.length}/1000 characters</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiTag size={13} className="inline mr-1.5" /> Category *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, category: cat }))}
                      className={`px-2 py-2 rounded-xl text-xs font-medium border transition-all ${
                        form.category === cat
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                          : 'bg-dark-800 border-dark-600 text-slate-400 hover:border-dark-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                Continue to Pricing →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="card border border-dark-600 p-7 space-y-5 animate-slide-up">
              <div className="flex items-center justify-between border-b border-dark-600 pb-4">
                <h2 className="text-lg font-display font-semibold text-white">Pricing & Image</h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
              </div>

              {/* Starting Price */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiDollarSign size={13} className="inline mr-1.5" /> Starting Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    name="startingPrice"
                    value={form.startingPrice}
                    onChange={handleChange}
                    placeholder="0"
                    min="1"
                    step="1"
                    className="input pl-8 font-mono"
                    required
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">Minimum starting price is $1</p>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiClock size={13} className="inline mr-1.5" /> Auction End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  min={getMinEndTime()}
                  className="input"
                  required
                />
                <p className="text-xs text-slate-600 mt-1">Minimum 1 hour from now</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiImage size={13} className="inline mr-1.5" /> Item Image *
                </label>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-dark-900/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => { setImage(null); setImagePreview(''); }}
                        className="p-2 bg-red-600 rounded-xl text-white hover:bg-red-500 transition-colors"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setImage(null); setImagePreview(''); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/90 rounded-lg text-white hover:bg-red-500 text-xs"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-500 hover:border-primary-500/50 hover:bg-dark-600/30'
                    }`}
                  >
                    <FiUpload size={28} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-300">Drop image here or click to upload</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageSelect(e.target.files[0])}
                />
              </div>

              {/* Summary preview */}
              <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Auction Summary</p>
                <div className="space-y-2">
                  {[
                    { label: 'Title', value: form.title || '—' },
                    { label: 'Category', value: form.category || '—' },
                    { label: 'Starting Price', value: form.startingPrice ? `$${Number(form.startingPrice).toLocaleString()}` : '—' },
                    { label: 'End Time', value: form.endTime ? new Date(form.endTime).toLocaleString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-white font-medium truncate max-w-40 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full py-3.5 text-base"
              >
                {loading ? <Loader size="sm" /> : (
                  <><FiCheckCircle size={18} /> Launch Auction</>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
