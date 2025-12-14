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
    // Exact match priority
    return commands.find(c => c.trigger === normalizedQuery);
  }

  // Levenshtein Distance Helper
  private static levenshtein(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  // Fuzzy Search for Memory Manager
  static search(query: string): TrainedCommand[] {
    const commands = this.load();
    if (!query) return commands;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return commands.filter(cmd => {
      const trigger = cmd.trigger.toLowerCase();
      const response = cmd.response.toLowerCase();
      const description = (cmd.description || '').toLowerCase();
      const fullText = `${trigger} ${response} ${description}`;
      
      // 1. Simple Inclusion (Fastest & Strict)
      if (fullText.includes(normalizedQuery)) return true;
      
      // 2. Levenshtein Distance (Typos & Near Matches)
      // Allow 1 edit for short queries (<5), 2 for medium (<10), 3 for long
      const maxEdits = normalizedQuery.length < 5 ? 1 : normalizedQuery.length < 10 ? 2 : 3;
      
      // Check if the query is close to the trigger
      if (this.levenshtein(normalizedQuery, trigger) <= maxEdits) return true;
      
      // Check if the query is close to any word in the response/description
      const words = fullText.split(/\s+/);
      const isWordMatch = words.some(w => {
         // Only check words of similar length to optimize
         if (Math.abs(w.length - normalizedQuery.length) > maxEdits) return false;
         return this.levenshtein(normalizedQuery, w) <= maxEdits;
      });
      
      if (isWordMatch) return true;

      return false;
    });
  }
}