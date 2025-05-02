export const jwtConstants = { secret: process.env.JWT_SECRET || 'changeMe' };

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
