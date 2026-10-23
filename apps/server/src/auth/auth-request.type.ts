import type { Request } from 'express';
import type { User } from '@people/contracts';

export type AuthRequest = Request & { user: User };
