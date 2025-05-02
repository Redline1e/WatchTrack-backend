import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface RequestUser {
  userId: number;
  email: string;
  role: string;
}
export const User = createParamDecorator(
  (data: keyof RequestUser, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return data ? req.user[data] : req.user;
  },
);
