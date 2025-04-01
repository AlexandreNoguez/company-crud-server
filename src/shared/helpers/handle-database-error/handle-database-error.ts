import { HttpException, HttpStatus } from '@nestjs/common';

interface PostgresError extends Error {
  code?: string;
  detail?: string;
}

export function handleDatabaseError(
  error: unknown,
  defaultMessage = 'Internal server error',
) {
  const err = error as PostgresError;

  switch (err.code) {
    case '23505':
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'Um registro com esses valores já existe.',
          details: err.detail,
        },
        HttpStatus.CONFLICT,
      );

    case '23503':
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Entidade relacionada não encontrada.',
          details: err.detail,
        },
        HttpStatus.BAD_REQUEST,
      );

    case '22P02':
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Formato inválido para um dos campos.',
          details: err.detail,
        },
        HttpStatus.BAD_REQUEST,
      );

    case '23502':
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Campo obrigatório está ausente.',
          details: err.detail,
        },
        HttpStatus.BAD_REQUEST,
      );

    default:
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: defaultMessage,
          details: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
  }
}
