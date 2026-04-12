import Dexie, { type Table } from 'dexie';
import { Task, UserProfile, Category } from '../types';

export class ComfortTasksDB extends Dexie {
  tasks!: Table<Task>;
  profiles!: Table<UserProfile>;
  categories!: Table<Category>;

  constructor() {
    super('ComfortTasksDB');
    this.version(1).stores({
      tasks: '++id, customerId, providerId, category, status, date',
      profiles: '++id, email, role',
      categories: '++id, name'
    });
  }
}

export const db = new ComfortTasksDB();
