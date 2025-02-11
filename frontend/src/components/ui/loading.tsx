'use client';

import React from 'react';

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    </div>
  );
} 