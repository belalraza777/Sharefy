# Skeleton Loading Component

Simple and reusable skeleton loading components for consistent loading states across the app.

## Basic Usage

```jsx
import Skeleton from './components/Skeleton/Skeleton';

// Simple rectangle
<Skeleton variant="rect" width="100%" height="200px" />

// Circle (avatar)
<Skeleton variant="circle" width="50px" height="50px" />

// Text lines
<Skeleton variant="text" width="200px" height="16px" />

// Multiple items
<Skeleton variant="text" count={3} />
```

## Pre-built Composites

```jsx
import { SkeletonPost, SkeletonUser, SkeletonStory } from './components/Skeleton/Skeleton';

// Full post card skeleton
<SkeletonPost />

// User card skeleton
<SkeletonUser />

// Story circle skeleton
<SkeletonStory />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'rect' | Type: 'rect', 'circle', 'text', 'avatar', 'post', 'user' |
| width | string | - | Custom width (e.g., "100px", "50%") |
| height | string | - | Custom height (e.g., "100px", "50%") |
| count | number | 1 | Number of skeleton items to render |
| className | string | '' | Additional CSS classes |

## Examples in Components

### Feed Loading
```jsx
{loading && Array.from({ length: 3 }).map((_, i) => <SkeletonPost key={i} />)}
```

### Story Circles Loading
```jsx
{loading && <Skeleton variant="circle" width="70px" height="70px" count={5} />}
```

### User List Loading
```jsx
{loading && Array.from({ length: 5 }).map((_, i) => <SkeletonUser key={i} />)}
```

## Features
- Pure CSS shimmer animation
- Responsive design
- Dark mode support
- Customizable dimensions
- Pre-built composites for common patterns
