#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("./index");
const filePath = process.argv[2];
if (!filePath) {
    console.error('❌ Error: Please provide a path to a .nep file.');
    process.exit(1);
}
if (!filePath.endsWith('.nep')) {
    console.error('❌ Error: The provided file is not a .nep file.');
    process.exit(1);
}
try {
    const code = fs_1.default.readFileSync(path_1.default.resolve(filePath), 'utf8');
    console.log('🚀 Compiling .nep file...');
    (0, index_1.resetCompilerState)();
    const startTime = Date.now();
    const { results, outputs } = (0, index_1.compile)(code);
    const compilationTime = Date.now() - startTime;
    console.log('✅ Compilation successful!');
    console.log(`⏱️  Compilation time: ${compilationTime}ms`);
    if (outputs.length > 0) {
        console.log('\n📋 Outputs:');
        outputs.forEach((output, index) => {
            console.log(`${output}`);
        });
    }
    else {
        console.log('ℹ️  No output generated.');
    }
}
catch (error) {
    console.error(`❌ Compilation Error: ${error.message}`);
    process.exit(1);
}
