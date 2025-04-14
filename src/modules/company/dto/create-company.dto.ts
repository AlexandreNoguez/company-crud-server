import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'NoguezCorp' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '98.722.004/0001-04' })
  @IsNotEmpty()
  @IsString()
  taxId: string;

  @ApiProperty({ example: 'NoguezFantasy' })
  @IsNotEmpty()
  @IsString()
  tradeName: string;

  @ApiProperty({
    example:
      'Minha rua, 280 - Com complemento, Meu bairro, minha cidade - RS, CEP: 99999-999',
  })
  @IsNotEmpty()
  @IsString()
  address: string;
}
