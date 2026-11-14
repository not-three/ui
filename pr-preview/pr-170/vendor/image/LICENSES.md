# Vendored image assets

These browser assets are copied from the pinned packages in `pnpm-lock.yaml` by `scripts/copy-sandbox-vendor.mjs`. The jSquash JavaScript entry points are bundled into separate `codec.mjs` files for browser loading; their wasm binaries are copied byte for byte. Each package's `LICENSE` is served alongside its assets. Additional upstream codec notices supplied by WebP, PNG and JPEG are served as `LICENSE.codec.md`.

| Asset | Version | Package licence | Source |
| --- | --- | --- | --- |
| `image/avif` — `@jsquash/avif` | 2.1.1 | Apache-2.0 | https://github.com/jamsinclair/jSquash/tree/main/packages/avif |
| `image/jxl` — `@jsquash/jxl` | 1.3.0 | Apache-2.0 | https://github.com/jamsinclair/jSquash/tree/main/packages/jxl |
| `image/webp` — `@jsquash/webp` | 1.5.0 | Apache-2.0; bundled libwebp notice is BSD style | https://github.com/jamsinclair/jSquash/tree/main/packages/webp |
| `image/png` — `@jsquash/png` | 3.1.1 | Apache-2.0; bundled codec notice is BSD style | https://github.com/jamsinclair/jSquash/tree/main/packages/png |
| `image/jpeg` — `@jsquash/jpeg` | 1.6.0 | Apache-2.0; bundled codec notices include IJG, BSD-3-Clause and zlib | https://github.com/jamsinclair/jSquash/tree/main/packages/jpeg |
| `image/heic` — `libheif-js` | 1.23.5 | LGPL-3.0 | https://github.com/catdad-experiments/libheif-js |

The HEIC decoder is copied unmodified as the separate, replaceable `image/heic/libheif-bundle.mjs` file. It is loaded only when HEIC decoding is needed. The licence text is at `image/heic/LICENSE`; the package source is linked above.

The 499-byte `tests/fixtures/image/colors-no-alpha.heic` test fixture comes from [`strukturag/libheif`'s fuzz corpus](https://github.com/strukturag/libheif/blob/master/fuzzing/data/corpus/colors-no-alpha.heic). Its repository [`COPYING`](https://github.com/strukturag/libheif/blob/master/COPYING) states LGPL-3.0 for the library and MIT for sample applications; the fixture is treated under LGPL-3.0 here.

| Asset | Version | Licence | Source | Size |
| --- | --- | --- | --- | ---: |
| ONNX Runtime Web wasm and loader modules | 1.30.0 | MIT | https://github.com/microsoft/onnxruntime/tree/v1.30.0/js/web | 26,834,971 bytes (selected WebGPU bundle wasm build) |
| ISNet general-use dynamic-int8 model (`model_quantized.onnx`) | commit `5349b617911fd60c619b52f32e2b593517b78df3` | Apache-2.0 | https://huggingface.co/Ko033/isnet-general-use-onnx/tree/5349b617911fd60c619b52f32e2b593517b78df3 | 45,902,969 bytes |

The model derives from the [DIS/ISNet project](https://github.com/xuebinqin/DIS) (Apache-2.0). Its source ONNX export was distributed by [rembg](https://github.com/danielgatis/rembg) (MIT). The model repository describes the quantized conversion and removed auxiliary outputs in its [model card](https://huggingface.co/Ko033/isnet-general-use-onnx/blob/5349b617911fd60c619b52f32e2b593517b78df3/README.md). The model is 45,902,969 bytes on disk, SHA-256 `5039225b9a4ac3df55f185d24b7a92d640c86cc4747002d7f23351e394de03a6`.

Input `input_image` is float32 `[1,3,1024,1024]` at runtime, RGB planar with channels normalized as `x / 255 - 0.5`. The graph uses dynamic height and width and ONNX opset 13. Output `output_image` is float32 `[1,1,1024,1024]` at runtime and is already a sigmoid probability map. Its graph uses `DynamicQuantizeLinear`, `ConvInteger`, `Resize`, `MaxPool`, `Relu`, and `Sigmoid` among other standard operators.
