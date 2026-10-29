import type { Request } from 'express';
import type { User } from '@vermont/contracts';

export type AuthRequest = Request & { user: User };
