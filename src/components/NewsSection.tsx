import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Link,
  CircularProgress,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { NewsItem } from '../types';
import { newsService } from '../services/newsService';

interface NewsSectionProps {
  selectedCurrency?: string;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ selectedCurrency }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const newsData = activeTab === 0 || !selectedCurrency
          ? await newsService.getLatestNews()
          : await newsService.getCurrencyNews(selectedCurrency);
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCurrency, activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Financial News
      </Typography>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
        aria-label="news category tabs"
      >
        <Tab label="Latest News" />
        {selectedCurrency && <Tab label={`${selectedCurrency} News`} />}
      </Tabs>

      <Grid container spacing={2}>
        {news.slice(0, 6).map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {item.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={item.imageUrl}
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    underline="hover"
                  >
                    {item.title}
                  </Link>
                </Typography>
                {item.description && (
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                )}
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.source}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 