import React from 'react';

interface HelloTypeScriptProps {
  name?: string;
}

const HelloTypeScript: React.FC<HelloTypeScriptProps> = ({ name = "TypeScript User" }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>This is a simple TypeScript React component.</p>
    </div>
  );
};

export default HelloTypeScript;
