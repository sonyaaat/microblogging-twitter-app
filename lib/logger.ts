import winston from 'winston';

const isProd = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'isoDateTime' }),
    winston.format.json()
  ),
  defaultMeta: { service: 'microblog-api' },
  transports: [
    new winston.transports.Console(),
  ],
});

/**
 * @brief Logs an informational event with structured metadata.
 * @param message - Human-readable description of the event
 * @param meta - Optional key-value pairs for structured context
 * @returns void
 */
export function logInfo(message: string, meta?: Record<string, unknown>): void {
  logger.info(message, meta);
}

/**
 * @brief Logs a warning event with structured metadata.
 * @param message - Human-readable description of the warning
 * @param meta - Optional key-value pairs for structured context
 * @returns void
 */
export function logWarn(message: string, meta?: Record<string, unknown>): void {
  logger.warn(message, meta);
}

/**
 * @brief Logs an error event with structured metadata.
 * @param message - Human-readable description of the error
 * @param meta - Optional key-value pairs for structured context
 * @returns void
 */
export function logError(message: string, meta?: Record<string, unknown>): void {
  logger.error(message, meta);
}

/**
 * @brief Logs a debug event with structured metadata.
 * @param message - Human-readable description of the debug event
 * @param meta - Optional key-value pairs for structured context
 * @returns void
 */
export function logDebug(message: string, meta?: Record<string, unknown>): void {
  logger.debug(message, meta);
}
