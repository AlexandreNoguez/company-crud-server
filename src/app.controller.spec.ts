import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return basic health check', () => {
      const healthCheck = {
        status: 'UP',
        version: '1.0.0',
        description: 'This is a simple health check response',
      };

      expect(appController.getHealthCheck()).toEqual(
        JSON.stringify(healthCheck),
      );
    });
  });
});
