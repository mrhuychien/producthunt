// User types
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

// Idea status
export type IdeaStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'built';

// Idea types
export interface Idea {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: Category;
  userId: string;
  user?: User;
  status: IdeaStatus;
  isFeatured: boolean;
  voteCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: Tag[];
  userVote?: number; // 1, -1, or 0/undefined
  isSaved?: boolean;
}

// Vote types
export interface Vote {
  id: string;
  ideaId: string;
  userId: string;
  value: 1 | -1;
  createdAt: Date;
}

// Comment types
export interface Comment {
  id: string;
  ideaId: string;
  userId: string;
  user?: User;
  parentId?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
  likeCount?: number;
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

// Saved Idea types
export interface SavedIdea {
  id: string;
  ideaId: string;
  userId: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface SubmitIdeaForm {
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
}

// Filter types
export interface IdeaFilters {
  category?: string;
  status?: IdeaStatus;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'trending';
}

// AI Idea Fusion types
export interface FusedIdea {
  id: string;
  title: string;
  description: string;
  concept: string;
  sourceIdeas: Idea[];
  sourceIdeaIds: string[];
  voteCount: number;
  userVote?: number;
  createdAt: Date;
  createdById?: string;
  createdBy?: User;
}

// Idea Battle Arena types
export type BattleStatus = 'active' | 'completed' | 'cancelled';

export interface Battle {
  id: string;
  idea1Id: string;
  idea2Id: string;
  idea1?: Idea;
  idea2?: Idea;
  idea1Votes: number;
  idea2Votes: number;
  winnerId?: string;
  winner?: Idea;
  status: BattleStatus;
  round: number;
  weekNumber: number;
  expiresAt: Date;
  createdAt: Date;
  userVote?: string; // id of idea user voted for
}

// Build Progress Live Stream types
export type BuildClaimStatus = 'active' | 'completed' | 'abandoned';
export type ProgressUpdateType = 'text' | 'image' | 'commit' | 'milestone';

export interface BuildClaim {
  id: string;
  ideaId: string;
  idea?: Idea;
  builderId: string;
  builder?: User;
  status: BuildClaimStatus;
  startedAt: Date;
  completedAt?: Date;
  githubUrl?: string;
  liveUrl?: string;
  createdAt: Date;
  progressUpdates?: ProgressUpdate[];
}

export interface ProgressUpdate {
  id: string;
  claimId: string;
  userId: string;
  user?: User;
  type: ProgressUpdateType;
  content: string;
  imageUrl?: string;
  commitUrl?: string;
  milestoneTitle?: string;
  createdAt: Date;
}

// "Steal This Idea" Mode types
export type IdeaInterestStatus = 'interested' | 'building' | 'abandoned';

export interface IdeaInterest {
  id: string;
  ideaId: string;
  userId: string;
  user?: User;
  status: IdeaInterestStatus;
  note?: string;
  createdAt: Date;
}

// AI Difficulty Rating types
export interface IdeaDifficultyRating {
  id: string;
  ideaId: string;
  difficultyScore: number; // 1-5 stars
  estimatedHours: number;
  techStack: string[];
  requiredSkills: string[];
  complexityFactors: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Micro-Bounty System types
export type BountyStatus = 'pledged' | 'paid' | 'cancelled';

export interface IdeaBounty {
  id: string;
  ideaId: string;
  userId: string;
  user?: User;
  amount: number;
  currency: string;
  message?: string;
  status: BountyStatus;
  createdAt: Date;
}
