import path from 'path';
import fs from 'fs';
import { FILE } from '../constants/index.js';

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const ensureDirectoryExists = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

export const getUploadPath = (type: keyof typeof FILE.UPLOAD_DIRS): string => {
  const uploadPath = path.join(process.cwd(), FILE.UPLOAD_DIRS[type]);
  ensureDirectoryExists(uploadPath);
  return uploadPath;
};

export const deleteFile = (filePath: string): void => {
  const absolutePath = path.join(process.cwd(), filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

export const validateFileType = (mimetype: string): boolean => {
  return FILE.ALLOWED_TYPES.includes(mimetype as typeof FILE.ALLOWED_TYPES[number]);
};

export const calculatePaginationData = (total: number, page: number, limit: number) => {
  return {
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}; 