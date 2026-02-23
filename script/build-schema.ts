#!/usr/bin/env bun
import * as z from "zod";
import { GhostwireConfigSchema } from "../src/platform/config/schema";

const SCHEMA_OUTPUT_PATH = "assets/ghostwire.schema.json";

async function main() {
  console.log("Generating JSON Schema...");

  const jsonSchema = z.toJSONSchema(GhostwireConfigSchema, {
    io: "input",
    target: "draft-7",
  });

  const finalSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/hackefeller/ghostwire/master/assets/ghostwire.schema.json",
    title: "Ghostwire Configuration",
    description: "Configuration schema for ghostwire plugin",
    ...jsonSchema,
  };

  await Bun.write(SCHEMA_OUTPUT_PATH, JSON.stringify(finalSchema, null, 2));

  console.log(`✓ JSON Schema generated: ${SCHEMA_OUTPUT_PATH}`);
}

main();
