import { ObjectId } from 'mongodb';

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

export interface ProjectProps {
  id?: ObjectId;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  progress: number;
  projectManager: ObjectId;
  team: ObjectId[];
  buildingInfo: BuildingInfo;
  client: ClientInfo;
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private constructor(private props: ProjectProps) {}

  static create(props: Omit<ProjectProps, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress'>): Project {
    return new Project({
      ...props,
      status: ProjectStatus.PLANNING,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static fromPersistence(data: any): Project {
    return new Project({
      id: data._id,
      name: data.name,
      description: data.description,
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      progress: data.progress,
      projectManager: data.projectManager,
      team: data.team,
      buildingInfo: data.buildingInfo,
      client: data.client,
      documents: data.documents,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }

  // Getters
  get id(): ObjectId | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get location(): string {
    return this.props.location;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get status(): ProjectStatus {
    return this.props.status;
  }

  get progress(): number {
    return this.props.progress;
  }

  get projectManager(): ObjectId {
    return this.props.projectManager;
  }

  get team(): ObjectId[] {
    return this.props.team;
  }

  get buildingInfo(): BuildingInfo {
    return this.props.buildingInfo;
  }

  get client(): ClientInfo {
    return this.props.client;
  }

  get documents(): Array<{ name: string; url: string; type: string; size: number; uploadedAt: Date }> | undefined {
    return this.props.documents;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods
  updateBasicInfo(data: {
    name?: string;
    description?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
  }): void {
    if (data.name) this.props.name = data.name;
    if (data.description) this.props.description = data.description;
    if (data.location) this.props.location = data.location;
    if (data.startDate) this.props.startDate = data.startDate;
    if (data.endDate) this.props.endDate = data.endDate;
    this.props.updatedAt = new Date();
  }

  updateStatus(status: ProjectStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  updateProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    this.props.progress = progress;
    this.props.updatedAt = new Date();
  }

  addTeamMember(userId: ObjectId): void {
    if (!this.props.team.includes(userId)) {
      this.props.team.push(userId);
      this.props.updatedAt = new Date();
    }
  }

  removeTeamMember(userId: ObjectId): void {
    this.props.team = this.props.team.filter(id => !id.equals(userId));
    this.props.updatedAt = new Date();
  }

  updateBuildingInfo(buildingInfo: Partial<BuildingInfo>): void {
    this.props.buildingInfo = { ...this.props.buildingInfo, ...buildingInfo };
    this.props.updatedAt = new Date();
  }

  updateClient(client: Partial<ClientInfo>): void {
    this.props.client = { ...this.props.client, ...client };
    this.props.updatedAt = new Date();
  }

  addDocument(document: {
    name: string;
    url: string;
    type: string;
    size: number;
  }): void {
    if (!this.props.documents) {
      this.props.documents = [];
    }
    this.props.documents.push({
      ...document,
      uploadedAt: new Date()
    });
    this.props.updatedAt = new Date();
  }

  removeDocument(documentName: string): void {
    if (this.props.documents) {
      this.props.documents = this.props.documents.filter(doc => doc.name !== documentName);
      this.props.updatedAt = new Date();
    }
  }

  isOverdue(): boolean {
    return this.props.status === ProjectStatus.IN_PROGRESS && new Date() > this.props.endDate;
  }

  getDaysRemaining(): number {
    const now = new Date();
    const endDate = new Date(this.props.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  canBeCompleted(): boolean {
    return this.props.status === ProjectStatus.IN_PROGRESS && this.props.progress >= 100;
  }

  complete(): void {
    if (!this.canBeCompleted()) {
      throw new Error('Project cannot be completed. Progress must be 100%');
    }
    this.props.status = ProjectStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  toJSON(): Partial<ProjectProps> {
    return {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      location: this.props.location,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      status: this.props.status,
      progress: this.props.progress,
      projectManager: this.props.projectManager,
      team: this.props.team,
      buildingInfo: this.props.buildingInfo,
      client: this.props.client,
      documents: this.props.documents,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }

  toPersistence(): any {
    return {
      _id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      location: this.props.location,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      status: this.props.status,
      progress: this.props.progress,
      projectManager: this.props.projectManager,
      team: this.props.team,
      buildingInfo: this.props.buildingInfo,
      client: this.props.client,
      documents: this.props.documents,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }
}
