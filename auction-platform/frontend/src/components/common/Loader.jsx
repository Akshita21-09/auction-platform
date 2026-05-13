const Loader = ({ fullScreen = false, size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} rounded-full border-primary-500/30 border-t-primary-500 animate-spin`} />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-800 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg animate-pulse">
            B
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading BidVerse...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default Loader;
