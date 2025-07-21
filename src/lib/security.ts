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
 * Validates flashcard question content with enhanced security
 */
export function validateQuestion(question: string, userId?: string): ValidationResult {
  const basicValidation = validateAndSanitizeTextWithMonitoring(
    question,
    SECURITY_LIMITS.QUESTION_MAX_LENGTH,
    'Question',
    userId
  );
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  const enhancedValidation = enhancedContentValidation(question);
  if (!enhancedValidation.isValid) {
    securityMonitor.logEvent({
      type: 'validation_failure',
      details: `Question: ${enhancedValidation.error}`,
      userId,
    });
    return enhancedValidation;
  }
  
  return basicValidation;
}

/**
 * Validates flashcard answer content with enhanced security
 */
export function validateAnswer(answer: string, userId?: string): ValidationResult {
  const basicValidation = validateAndSanitizeTextWithMonitoring(
    answer,
    SECURITY_LIMITS.ANSWER_MAX_LENGTH,
    'Answer',
    userId
  );
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  const enhancedValidation = enhancedContentValidation(answer);
  if (!enhancedValidation.isValid) {
    securityMonitor.logEvent({
      type: 'validation_failure',
      details: `Answer: ${enhancedValidation.error}`,
      userId,
    });
    return enhancedValidation;
  }
  
  return basicValidation;
}

/**
 * Validates deck title with enhanced security
 */
export function validateTitle(title: string, userId?: string): ValidationResult {
  const basicValidation = validateAndSanitizeTextWithMonitoring(
    title,
    SECURITY_LIMITS.TITLE_MAX_LENGTH,
    'Title',
    userId
  );
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  const enhancedValidation = enhancedContentValidation(title);
  if (!enhancedValidation.isValid) {
    securityMonitor.logEvent({
      type: 'validation_failure',
      details: `Title: ${enhancedValidation.error}`,
      userId,
    });
    return enhancedValidation;
  }
  
  return basicValidation;
}

/**
 * Validates deck description with enhanced security
 */
export function validateDescription(description: string, userId?: string): ValidationResult {
  // Description can be empty
  if (!description || description.trim().length === 0) {
    return { isValid: true, sanitized: '' };
  }
  
  const basicValidation = validateAndSanitizeTextWithMonitoring(
    description,
    SECURITY_LIMITS.DESCRIPTION_MAX_LENGTH,
    'Description',
    userId
  );
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  const enhancedValidation = enhancedContentValidation(description);
  if (!enhancedValidation.isValid) {
    securityMonitor.logEvent({
      type: 'validation_failure',
      details: `Description: ${enhancedValidation.error}`,
      userId,
    });
    return enhancedValidation;
  }
  
  return basicValidation;
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
      // Log rate limiting event
      securityMonitor.logEvent({
        type: 'rate_limit_exceeded',
        details: `Rate limit exceeded for key: ${key}`,
        userId: key.includes('-') ? key.split('-')[1] : undefined,
      });
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
 * Security monitoring and logging
 */
interface SecurityEvent {
  type: 'validation_failure' | 'rate_limit_exceeded' | 'suspicious_activity';
  details: string;
  timestamp: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  
  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };
    
    this.events.push(securityEvent);
    
    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
    
    // Log to console in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', securityEvent);
    }
  }
  
  getRecentEvents(timeWindowMs: number = 300000): SecurityEvent[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.events.filter(event => event.timestamp > cutoff);
  }
  
  detectSuspiciousActivity(userId: string): boolean {
    const recentEvents = this.getRecentEvents(60000); // Last minute
    const userEvents = recentEvents.filter(event => event.userId === userId);
    
    // Flag if too many validation failures from same user
    const validationFailures = userEvents.filter(event => 
      event.type === 'validation_failure'
    ).length;
    
    return validationFailures > 10;
  }
}

export const securityMonitor = new SecurityMonitor();

/**
 * Enhanced validation with security monitoring
 */
export function validateAndSanitizeTextWithMonitoring(
  input: string,
  maxLength: number,
  fieldName: string = 'Input',
  userId?: string
): ValidationResult {
  const result = validateAndSanitizeText(input, maxLength, fieldName);
  
  if (!result.isValid) {
    securityMonitor.logEvent({
      type: 'validation_failure',
      details: `${fieldName}: ${result.error}`,
      userId,
    });
    
    // Check for suspicious activity
    if (userId && securityMonitor.detectSuspiciousActivity(userId)) {
      securityMonitor.logEvent({
        type: 'suspicious_activity',
        details: `Multiple validation failures detected for user ${userId}`,
        userId,
      });
    }
  }
  
  return result;
}

/**
 * Enhanced content filtering for additional security
 */
const ADDITIONAL_DANGEROUS_PATTERNS = [
  // Base64 encoded scripts
  /data:text\/html;base64,/gi,
  // SVG with embedded scripts
  /<svg[^>]*onload/gi,
  // CSS expressions (IE)
  /expression\s*\(/gi,
  // Import statements that could be dangerous
  /@import/gi,
  // Suspicious URLs
  /javascript:/gi,
  /vbscript:/gi,
  /data:application/gi,
];

export function enhancedContentValidation(content: string): ValidationResult {
  // Check for additional dangerous patterns
  for (const pattern of ADDITIONAL_DANGEROUS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isValid: false,
        error: 'Content contains potentially dangerous elements',
      };
    }
  }
  
  return { isValid: true };
}

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