import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 text-primary flex items-center justify-center mb-6">
        <Film className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-black text-ink mb-2">404</h1>
      <h2 className="text-xl font-bold text-ink mb-3">Page Not Found</h2>
      <p className="text-sm text-muted max-w-md mb-8">
        The screen you're looking for seems to have been retired or doesn't exist. Let's get you back to the main stage.
      </p>
      <Link to="/">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
