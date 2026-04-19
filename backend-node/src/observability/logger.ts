// src/observability/logger.ts
import winston from 'winston'

const isProd = process.env.NODE_ENV === 'production'

const wLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isProd
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
          return `${timestamp} ${level}: ${message}${metaStr}`
        })
      ),
  transports: [new winston.transports.Console()],
})

// Wrapper que acepta log.info(meta, message) O log.info(message)
type Meta = Record<string, unknown>
const makeLevel = (level: 'info' | 'warn' | 'error' | 'debug') =>
  (metaOrMsg: Meta | string, msg?: string) => {
    if (typeof metaOrMsg === 'string') {
      wLogger[level](metaOrMsg)
    } else {
      wLogger[level](msg ?? '', metaOrMsg)
    }
  }

export const log = {
  info:  makeLevel('info'),
  warn:  makeLevel('warn'),
  error: makeLevel('error'),
  debug: makeLevel('debug'),
}
