import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export const AccessDenied = () => {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 text-danger flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black text-ink mb-2">Access Denied</h1>
      <p className="text-sm text-muted max-w-md mb-8">
        You do not have administrative credentials to access this area. If you believe this is an error, please contact your administrator.
      </p>
      <Link to="/">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  );
};

export default AccessDenied;
