# Image codec licences

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
