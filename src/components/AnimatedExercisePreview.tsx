import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

interface AnimatedExercisePreviewProps {
  imageUrls: string; // Comma-separated or single URL
}

export function AnimatedExercisePreview({ imageUrls }: AnimatedExercisePreviewProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const urls = imageUrls ? imageUrls.split(',').map(u => u.trim()).filter(Boolean) : [];

  useEffect(() => {
    if (urls.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % urls.length);
    }, 1200); // Swap frame every 1.2 seconds to simulate GIF perfectly
    
    return () => clearInterval(interval);
  }, [urls.length]);

  if (urls.length === 0) return null;

  const currentUrl = urls[currentIndex];

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      <Image
        key={currentUrl} // Key forces re-render if needed, but standard source swap works too.
        source={{ uri: currentUrl }}
        style={styles.image}
        resizeMode="contain"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1, // Square box for the images
    backgroundColor: '#fff', // Images usually have white backgrounds, keep it solid to blend in!
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)'
  }
});
