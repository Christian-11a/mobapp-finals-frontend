import { COLORS } from '../constants/colors';

export class AppError extends Error {
  code: string;
  constructor(message: string, code: string = 'app/unknown') {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export class AuthError extends AppError {
  constructor(message: string, code: string = 'auth/unknown') {
    super(message, code);
    this.name = 'AuthError';
  }
}

export class DomainError extends AppError {
  constructor(message: string, code: string = 'domain/unknown') {
    super(message, code);
    this.name = 'DomainError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'No internet connection', code: string = 'network/no-connection') {
    super(message, code);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'validation/invalid') {
    super(message, code);
    this.name = 'ValidationError';
  }
}

/**
 * Maps Firebase error codes to user-friendly messages and AppError types
 */
export const mapFirebaseError = (error: any): AppError => {
  const code = error?.code || 'unknown';
  const message = error?.message || 'An unexpected error occurred';

  // Auth Errors
  if (code.startsWith('auth/')) {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return new AuthError('Invalid email or password.', code);
      case 'auth/email-already-in-use':
        return new AuthError('This email is already registered.', code);
      case 'auth/weak-password':
        return new AuthError('Password is too weak.', code);
      case 'auth/too-many-requests':
        return new AuthError('Too many failed attempts. Please try again later.', code);
      case 'auth/requires-recent-login':
        return new AuthError('Please sign in again to perform this action.', code);
      default:
        return new AuthError(message, code);
    }
  }

  // Firestore Errors
  if (code.startsWith('firestore/')) {
    switch (code) {
      case 'permission-denied':
        return new DomainError('You do not have permission to perform this action.', code);
      case 'not-found':
        return new DomainError('The requested resource was not found.', code);
      default:
        return new DomainError(message, code);
    }
  }

  return new AppError(message, code);
};

/**
 * Helper to handle async operations with consistent error mapping and toast notification
 */
export const handleAsyncOperation = async <T>(
  fn: () => Promise<T>,
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error: any) {
    const appError = mapFirebaseError(error);
    if (showToast) {
      showToast(appError.message, 'error');
    }
    console.error(`[AsyncOperation Error] ${appError.code}: ${appError.message}`, error);
    return null;
  }
};
