import path from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';
import openapiTS from 'openapi-typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


async function run() {
  const outputFilename = path.resolve(path.join(__dirname, '../api/schema.d.ts'));
  const output = await openapiTS(path.join(__dirname, '../api/schema.yaml'));

  await writeFile(outputFilename, output);
  console.log(`${outputFilename} written`);
}

run();
