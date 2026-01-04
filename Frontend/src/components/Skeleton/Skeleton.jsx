import './Skeleton.css';

// Reusable skeleton component for loading states
// variant: circle, rect, text, avatar, post, user
// width/height: custom dimensions (e.g., "100px", "50%")
// count: number of skeleton items to render
const Skeleton = ({ 
  variant = 'rect', 
  width, 
  height, 
  count = 1,
  className = '' 
}) => {
  const getSkeletonClass = () => {
    switch (variant) {
      case 'circle':
        return 'skeleton-circle';
      case 'text':
        return 'skeleton-text';
      case 'avatar':
        return 'skeleton-avatar';
      case 'post':
        return 'skeleton-post';
      case 'user':
        return 'skeleton-user';
      default:
        return 'skeleton-rect';
    }
  };

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className="skeleton-group">
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i} 
            className={`skeleton ${getSkeletonClass()} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`skeleton ${getSkeletonClass()} ${className}`}
      style={style}
    />
  );
};

// Pre-built composite skeletons for common patterns
export const SkeletonPost = () => (
  <div className="skeleton-post-card">
    <div className="skeleton-post-header">
      <Skeleton variant="avatar" />
      <div className="skeleton-post-user-info">
        <Skeleton variant="text" width="120px" height="14px" />
        <Skeleton variant="text" width="80px" height="12px" />
      </div>
    </div>
    <Skeleton variant="rect" width="100%" height="400px" />
    <div className="skeleton-post-footer">
      <Skeleton variant="text" width="60%" height="14px" />
      <Skeleton variant="text" width="40%" height="12px" />
    </div>
  </div>
);

export const SkeletonUser = () => (
  <div className="skeleton-user-card">
    <Skeleton variant="avatar" />
    <div className="skeleton-user-info">
      <Skeleton variant="text" width="100px" height="14px" />
      <Skeleton variant="text" width="80px" height="12px" />
    </div>
  </div>
);

export const SkeletonStory = () => (
  <div className="skeleton-story">
    <Skeleton variant="circle" width="70px" height="70px" />
    <Skeleton variant="text" width="60px" height="12px" />
  </div>
);

export default Skeleton;
