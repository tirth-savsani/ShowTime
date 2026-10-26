import { jest } from '@jest/globals';
import { validateEnv } from '../config/env.js';

describe('Environment Variable Validation', () => {
  const originalEnv = { ...process.env };
  let exitMock;
  let consoleErrorMock;

  beforeEach(() => {
    exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    exitMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  it('exits with code 1 and prints missing variables when required env vars are missing in development', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;
    delete process.env.dbURL;

    validateEnv();

    expect(exitMock).toHaveBeenCalledWith(1);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      expect.stringContaining('FATAL: Missing required environment variables:')
    );
  });
});
