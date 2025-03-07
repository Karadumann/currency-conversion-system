import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import NewspaperIcon from '@mui/icons-material/Newspaper';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  currencies: string[];
}

interface NewsSectionProps {
  fromCurrency: string;
  toCurrency: string;
}

const NewsSection: React.FC<NewsSectionProps> = ({ fromCurrency, toCurrency }) => {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using Gnews API (free tier)
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${fromCurrency}+${toCurrency}+forex&lang=en&country=us&max=3&apikey=42cb414d4f2cef443302a962501478f1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      
      if (!data.articles) {
        throw new Error('No news articles found');
      }

      const formattedNews: NewsItem[] = data.articles.map((article: any) => ({
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        publishedAt: new Date(article.publishedAt).toLocaleString(),
        source: article.source.name,
        currencies: [fromCurrency, toCurrency]
      }));

      setNews(formattedNews);
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNews();
  }, [fromCurrency, toCurrency]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <NewspaperIcon />
        <Typography variant="h6">
          Latest Forex News
        </Typography>
      </Box>
      
      <List>
        {news.map((item, index) => (
          <ListItem
            key={index}
            divider={index !== news.length - 1}
            sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <ListItemText
              primary={
                <Link href={item.url} target="_blank" rel="noopener noreferrer" underline="hover">
                  {item.title}
                </Link>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip size="small" label={item.source} />
                    <Chip size="small" label={item.publishedAt} variant="outlined" />
                    {item.currencies.map(currency => (
                      <Chip
                        key={currency}
                        size="small"
                        label={currency}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default NewsSection; 