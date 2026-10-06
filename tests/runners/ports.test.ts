import { describe, expect, it } from 'vitest';
import { deriveRunnerPorts } from './ports.mjs';

describe('deriveRunnerPorts', () => {
  it('uses the three default runner ports', () => {
    expect(deriveRunnerPorts(undefined)).toEqual({
      staticPort: 8788,
      appPort: 8789,
      drawPort: 8790,
      staticOrigin: 'http://127.0.0.1:8788',
      appOrigin: 'http://127.0.0.1:8789',
      drawOrigin: 'http://127.0.0.1:8790',
    });
  });

  it('derives all three ports from a custom base', () => {
    expect(deriveRunnerPorts('9000')).toEqual({
      staticPort: 9000,
      appPort: 9001,
      drawPort: 9002,
      staticOrigin: 'http://127.0.0.1:9000',
      appOrigin: 'http://127.0.0.1:9001',
      drawOrigin: 'http://127.0.0.1:9002',
    });
  });

  it.each(['', 'abc', '9000.5', ' 9000', '-1', '0', '65534', '65535', '65536'])('rejects invalid port base %j', (base) => {
    expect(() => deriveRunnerPorts(base)).toThrow(/NOT3_RUNNER_PORT_BASE/);
  });
});
