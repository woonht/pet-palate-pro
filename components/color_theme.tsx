export const getThemeColors = (mode: string) => {
  switch (mode) {
    case 'red-green':
      return { background: '#fff', text: '#000', primary: '#006400', highlight: '#FF6347' };
    case 'blue-yellow':
      return { background: '#fff', text: '#000', primary: '#1E90FF', highlight: '#FFD700' };
    case 'mono':
      return { background: '#f0f0f0', text: '#000', primary: '#555', highlight: '#999' };
    default:
      return { background: '#ffffff', text: '#000000', primary: '#007AFF', highlight: '#34C759' };
  }
};