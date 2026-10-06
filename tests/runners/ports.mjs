export function deriveRunnerPorts(value) {
  const rawBase = value === undefined ? '8788' : value;
  if (typeof rawBase !== 'string' || !/^[1-9]\d*$/.test(rawBase)) {
    throw new Error('NOT3_RUNNER_PORT_BASE must be an integer from 1 to 65533');
  }

  const staticPort = Number(rawBase);
  if (!Number.isSafeInteger(staticPort) || staticPort > 65533) {
    throw new Error('NOT3_RUNNER_PORT_BASE must be an integer from 1 to 65533');
  }

  const appPort = staticPort + 1;
  const drawPort = staticPort + 2;
  return {
    staticPort,
    appPort,
    drawPort,
    staticOrigin: `http://127.0.0.1:${staticPort}`,
    appOrigin: `http://127.0.0.1:${appPort}`,
    drawOrigin: `http://127.0.0.1:${drawPort}`,
  };
}

export const runnerPorts = deriveRunnerPorts(process.env.NOT3_RUNNER_PORT_BASE);
