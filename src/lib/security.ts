/**
 * Security utilities for client-side input validation and sanitization
 */

// Content length limits based on database constraints
export const SECURITY_LIMITS = {
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
  QUESTION_MAX_LENGTH: 2000,
  ANSWER_MAX_LENGTH: 2000,
  CATEGORY_MAX_LENGTH: 100,
  DISPLAY_NAME_MAX_LENGTH: 100,
} as const;

// Patterns for validation
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /on\w+\s*=/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
];

const SQL_INJECTION_PATTERNS = [
  /('|(\\')|(;)|(\\';)|(;--)|(\\';--))/gi,
  /(union\s+select)/gi,
  /(insert\s+into)/gi,
  /(delete\s+from)/gi,
  /(update\s+set)/gi,
  /(drop\s+table)/gi,
  /(alter\s+table)/gi,
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validates and sanitizes text input for potential security threats
 */
export function validateAndSanitizeText(
  input: string,
  maxLength: number,
  fieldName: string = 'Input'
): ValidationResult {
  // Check for empty input
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`,
    };
  }

  // Check length limits
  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be ${maxLength} characters or less`,
    };
  }

  // Check for XSS patterns
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        error: `${fieldName} contains potentially dangerous content`,
      };
    }
  }

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        error: `${fieldName} contains invalid characters`,
      };
    }
  }

  // Basic HTML entity encoding for display safety
  const sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validates flashcard question content
 */
export function validateQuestion(question: string): ValidationResult {
  return validateAndSanitizeText(
    question,
    SECURITY_LIMITS.QUESTION_MAX_LENGTH,
    'Question'
  );
}

/**
 * Validates flashcard answer content
 */
export function validateAnswer(answer: string): ValidationResult {
  return validateAndSanitizeText(
    answer,
    SECURITY_LIMITS.ANSWER_MAX_LENGTH,
    'Answer'
  );
}

/**
 * Validates deck title
 */
export function validateTitle(title: string): ValidationResult {
  return validateAndSanitizeText(
    title,
    SECURITY_LIMITS.TITLE_MAX_LENGTH,
    'Title'
  );
}

/**
 * Validates deck description
 */
export function validateDescription(description: string): ValidationResult {
  // Description can be empty
  if (!description || description.trim().length === 0) {
    return { isValid: true, sanitized: '' };
  }
  
  return validateAndSanitizeText(
    description,
    SECURITY_LIMITS.DESCRIPTION_MAX_LENGTH,
    'Description'
  );
}

/**
 * Rate limiting tracker for client-side
 */
class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  canAttempt(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  getRemainingTime(key: string, windowMs: number = 60000): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeElapsed = Date.now() - oldestAttempt;
    
    return Math.max(0, windowMs - timeElapsed);
  }
}

export const rateLimiter = new ClientRateLimiter();

/**
 * Content Security Policy helpers for safe content display
 */
export function sanitizeForDisplay(content: string): string {
  return content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * Validates file uploads if implemented
 */
export function validateFileUpload(file: File): ValidationResult {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, GIF, and WebP images are allowed',
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB',
    };
  }
  
  return { isValid: true };
}