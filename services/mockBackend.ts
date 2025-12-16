import { BloodGroup, BloodRequest, RequestUrgency, User, UserRole, HistoryItem } from '../types';

// Storage Keys for LocalStorage Persistence
const KEYS = {
  USERS: 'CBC_USERS_DB',
  REQUESTS: 'CBC_REQUESTS_DB',
  HISTORY: 'CBC_HISTORY_DB',
  SESSION: 'CBC_SESSION_ID'
};

// Default Mock Data (Seeding the "Database" if empty)
const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john@college.edu',
    phone: '555-0101',
    role: UserRole.DONOR,
    bloodGroup: BloodGroup.O_POS,
    isAvailable: true,
    lastDonationDate: '2023-10-15',
    collegeId: 'STU-2024-001',
    location: 'North Campus',
    hasAllergies: false,
  },
  {
    id: 'u2',
    name: 'Jane Smith',
    email: 'jane@college.edu',
    phone: '555-0102',
    role: UserRole.REQUESTER,
    collegeId: 'STU-2024-002',
  }
];

const DEFAULT_REQUESTS: BloodRequest[] = [
  {
    id: 'r1',
    requesterId: 'u2',
    requesterName: 'Jane Smith',
    bloodGroup: BloodGroup.A_POS,
    units: 2,
    hospitalName: 'City General Hospital',
    location: 'Downtown',
    urgency: RequestUrgency.URGENT,
    description: 'Urgent need for A+ blood for surgery.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    distance: '2.5 km',
  },
  {
    id: 'r2',
    requesterId: 'u3',
    requesterName: 'Admin Coord',
    bloodGroup: BloodGroup.O_NEG,
    units: 1,
    hospitalName: 'University Medical Center',
    location: 'On Campus',
    urgency: RequestUrgency.CRITICAL,
    description: 'Critical emergency. O- donor needed immediately.',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    distance: '0.5 km',
  }
];

const DEFAULT_HISTORY: HistoryItem[] = [
  { id: 1, userId: 'u1', type: 'Donation', date: '2023-10-15', location: 'City General Hospital', units: 1, status: 'Completed' },
  { id: 2, userId: 'u1', type: 'Donation', date: '2023-06-20', location: 'Campus Blood Drive', units: 1, status: 'Completed' },
  { id: 3, userId: 'u2', type: 'Request', date: '2023-01-10', location: 'University Medical Center', units: 2, status: 'Fulfilled' },
];

// Service Class simulating a persistent Backend
class MockBackendService {
  private users: User[];
  private requests: BloodRequest[];
  private history: HistoryItem[];
  private currentUser: User | null = null;

  constructor() {
    // Load data from LocalStorage or use Default Mock Data
    this.users = this.loadData(KEYS.USERS, DEFAULT_USERS);
    this.requests = this.loadData(KEYS.REQUESTS, DEFAULT_REQUESTS);
    this.history = this.loadData(KEYS.HISTORY, DEFAULT_HISTORY);

    // Auto-login if session exists
    const sessionId = localStorage.getItem(KEYS.SESSION);
    if (sessionId) {
      const user = this.users.find(u => u.id === sessionId);
      if (user) {
        this.currentUser = user;
      }
    }
  }

  // --- Helper Methods ---

  private loadData<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.error(`Failed to load ${key}`, e);
      return fallback;
    }
  }

  private saveData(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  }

  // --- Auth Methods ---

  async login(email: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.currentUser = user;
      localStorage.setItem(KEYS.SESSION, user.id); // Save Session
      return user;
    }
    throw new Error('User not found. Please register first.');
  }

  async register(user: Omit<User, 'id'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check duplicate email
    if (this.users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        throw new Error('This email is already registered.');
    }

    const newUser: User = { 
        ...user, 
        id: `user_${Date.now()}` // Generate unique ID
    };
    
    this.users.push(newUser);
    this.saveData(KEYS.USERS, this.users); // Persist User DB
    
    this.currentUser = newUser;
    localStorage.setItem(KEYS.SESSION, newUser.id); // Auto Login
    
    return newUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(KEYS.SESSION); // Clear Session
  }

  // --- Request Methods ---

  async getRequests(): Promise<BloodRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.requests];
  }

  async createRequest(request: Omit<BloodRequest, 'id' | 'createdAt' | 'status' | 'distance'>): Promise<BloodRequest> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newRequest: BloodRequest = {
      ...request,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'OPEN',
      distance: '0.8 km', // Mock distance for new requests
    };
    
    this.requests.unshift(newRequest);
    this.saveData(KEYS.REQUESTS, this.requests); // Persist Requests
    
    return newRequest;
  }

  // --- Profile Methods ---

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.saveData(KEYS.USERS, this.users); // Persist Updates
      
      // Update current user if it's the same person
      if (this.currentUser?.id === userId) {
        this.currentUser = this.users[index];
      }
      return this.users[index];
    }
    throw new Error('User not found');
  }

  // --- History Methods ---

  async getHistory(userId: string): Promise<HistoryItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.history
        .filter(h => h.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async addHistoryItem(item: Omit<HistoryItem, 'id'>): Promise<HistoryItem> {
    const newItem = { ...item, id: Date.now() };
    this.history.unshift(newItem);
    this.saveData(KEYS.HISTORY, this.history); // Persist History
    return newItem;
  }
}

export const mockBackend = new MockBackendService();