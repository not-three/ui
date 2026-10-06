# Vendored image assets

| Asset | Version | Licence | Source | Size |
| --- | --- | --- | --- | ---: |
| ONNX Runtime Web wasm and loader modules | 1.30.0 | MIT | https://github.com/microsoft/onnxruntime/tree/v1.30.0/js/web | 26,834,971 bytes (selected WebGPU bundle wasm build) |
| ISNet general-use dynamic-int8 model (`model_quantized.onnx`) | commit `5349b617911fd60c619b52f32e2b593517b78df3` | Apache-2.0 | https://huggingface.co/Ko033/isnet-general-use-onnx/tree/5349b617911fd60c619b52f32e2b593517b78df3 | 45,902,969 bytes |

The model derives from the [DIS/ISNet project](https://github.com/xuebinqin/DIS) (Apache-2.0). Its source ONNX export was distributed by [rembg](https://github.com/danielgatis/rembg) (MIT). The model repository describes the quantized conversion and removed auxiliary outputs in its [model card](https://huggingface.co/Ko033/isnet-general-use-onnx/blob/5349b617911fd60c619b52f32e2b593517b78df3/README.md). The model is 45,902,969 bytes on disk, SHA-256 `5039225b9a4ac3df55f185d24b7a92d640c86cc4747002d7f23351e394de03a6`.

Input `input_image` is float32 `[1,3,1024,1024]` at runtime, RGB planar with channels normalized as `x / 255 - 0.5`. The graph uses dynamic height and width and ONNX opset 13. Output `output_image` is float32 `[1,1,1024,1024]` at runtime and is already a sigmoid probability map. Its graph uses `DynamicQuantizeLinear`, `ConvInteger`, `Resize`, `MaxPool`, `Relu`, and `Sigmoid` among other standard operators.
