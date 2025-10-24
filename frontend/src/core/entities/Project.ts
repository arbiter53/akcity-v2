export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled'
}

export enum ConstructionType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  INFRASTRUCTURE = 'infrastructure'
}

export interface BuildingInfo {
  totalBlocks: number;
  totalApartments: number;
  apartmentsPerBlock: number;
  floorsPerBlock: number;
  totalArea: number;
  constructionType: ConstructionType;
}

export interface ClientInfo {
  name: string;
  contact: string;
  phone: string;
  email: string;
  address?: string;
}

export interface ProjectDocument {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  progress: number;
  projectManager: string;
  team: string[];
  buildingInfo: BuildingInfo;
  client: ClientInfo;
  documents?: ProjectDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  projectManager: string;
  team: string[];
  buildingInfo: BuildingInfo;
  client: ClientInfo;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ProjectStatus;
  progress?: number;
  team?: string[];
  buildingInfo?: Partial<BuildingInfo>;
  client?: Partial<ClientInfo>;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  projectManager?: string;
  teamMember?: string;
  search?: string;
  page?: number;
  limit?: number;
}
