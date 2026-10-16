import { describe, expect, it } from 'vitest';
import config from '../../playwright.config';

describe('playwright config', () => {
  it('uses a cross-platform npm command for preview server', () => {
    expect(config.webServer).toBeDefined();
    const webServer = Array.isArray(config.webServer) ? config.webServer[0] : config.webServer;
    expect(webServer?.command).toContain('npm run preview');
    expect(webServer?.command).not.toContain('npm.cmd');
  });
});
