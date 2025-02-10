import React from 'react';
import { Link } from 'react-router-dom';

export const AppBar = () => {
  return (
    <div>
      <div>
        <Link to={'/'}>Users</Link>
      </div>
      <div>
        <Link to={'/solution'}>Solutions</Link>
      </div>
      <div>
        <Link to={'/workspace'}>Workspaces</Link>
      </div>
      <div>
        <Link to={'/organization'}>Organizations</Link>
      </div>
      <div>
        <Link to={'/scenario'}>Scenarios</Link>
      </div>
    </div>
  );
};
