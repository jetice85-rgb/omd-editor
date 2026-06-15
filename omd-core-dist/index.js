"use strict";
/**
 * OMD 核心引擎
 * omd-core — 智慧生而共通
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.omdToPptx = exports.toPptx = exports.omdToXlsx = exports.toXlsx = exports.omdToDocx = exports.toDocx = exports.validate = exports.outlineToText = exports.getOutline = exports.stringify = exports.toMarkdown = exports.fromMarkdown = exports.parse = void 0;
var parse_js_1 = require("./parse.js");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parse_js_1.parse; } });
Object.defineProperty(exports, "fromMarkdown", { enumerable: true, get: function () { return parse_js_1.fromMarkdown; } });
Object.defineProperty(exports, "toMarkdown", { enumerable: true, get: function () { return parse_js_1.toMarkdown; } });
var stringify_js_1 = require("./stringify.js");
Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return stringify_js_1.stringify; } });
var outline_js_1 = require("./outline.js");
Object.defineProperty(exports, "getOutline", { enumerable: true, get: function () { return outline_js_1.getOutline; } });
Object.defineProperty(exports, "outlineToText", { enumerable: true, get: function () { return outline_js_1.outlineToText; } });
var validate_js_1 = require("./validate.js");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validate_js_1.validate; } });
var convert_js_1 = require("./convert.js");
Object.defineProperty(exports, "toDocx", { enumerable: true, get: function () { return convert_js_1.toDocx; } });
Object.defineProperty(exports, "omdToDocx", { enumerable: true, get: function () { return convert_js_1.omdToDocx; } });
var convert_xlsx_js_1 = require("./convert-xlsx.js");
Object.defineProperty(exports, "toXlsx", { enumerable: true, get: function () { return convert_xlsx_js_1.toXlsx; } });
Object.defineProperty(exports, "omdToXlsx", { enumerable: true, get: function () { return convert_xlsx_js_1.omdToXlsx; } });
var convert_pptx_js_1 = require("./convert-pptx.js");
Object.defineProperty(exports, "toPptx", { enumerable: true, get: function () { return convert_pptx_js_1.toPptx; } });
Object.defineProperty(exports, "omdToPptx", { enumerable: true, get: function () { return convert_pptx_js_1.omdToPptx; } });
