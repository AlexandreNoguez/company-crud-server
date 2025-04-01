import { HttpException, HttpStatus } from '@nestjs/common';
import { handleDatabaseError } from './handle-database-error';

describe('handleDatabaseError', () => {
  it('should throw ConflictException for code 23505', () => {
    const error = {
      code: '23505',
      detail:
        'duplicate key value violates unique constraint "some_unique_constraint"',
    };
    try {
      handleDatabaseError(error);
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(err.getResponse()).toEqual({
        status: HttpStatus.CONFLICT,
        message: 'Um registro com esses valores já existe.',
        details:
          'duplicate key value violates unique constraint "some_unique_constraint"',
      });
    }
  });

  it('should throw BadRequestException for code 23503', () => {
    const error = {
      code: '23503',
      detail:
        'insert or update on table "orders" violates foreign key constraint "fk_user_id"',
    };
    try {
      handleDatabaseError(error);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(error.getResponse()).toEqual({
        status: HttpStatus.BAD_REQUEST,
        message: 'Entidade relacionada não encontrada.',
        details:
          'insert or update on table "orders" violates foreign key constraint "fk_user_id"',
      });
    }
  });

  it('should throw BadRequestException for code 22P02', () => {
    const error = {
      code: '22P02',
      detail: 'invalid input syntax for type integer: "abc"',
    };
    try {
      handleDatabaseError(error);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(e.getResponse()).toEqual({
        status: HttpStatus.BAD_REQUEST,
        message: 'Formato inválido para um dos campos.',
        details: 'invalid input syntax for type integer: "abc"',
      });
    }
  });

  it('should throw BadRequestException for code 23502', () => {
    const error = {
      code: '23502',
      detail: 'null value in column "name" violates not-null constraint',
    };
    try {
      handleDatabaseError(error);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(e.getResponse()).toEqual({
        status: HttpStatus.BAD_REQUEST,
        message: 'Campo obrigatório está ausente.',
        details: 'null value in column "name" violates not-null constraint',
      });
    }
  });

  it('should throw InternalServerErrorException for unknown error code', () => {
    const error = {
      code: 'UNKNOWN_CODE',
      message: 'Something unexpected happened',
      detail: 'Some database error detail',
    };
    const defaultMessage = 'Custom error message';
    try {
      handleDatabaseError(error, defaultMessage);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(e.getResponse()).toEqual({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: defaultMessage,
        details: 'Something unexpected happened',
      });
    }
  });

  it('should throw InternalServerErrorException with default message if no code', () => {
    const error = {
      message: 'Generic database error',
      detail: 'Some detail',
    };
    const defaultMessage = 'Another custom error message';
    try {
      handleDatabaseError(error, defaultMessage);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(e.getResponse()).toEqual({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: defaultMessage,
        details: 'Generic database error',
      });
    }
  });

  it('should throw InternalServerErrorException with default message if error is not a PostgresError', () => {
    const error = new Error('Non-Postgres error');
    const defaultMessage = 'Fallback error message';
    try {
      handleDatabaseError(error, defaultMessage);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(e.getResponse()).toEqual({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: defaultMessage,
        details: 'Non-Postgres error',
      });
    }
  });
});
