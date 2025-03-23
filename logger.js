import winston from 'winston';

const { createLogger, format, transports } = winston;

const logFormat = format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const fileFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat 
);
const consoleFormat = format.combine(
    format.colorize(), 
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat 
);


export const logger = createLogger({
    level: 'info', 
    format: fileFormat, 
    transports: [
        new transports.File({
            filename: 'logsError.log',
            level: 'error', 
        }),
        new transports.Console({
            format: consoleFormat, 
        }),
    ],
});