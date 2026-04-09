export type TaskStatus = 'pending' | 'verifying' | 'completed' | 'failed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'study' | 'work' | 'fitness' | 'other';
  status: TaskStatus;
  createdAt: number;
  deadline: number;
  completedAt?: number;
  proofType: 'photo' | 'code' | 'answer' | 'none';
  proofUrl?: string;
  proofAnswer?: string;
  points: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  lastCompleted: number;
  targetCount: number;
  currentCount: number;
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  level: number;
  xp: number;
  dailyScore: number;
  consistencyStreak: number;
  productivityScore: number; // 0-100
  timeWasted: number; // in minutes
  timeProductive: number; // in minutes
}

export interface AppBlockRule {
  id: string;
  userId: string;
  appName: string;
  isBlocked: boolean;
  unlockCondition: 'task' | 'timer';
  conditionValue: string; // taskId or duration
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}
