import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: 'UP',
      version: '1.0.0',
      description: 'This is a simple health check response',
    };
  }
}
