import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

/**
 * Parses and validates a value against a Zod schema.
 * @param schema The Zod schema to validate against.
 * @param value The value to be validated.
 * @returns The validated value.
 * 
 * @throws BadRequestException if validation fails.
 */
export function parse<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new BadRequestException(result.error.issues.map((i) => i.message).join(', '));
  }
  return result.data;
}
