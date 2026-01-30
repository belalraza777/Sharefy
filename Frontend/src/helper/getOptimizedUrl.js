 
 // This helper function optimizes Cloudinary image URLs by adding transformation parameters
const getOptimizedImage = (url, width = 600) => {
  if (!url.includes('cloudinary')) return url;
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width}/`
  );
};
export default getOptimizedImage;
