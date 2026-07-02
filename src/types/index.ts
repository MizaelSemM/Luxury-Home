export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  squareMeters: number;
  imagesUrl: string[];
  highlight: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  text: string;
  rating: number;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
}
