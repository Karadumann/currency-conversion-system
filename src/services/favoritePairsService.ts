interface CurrencyPair {
  fromCurrency: string;
  toCurrency: string;
  lastUsed: Date;
}

export class FavoritePairsService {
  private static readonly STORAGE_KEY = 'favoriteCurrencyPairs';
  private static instance: FavoritePairsService;
  private pairs: CurrencyPair[] = [];

  private constructor() {
    this.loadPairs();
  }

  static getInstance(): FavoritePairsService {
    if (!FavoritePairsService.instance) {
      FavoritePairsService.instance = new FavoritePairsService();
    }
    return FavoritePairsService.instance;
  }

  private loadPairs(): void {
    const stored = localStorage.getItem(FavoritePairsService.STORAGE_KEY);
    if (stored) {
      this.pairs = JSON.parse(stored).map((pair: any) => ({
        ...pair,
        lastUsed: new Date(pair.lastUsed)
      }));
    }
  }

  private savePairs(): void {
    localStorage.setItem(FavoritePairsService.STORAGE_KEY, JSON.stringify(this.pairs));
  }

  addPair(fromCurrency: string, toCurrency: string): void {
    const existingIndex = this.pairs.findIndex(
      pair => pair.fromCurrency === fromCurrency && pair.toCurrency === toCurrency
    );

    if (existingIndex !== -1) {
      this.pairs[existingIndex].lastUsed = new Date();
    } else {
      this.pairs.push({
        fromCurrency,
        toCurrency,
        lastUsed: new Date()
      });
    }

    this.savePairs();
  }

  getPairs(limit: number = 5): CurrencyPair[] {
    return [...this.pairs]
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, limit);
  }

  removePair(fromCurrency: string, toCurrency: string): void {
    this.pairs = this.pairs.filter(
      pair => !(pair.fromCurrency === fromCurrency && pair.toCurrency === toCurrency)
    );
    this.savePairs();
  }
}

export const favoritePairsService = FavoritePairsService.getInstance(); 