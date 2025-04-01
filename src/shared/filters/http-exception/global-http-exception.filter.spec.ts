import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';
import { GlobalHttpExceptionFilter } from './global-http-exception.filter';

jest.mock('@sentry/nestjs');

describe('GlobalHttpExceptionFilter', () => {
  let filter: GlobalHttpExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    filter = new GlobalHttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: '/test',
      method: 'GET',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      switchToWs: jest.fn(),
      switchToRpc: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should capture the exception with Sentry', () => {
    const exception = new Error('Test error');
    filter.catch(exception, mockArgumentsHost);
    expect(Sentry.captureException).toHaveBeenCalledWith(exception);
  });

  it('should handle HttpException with string response', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Bad Request',
      path: '/test',
      method: 'GET',
      timestamp: expect.any(String),
    });
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException(
      { message: 'Unauthorized', details: 'Invalid token' },
      HttpStatus.UNAUTHORIZED,
    );
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
      details: 'Invalid token',
      path: '/test',
      method: 'GET',
      timestamp: expect.any(String),
    });
  });

  it('should handle generic Error', () => {
    const exception = new Error('Generic error');
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Generic error',
      path: '/test',
      method: 'GET',
      timestamp: expect.any(String),
      details: expect.any(String), // Stack trace exists
    });
  });

  it('should handle generic Error without stack trace', () => {
    const exception = new Error('Generic error');
    exception.stack = undefined;
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Generic error',
      path: '/test',
      method: 'GET',
      timestamp: expect.any(String),
    });
  });

  it('should handle unknown exception', () => {
    const exception = 'Something went wrong';
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: '/test',
      method: 'GET',
      timestamp: expect.any(String),
    });
  });
});
