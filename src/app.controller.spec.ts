import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: jest.Mocked<Pick<AppService, 'getHello'>>;

  beforeEach(async () => {
    const appServiceMock: jest.Mocked<Pick<AppService, 'getHello'>> = {
      getHello: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appServiceMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('should return the message provided by AppService', () => {
      appService.getHello.mockReturnValue('Hello World!');

      expect(appController.getHello()).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
