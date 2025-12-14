import { TrainedCommand } from '../types';

const STORAGE_KEY = 'gream_bvddy_memory_v1';

export class MemoryStore {
  static load(): TrainedCommand[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load memory", e);
      return [];
    }
  }

  static save(commands: TrainedCommand[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commands));
  }

  static addCommand(trigger: string, response: string, description?: string): TrainedCommand {
    const commands = this.load();
    const newCommand: TrainedCommand = {
      id: crypto.randomUUID(),
      trigger: trigger.toLowerCase().trim(),
      response,
      description,
      createdAt: Date.now()
    };
    
    // Remove duplicates if strictly identical trigger
    const filtered = commands.filter(c => c.trigger !== newCommand.trigger);
    filtered.push(newCommand);
    
    this.save(filtered);
    return newCommand;
  }

  static deleteCommand(id: string): void {
    const commands = this.load();
    const filtered = commands.filter(c => c.id !== id);
    this.save(filtered);
  }

  static findMatch(query: string): TrainedCommand | undefined {
    const commands = this.load();
    const normalizedQuery = query.toLowerCase().trim();
    // Exact match priority, could be expanded to fuzzy match later
    return commands.find(c => c.trigger === normalizedQuery);
  }
}