#!/usr/bin/env node
/**
 * @file cli.ts
 * @description Command Line Interface (CLI) for compiling .nep files.
 * This script reads a .nep file, compiles it, and outputs the results.
 */
import fs from "fs";
import path from "path";
import { compile, resetCompilerState } from "./index";

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
  const code = fs.readFileSync(path.resolve(filePath), 'utf8');

  console.log('🚀 Compiling .nep file...');

  resetCompilerState();
  const startTime = Date.now();
  const { results, outputs } = compile(code);
  const compilationTime = Date.now() - startTime;

  console.log('✅ Compilation successful!');
  console.log(`⏱️  Compilation time: ${compilationTime}ms`);

  if (outputs.length > 0) {
    console.log('\n📋 Outputs:');
    outputs.forEach((output, index) => {
      console.log(`${output}`);
    });
  } else {
    console.log('ℹ️  No output generated.');
  }

} catch (error: any) {
  console.error(`❌ Compilation Error: ${error.message}`);
  process.exit(1);
}