import React from 'react';

interface HelloWorldProps {
  message?: string;
}

const HelloWorld: React.FC<HelloWorldProps> = ({ message = 'Bonjour le monde!' }) => {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-gray-800">{message}</h1>
    </div>
  );
};

export default HelloWorld; 