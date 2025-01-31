import NodeCache from 'node-cache';

class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes par défaut
      checkperiod: 60, // Vérifier les clés expirées toutes les 60 secondes
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.cache.set(key, value, ttl);
  }

  async del(key: string): Promise<number> {
    return this.cache.del(key);
  }

  async flush(): Promise<void> {
    this.cache.flushAll();
  }

  // Méthodes spécifiques pour les recettes
  async getRecipe(slug: string): Promise<unknown> {
    return this.get(`recipe:${slug}`);
  }

  async setRecipe(slug: string, recipe: unknown): Promise<boolean> {
    return this.set(`recipe:${slug}`, recipe, 300); // Cache pour 5 minutes
  }

  async invalidateRecipeCache(slug: string): Promise<void> {
    await this.del(`recipe:${slug}`);
  }

  async invalidateAllRecipesCache(): Promise<void> {
    const keys = this.cache.keys().filter(key => key.startsWith('recipe:'));
    await Promise.all(keys.map(key => this.del(key)));
  }
}

export const cacheService = CacheService.getInstance(); 