/**
 * Types related to citizen functionality
 */

export interface CitizenDashboardStats {
  totalRequests: number;
  pendingRequests: number;
  processingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  documents?: Array<any>;
  recentActivity?: Array<{
    id: number;
    type: string;
    status: string;
    title: string;
    date: string;
    request_id?: number;
    document_id?: number;
  }>;
}

export interface CitizenDocument {
  id: string;
  title: string;
  documentType: string;
  issuedAt: string;
  expiresAt?: string;
  status: string;
  isVerified: boolean;
  blockchainId?: string;
  file?: string;
}

export interface CitizenRequest {
  id: string;
  title: string;
  type: string;
  status: string;
  requestDate: string;
  completionDate?: string;
  description?: string;
  attachments?: Array<any>;
  assignedTo?: string;
  comments?: Array<any>;
}

export interface CitizenProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  id_card_number?: string;
  id_card_issue_date?: string;
  id_card_issue_place?: string;
  date_of_birth?: string;
  gender?: string;
  profile_picture?: string;
}

export interface CitizenFeedback {
  id: string;
  title: string;
  content: string;
  created_at: string;
  status: string;
  response?: string;
} 