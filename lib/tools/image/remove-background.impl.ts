import type { ToolRun } from '../types';
import { pixelsOf, rasterOutput, requireImage, stem } from './shared';
import { MODEL_SIDE, compositeMask, featherMask, normalizeMask, prepareImage } from './background-mask.impl';
import { downloadModel } from './background-model.impl';
const WASM_PATH = '/vendor/image/onnxruntime-web/';

export const run: ToolRun = async (inputs, options, context) => {
  const image = requireImage(inputs.input);
  const feather = Number(options.feather ?? 2);
  if (!Number.isInteger(feather) || feather < 0 || feather > 8) throw new Error('Feather edge must be 0–8 px');
  const raster = await pixelsOf(image.bitmap);
  context.signal.throwIfAborted();
  const tensorData = prepareImage(raster);
  const bytes = await downloadModel(context.signal, context.reportProgress);
  context.signal.throwIfAborted();
  const ort = await import('onnxruntime-web/webgpu');
  ort.env.wasm.wasmPaths = WASM_PATH;
  ort.env.wasm.numThreads = 1;
  context.signal.throwIfAborted();
  let session: Awaited<ReturnType<typeof ort.InferenceSession.create>>;
  const hasGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
  if (hasGpu) {
    try { session = await ort.InferenceSession.create(bytes, { executionProviders: ['webgpu', 'wasm'] }); }
    catch { session = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] }); }
  } else session = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] });
  let released = false;
  const release = () => { if (!released) { released = true; void session.release(); } };
  context.signal.addEventListener('abort', release, { once: true });
  if (context.signal.aborted) { release(); context.signal.throwIfAborted(); }
  try {
    context.reportProgress(0.7);
    const output = await session.run({ input_image: new ort.Tensor('float32', tensorData, [1, 3, MODEL_SIDE, MODEL_SIDE]) });
    context.signal.throwIfAborted();
    const mask = output.output_image;
    if (!mask || mask.dims.length !== 4 || mask.dims[0] !== 1 || mask.dims[1] !== 1 || !(mask.data instanceof Float32Array)) throw new Error('Unexpected background model output');
    const width = Number(mask.dims[3]); const height = Number(mask.dims[2]);
    context.reportProgress(0.9);
    const alpha = featherMask(normalizeMask(mask.data, width, height, raster.width, raster.height), raster.width, raster.height, feather);
    context.signal.throwIfAborted();
    const result = await rasterOutput(compositeMask(raster, alpha), `${stem(image.name)}-remove-background.png`);
    context.signal.throwIfAborted();
    context.reportProgress(1);
    return result;
  } catch (error) { release(); throw error; }
};
