const CHUNK_PUBLIC_PATH = "transform.js";
const runtime = require("./build/chunks/[turbopack]_runtime.js");
runtime.loadChunk("build/chunks/apps_web_www_postcss_config_mjs_transform_ts_27c2c43f._.js");
runtime.loadChunk("build/chunks/[root-of-the-server]__1c8359fa._.js");
runtime.getOrInstantiateRuntimeModule("[turbopack-node]/globals.ts [postcss] (ecmascript)", CHUNK_PUBLIC_PATH);
runtime.getOrInstantiateRuntimeModule("[turbopack-node]/ipc/evaluate.ts/evaluate.js { INNER => \"[project]/apps/web/www/postcss.config.mjs/transform.ts { CONFIG => \\\"[project]/apps/web/www/postcss.config.mjs [postcss] (ecmascript)\\\" } [postcss] (ecmascript)\", RUNTIME => \"[turbopack-node]/ipc/evaluate.ts [postcss] (ecmascript)\" } [postcss] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[turbopack-node]/ipc/evaluate.ts/evaluate.js { INNER => \"[project]/apps/web/www/postcss.config.mjs/transform.ts { CONFIG => \\\"[project]/apps/web/www/postcss.config.mjs [postcss] (ecmascript)\\\" } [postcss] (ecmascript)\", RUNTIME => \"[turbopack-node]/ipc/evaluate.ts [postcss] (ecmascript)\" } [postcss] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
