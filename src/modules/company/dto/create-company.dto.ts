/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'NoguezCorp' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'NoguezCorp' })
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @ApiProperty({ example: 'NoguezCorp' })
  @IsNotEmpty()
  @IsString()
  tradeName: string;

  @ApiProperty({ example: 'Rua X, 123 - Bairro Y, SP' })
  @IsNotEmpty()
  @IsString()
  address: string;
}
