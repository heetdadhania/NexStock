export interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  created_at: string;
}

export interface ActivityLogFilters {
  entity_type?: string;
  user_id?: number;
  from_date?: string;
  to_date?: string;
  limit?: number;
}
