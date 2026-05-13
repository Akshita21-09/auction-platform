import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen pt-16 flex items-center justify-center text-center px-4">
    <div>
      <div className="text-8xl font-display font-black text-gradient mb-4">404</div>
      <h1 className="text-3xl font-display font-bold text-white mb-3">Page Not Found</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex justify-center gap-4">
        <button onClick={() => window.history.back()} className="btn-secondary">
          <FiArrowLeft size={16} /> Go Back
        </button>
        <Link to="/" className="btn-primary">
          <FiHome size={16} /> Home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
