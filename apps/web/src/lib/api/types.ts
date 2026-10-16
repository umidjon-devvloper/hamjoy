/** Django REST Framework–style paginated list (ready when services swap to REST). */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorBody {
  detail?: string;
  non_field_errors?: string[];
  [field: string]: unknown;
}
