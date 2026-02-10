import { Param } from '@nestjs/common';
import { ParseBigIntPipe } from '../pipes/parse-bigint.pipe';

export const ParamBigInt = (name = 'id') => Param(name, new ParseBigIntPipe());
