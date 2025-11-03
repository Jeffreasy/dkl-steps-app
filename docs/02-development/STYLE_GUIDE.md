# Code Style Guide - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 📋 Active Guidelines

This document outlines the coding standards, conventions, and linting setup for the DKL Steps React Native application. Following these guidelines ensures consistent, maintainable, and high-quality code across the project.

## 📋 Table of Contents

1. [Code Style Principles](#1-code-style-principles)
2. [TypeScript Guidelines](#2-typescript-guidelines)
3. [React & React Native Patterns](#3-react--react-native-patterns)
4. [File Organization](#4-file-organization)
5. [Naming Conventions](#5-naming-conventions)
6. [Linting Setup](#6-linting-setup)
7. [Code Formatting](#7-code-formatting)
8. [Testing Standards](#8-testing-standards)
9. [Performance Guidelines](#9-performance-guidelines)
10. [Documentation Standards](#10-documentation-standards)

## 1. Code Style Principles

### Core Principles
- **Readability First**: Code should be self-documenting and easy to understand
- **Consistency**: Follow established patterns throughout the codebase
- **Maintainability**: Write code that is easy to modify and extend
- **Performance**: Consider performance implications in design decisions
- **Type Safety**: Leverage TypeScript for robust type checking

### Key Guidelines
- Use functional components over class components
- Prefer hooks over lifecycle methods
- Implement proper error boundaries
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Avoid deep nesting and complex conditional logic

## 2. TypeScript Guidelines

### Type Definitions
```typescript
// ✅ Good: Explicit interface definitions
interface User {
  id: string;
  name: string;
  email: string;
  role: 'participant' | 'staff' | 'admin';
}

// ✅ Good: Generic types for reusability
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ❌ Bad: Using any type
function processData(data: any) { ... }

// ✅ Good: Proper typing
function processData(data: UserData) { ... }
```

### Type Assertions
```typescript
// ✅ Good: Type guards
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

// ✅ Good: Type assertions when necessary
const user = response.data as User;

// ❌ Bad: Force casting without validation
const user = response.data as any;
```

### Optional Properties
```typescript
// ✅ Good: Optional properties with proper defaults
interface ComponentProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

function MyComponent({ title, subtitle, onPress }: ComponentProps) {
  const displaySubtitle = subtitle || 'Default subtitle';
  const handlePress = onPress || (() => {});
  // ...
}
```

## 3. React & React Native Patterns

### Component Structure
```typescript
// ✅ Good: Functional component with proper typing
interface StepCounterProps {
  onSync: () => void;
  initialSteps?: number;
}

function StepCounter({ onSync, initialSteps = 0 }: StepCounterProps) {
  const [steps, setSteps] = useState(initialSteps);

  // Custom hooks for complex logic
  const { connected, syncSteps } = useStepsWebSocket();

  // Effects for side effects
  useEffect(() => {
    // Side effect logic
  }, [dependencies]);

  // Event handlers
  const handleSync = useCallback(async () => {
    try {
      await syncSteps(steps);
      onSync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [steps, syncSteps, onSync]);

  return (
    <View style={styles.container}>
      <Text>{steps} steps</Text>
      <Button title="Sync" onPress={handleSync} />
    </View>
  );
}
```

### Custom Hooks
```typescript
// ✅ Good: Custom hook for reusable logic
function useStepsWebSocket(userId: string, participantId: string) {
  const [connected, setConnected] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<StepUpdate | null>(null);

  useEffect(() => {
    // WebSocket connection logic
    const ws = new WebSocket(`wss://api.example.com/steps?user=${userId}`);

    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLatestUpdate(data);
    };

    return () => ws.close();
  }, [userId]);

  return { connected, latestUpdate };
}
```

### Error Boundaries
```typescript
// ✅ Good: Error boundary for crash prevention
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text>Something went wrong</Text>
          <Button title="Retry" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}
```

## 4. File Organization

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   └── admin/          # Admin panel components
├── screens/            # Screen components
├── hooks/              # Custom React hooks
├── services/           # API services and utilities
├── theme/              # Theme system
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### File Naming
```typescript
// Components
StepCounter.tsx          // PascalCase for component files
StepCounterControls.tsx  // Related components with descriptive names

// Hooks
useStepsWebSocket.ts     // camelCase with 'use' prefix
useAuth.ts

// Services
api.ts                   // camelCase for services
stepQueue.ts

// Types
websocket.ts             // Related type definitions
api.ts
```

### Barrel Exports
```typescript
// ✅ Good: index.ts for clean imports
// src/components/index.ts
export { default as StepCounter } from './StepCounter';
export { default as StepCounterControls } from './StepCounterControls';

// Usage
import { StepCounter, StepCounterControls } from '../components';
```

## 5. Naming Conventions

### Variables and Functions
```typescript
// ✅ Good: Descriptive names
const userSteps = 1500;
const isUserAuthenticated = true;
const handleStepSync = () => { ... };

// ❌ Bad: Abbreviations or unclear names
const usrStps = 1500;
const auth = true;
const sync = () => { ... };
```

### Constants
```typescript
// ✅ Good: UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// ✅ Good: Exported constants
export const WS_RECONNECT_DELAY = 5000;
export const PEDOMETER_UPDATE_INTERVAL = 1000;
```

### Event Handlers
```typescript
// ✅ Good: handle* prefix for event handlers
const handleLogin = () => { ... };
const handleStepSync = () => { ... };
const handleRouteChange = (route: string) => { ... };

// ✅ Good: useCallback for stable references
const handlePress = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### Boolean Variables
```typescript
// ✅ Good: is*, has*, can*, should* prefixes
const isLoading = false;
const hasPermission = true;
const canSync = false;
const shouldRetry = true;
```

## 6. Linting Setup

### ESLint Configuration
```json
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // React rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Custom rules
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### VSCode Integration
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Running Linters
```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run Prettier
npm run format

# Type checking
npm run type-check
```

## 7. Code Formatting

### Import Organization
```typescript
// ✅ Good: Organized imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Third-party libraries
import { useQuery } from '@tanstack/react-query';

// Local imports
import { colors, typography } from '../theme';
import { useAuth } from '../hooks';
import { apiFetch } from '../services';

// Relative imports
import StepCounter from './StepCounter';
```

### Object and Array Formatting
```typescript
// ✅ Good: Consistent formatting
const user = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true,
  },
};

const routes = [
  { id: '1', name: '5 KM', amount: 100 },
  { id: '2', name: '10 KM', amount: 150 },
  { id: '3', name: '15 KM', amount: 200 },
];

// ✅ Good: Destructuring
const { id, name, email } = user;
const [firstRoute, secondRoute] = routes;
```

### Function Formatting
```typescript
// ✅ Good: Arrow functions for consistency
const calculateTotal = (steps: number, multiplier: number): number => {
  return steps * multiplier;
};

// ✅ Good: Early returns
const validateEmail = (email: string): boolean => {
  if (!email) return false;
  if (!email.includes('@')) return false;
  return true;
};

// ✅ Good: Async/await over promises
const syncSteps = async (steps: number): Promise<void> => {
  try {
    await apiFetch('/steps', {
      method: 'POST',
      body: JSON.stringify({ steps }),
    });
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};
```

## 8. Testing Standards

### Test File Organization
```
src/
├── components/
│   ├── StepCounter.tsx
│   └── __tests__/
│       └── StepCounter.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── services/
    ├── api.ts
    └── __tests__/
        └── api.test.ts
```

### Unit Test Example
```typescript
// ✅ Good: Comprehensive unit test
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import StepCounter from '../StepCounter';

describe('StepCounter', () => {
  it('displays initial steps', () => {
    const { getByText } = render(<StepCounter onSync={() => {}} />);
    expect(getByText('0 steps')).toBeTruthy();
  });

  it('calls onSync when sync button is pressed', async () => {
    const mockOnSync = jest.fn();
    const { getByText } = render(<StepCounter onSync={mockOnSync} />);

    fireEvent.press(getByText('Sync'));

    await waitFor(() => {
      expect(mockOnSync).toHaveBeenCalled();
    });
  });

  it('handles sync errors gracefully', async () => {
    // Mock failed sync
    const mockOnSync = jest.fn().mockRejectedValue(new Error('Sync failed'));
    const { getByText } = render(<StepCounter onSync={mockOnSync} />);

    fireEvent.press(getByText('Sync'));

    await waitFor(() => {
      expect(getByText(/error|failed/i)).toBeTruthy();
    });
  });
});
```

### Hook Testing
```typescript
// ✅ Good: Hook testing with react-hooks-testing-library
import { renderHook, act } from '@testing-library/react-hooks';
import { useStepsWebSocket } from '../useStepsWebSocket';

describe('useStepsWebSocket', () => {
  it('connects to WebSocket on mount', () => {
    const { result } = renderHook(() => useStepsWebSocket('user123', 'part123'));

    expect(result.current.connected).toBe(false);

    // Simulate connection
    act(() => {
      // WebSocket connection logic
    });

    expect(result.current.connected).toBe(true);
  });
});
```

## 9. Performance Guidelines

### Memoization
```typescript
// ✅ Good: Memoize expensive calculations
const totalSteps = useMemo(() => {
  return participants.reduce((sum, participant) => sum + participant.steps, 0);
}, [participants]);

// ✅ Good: Memoize callbacks
const handlePress = useCallback(() => {
  navigation.navigate('Dashboard');
}, [navigation]);

// ✅ Good: Memoize components when appropriate
const StepItem = React.memo(({ step, onPress }: StepItemProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{step.value}</Text>
    </TouchableOpacity>
  );
});
```

### List Optimization
```typescript
// ✅ Good: KeyExtractor for FlatList
<FlatList
  data={routes}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <RouteItem route={item} />}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={10}
/>
```

### Image Optimization
```typescript
// ✅ Good: Proper image sizing
<Image
  source={require('../assets/logo.png')}
  style={{ width: 100, height: 100 }}
  resizeMode="contain"
/>

// ✅ Good: Use appropriate formats (PNG for icons, JPG for photos)
```

## 10. Documentation Standards

### Component Documentation
```typescript
/**
 * StepCounter Component
 *
 * Displays current step count and provides sync functionality.
 * Integrates with WebSocket for real-time updates.
 *
 * @param onSync - Callback fired when steps are successfully synced
 * @param initialSteps - Initial step count (default: 0)
 */
interface StepCounterProps {
  onSync: () => void;
  initialSteps?: number;
}

function StepCounter({ onSync, initialSteps = 0 }: StepCounterProps) {
  // Implementation
}
```

### Function Documentation
```typescript
/**
 * Synchronizes step data with the backend server.
 *
 * @param steps - Number of steps to sync (positive or negative)
 * @returns Promise that resolves when sync is complete
 * @throws Error if sync fails or network is unavailable
 */
async function syncSteps(steps: number): Promise<void> {
  // Implementation
}
```

### File Headers
```typescript
/**
 * API Service Layer
 *
 * Centralized API client for all backend communication.
 * Handles authentication, error handling, and request formatting.
 *
 * @version 1.0.0
 * @author DKL Development Team
 */
```

## 🎯 Code Review Checklist

### Before Submitting
- [ ] ESLint passes with no errors
- [ ] TypeScript compilation succeeds
- [ ] All tests pass
- [ ] Code is properly formatted with Prettier
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented
- [ ] Components are properly typed
- [ ] No unused imports or variables
- [ ] Functions have single responsibility
- [ ] Code follows established patterns

### During Review
- [ ] Code is readable and maintainable
- [ ] Naming is clear and descriptive
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Tests cover critical functionality
- [ ] Documentation is adequate

## 🚀 Best Practices Summary

1. **Always use TypeScript** with proper type definitions
2. **Follow React hooks patterns** and rules
3. **Implement proper error handling** and boundaries
4. **Use the theme system** for consistent styling
5. **Write comprehensive tests** for critical functionality
6. **Document components and functions** appropriately
7. **Follow naming conventions** consistently
8. **Keep functions small** and focused
9. **Use memoization** for performance-critical code
10. **Run linters and formatters** before committing

## 📞 Support

For questions about this style guide:
- Check existing code for examples
- Review the [THEME_USAGE.md](THEME_USAGE.md) for styling patterns
- Contact the development team for clarification

---

**Style Guide Status**: ✅ Active and Enforced
**Last Updated**: 2025-11-03
**Version**: 1.0.0