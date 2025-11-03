import React from "react";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Database,Server } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDatabaseIcon = (type: string) => {
  switch (type) {
    case 'mysql':
      return React.createElement(Database, { className: "h-5 w-5 text-orange-600" });
    case 'postgresql':
      return React.createElement(Database, { className: "h-5 w-5 text-blue-600" });
    case 'mongodb':
      return React.createElement(Database, { className: "h-5 w-5 text-green-600" });
    case 'sqlserver':
      return React.createElement(Server, { className: "h-5 w-5 text-red-600" });
    default:
      return React.createElement(Database, { className: "h-5 w-5 text-gray-600" });
  }
};

export const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'connected':
      return React.createElement('div', { className: "h-2 w-2 bg-green-500 rounded-full" });
    case 'disconnected':
      return React.createElement('div', { className: "h-2 w-2 bg-gray-400 rounded-full" });
    case 'error':
      return React.createElement('div', { className: "h-2 w-2 bg-red-500 rounded-full" });
    default:
      return React.createElement('div', { className: "h-2 w-2 bg-gray-400 rounded-full" });
  }
};