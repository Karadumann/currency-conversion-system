import { NewsItem } from '../types';

export type NewsCategory = 'business' | 'technology' | 'economy' | 'markets' | 'all';
export type SortOrder = 'publishedAt' | 'relevance';

export class NewsService {
  private static instance: NewsService;
  private readonly API_KEY = process.env.REACT_APP_GNEWS_API_KEY;
  private readonly BASE_URL = 'https://gnews.io/api/v4';
  private readonly FAVORITES_KEY = 'favoriteNews';

  private constructor() {}

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  async getCurrencyNews(
    currency: string,
    category: NewsCategory = 'all',
    sortBy: SortOrder = 'publishedAt',
    maxResults: number = 10
  ): Promise<NewsItem[]> {
    try {
      const categoryParam = category !== 'all' ? `&category=${category}` : '';
      const response = await fetch(
        `${this.BASE_URL}/search?q=${currency}+currency&lang=en&country=us&max=${maxResults}&sortby=${sortBy}${categoryParam}&apikey=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      return data.articles.map((article: any) => ({
        id: article.url,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.image,
        publishedAt: new Date(article.publishedAt),
        source: article.source.name,
        category: article.category || 'business'
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  async getLatestNews(
    category: NewsCategory = 'business',
    maxResults: number = 10
  ): Promise<NewsItem[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/top-headlines?category=${category}&lang=en&country=us&max=${maxResults}&apikey=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      return data.articles.map((article: any) => ({
        id: article.url,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.image,
        publishedAt: new Date(article.publishedAt),
        source: article.source.name,
        category: article.category || 'business'
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  // Favori haberleri kaydetme ve yönetme
  getFavoriteNews(): NewsItem[] {
    const stored = localStorage.getItem(this.FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  addToFavorites(news: NewsItem): void {
    const favorites = this.getFavoriteNews();
    if (!favorites.find(item => item.id === news.id)) {
      favorites.push(news);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  removeFromFavorites(newsId: string): void {
    const favorites = this.getFavoriteNews();
    const updated = favorites.filter(item => item.id !== newsId);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(updated));
  }

  isFavorite(newsId: string): boolean {
    return this.getFavoriteNews().some(item => item.id === newsId);
  }
}

export const newsService = NewsService.getInstance(); 