import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  console.log('REQ', req);

  const user = req.user;

  console.log('USER', user);

  if (!user)
    throw new InternalServerErrorException('Usuario no viene en la request');
  return user;
});
