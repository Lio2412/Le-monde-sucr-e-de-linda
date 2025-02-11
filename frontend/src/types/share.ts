export interface Share {
  id: string;
  comment: string;
  rating: number;
  imagePath: string | null;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  } | null;
} 