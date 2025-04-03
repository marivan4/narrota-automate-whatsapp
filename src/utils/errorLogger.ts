
/**
 * Error Logger Utility for the Faturamento System
 * Provides functions for error logging and handling with enhanced features
 */
import { toast } from "sonner";

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface for error log entries
export interface ErrorLogEntry {
  timestamp: string;
  message: string;
  severity: ErrorSeverity;
  source: string;
  stack?: string;
  data?: any;
}

// Error log storage (in-memory for client-side)
let errorLog: ErrorLogEntry[] = [];

/**
 * Log an error with detailed information
 * 
 * @param message Error message
 * @param severity Error severity level
 * @param source Source of the error (component, function, etc)
 * @param error Original error object (optional)
 * @param data Additional contextual data (optional)
 * @param showToast Whether to show a toast notification
 * @returns The error log entry
 */
export const logError = (
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  source: string = 'unknown',
  error?: Error | unknown,
  data?: any,
  showToast: boolean = true
): ErrorLogEntry => {
  // Create log entry
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    message,
    severity,
    source,
    stack: error instanceof Error ? error.stack : undefined,
    data
  };
  
  // Add to in-memory log
  errorLog.push(entry);
  
  // Log to console with appropriate method
  switch (severity) {
    case ErrorSeverity.INFO:
      console.info(`[${source}] ${message}`, data || '');
      break;
    case ErrorSeverity.WARNING:
      console.warn(`[${source}] ${message}`, data || '');
      break;
    case ErrorSeverity.ERROR:
      console.error(`[${source}] ${message}`, data || '');
      if (error) console.error(error);
      break;
    case ErrorSeverity.CRITICAL:
      console.error(`[CRITICAL] [${source}] ${message}`, data || '');
      if (error) console.error(error);
      break;
  }
  
  // Show toast notification if requested
  if (showToast) {
    switch (severity) {
      case ErrorSeverity.INFO:
        toast.info(message);
        break;
      case ErrorSeverity.WARNING:
        toast.warning(message);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        toast.error(message);
        break;
    }
  }
  
  return entry;
};

/**
 * Log an informational message
 * 
 * @param message The message to log
 * @param source Source of the message
 * @param data Additional data
 * @param showToast Whether to show a toast notification
 */
export const logInfo = (
  message: string,
  source: string = 'unknown',
  data?: any,
  showToast: boolean = false
): ErrorLogEntry => {
  return logError(message, ErrorSeverity.INFO, source, undefined, data, showToast);
};

/**
 * Log a warning message
 * 
 * @param message The warning message
 * @param source Source of the warning
 * @param data Additional data
 * @param showToast Whether to show a toast notification
 */
export const logWarning = (
  message: string,
  source: string = 'unknown',
  data?: any,
  showToast: boolean = true
): ErrorLogEntry => {
  return logError(message, ErrorSeverity.WARNING, source, undefined, data, showToast);
};

/**
 * Log a critical error
 * 
 * @param message The critical error message
 * @param source Source of the error
 * @param error Original error object
 * @param data Additional data
 */
export const logCritical = (
  message: string,
  source: string = 'unknown',
  error?: Error | unknown,
  data?: any
): ErrorLogEntry => {
  return logError(message, ErrorSeverity.CRITICAL, source, error, data, true);
};

/**
 * Get the current error log
 * 
 * @returns Array of error log entries
 */
export const getErrorLog = (): ErrorLogEntry[] => {
  return [...errorLog];
};

/**
 * Clear the error log
 */
export const clearErrorLog = (): void => {
  errorLog = [];
  console.log('Error log cleared');
};

/**
 * Send error logs to server for storage
 * 
 * @param entries Log entries to send
 */
export const sendLogsToServer = async (entries: ErrorLogEntry[] = errorLog): Promise<boolean> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!API_URL) return false;
    
    const response = await fetch(`${API_URL}/api/log-errors.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entries })
    });
    
    if (!response.ok) return false;
    
    return true;
  } catch (error) {
    console.error('Failed to send logs to server:', error);
    return false;
  }
};

/**
 * Create an error handler for async functions
 * 
 * @param fn The async function to wrap with error handling
 * @param errorMessage Custom error message
 * @param source Source of the error
 * @returns A function that handles errors automatically
 */
export function createErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage: string = 'Ocorreu um erro ao processar a solicitação',
  source: string = 'unknown'
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(
        errorMessage,
        ErrorSeverity.ERROR,
        source,
        error,
        { args }
      );
      throw error;
    }
  };
}

// Export all utilities in a single object
export const errorLogger = {
  log: logError,
  info: logInfo,
  warn: logWarning,
  error: logError,
  critical: logCritical,
  getLog: getErrorLog,
  clearLog: clearErrorLog,
  sendToServer: sendLogsToServer,
  createHandler: createErrorHandler,
  ErrorSeverity
};

export default errorLogger;
