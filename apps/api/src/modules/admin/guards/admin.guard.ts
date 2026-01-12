import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const adminId = request.headers['x-admin-id'];
    
    // In production, validate JWT and check role from token
    // For now, we check x-admin-id header
    if (!adminId) {
      throw new ForbiddenException('Admin access required');
    }
    
    // TODO: Fetch user from DB and verify role === 'admin'
    // For now, we trust the header in development
    
    return true;
  }
}
