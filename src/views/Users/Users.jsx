import React from 'react';
import { AppBar } from 'src/components/AppBar/AppBar.jsx';
import { useGetAllSolutionsQuery } from 'src/state/api/apiSlice.js';

export const Users = () => {
  const { data, isLoading } = useGetAllSolutionsQuery();
  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  return (
    <div>
      <AppBar />
      {data && (
        <ol>
          {data[0].parameters.map((parameter) => (
            <li key={parameter.id}>{parameter.id}</li>
          ))}
        </ol>
      )}
    </div>
  );
};
