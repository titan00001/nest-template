import { SetMetadata } from '@nestjs/common';
import { IRole } from '../interfaces/role.interface';

export const Roles = (...roles: IRole[]) => SetMetadata('roles', roles);
