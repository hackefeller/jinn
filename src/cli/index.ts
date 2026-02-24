#!/usr/bin/env bun
import { Command } from "commander";
import { install } from "./install";
import { run } from "./run";
import { getLocalVersion } from "./get-local-version";
import { doctor } from "./doctor";
import { createMcpOAuthCommand } from "./mcp-oauth";
import { exportGenius } from "./export";
import type { InstallArgs } from "./types";
import type { RunOptions } from "./run";
import type { GetLocalVersionOptions } from "./get-local-version/types";
import type { DoctorOptions } from "./doctor";
import packageJson from "../../package.json" with { type: "json" };
import fs from "fs";

const VERSION = packageJson.version;
const INSTALL_HELP = fs.readFileSync(
  new URL("../../docs/cli/install-help.md", import.meta.url),
  "utf8",
);
const RUN_HELP = fs.readFileSync(new URL("../../docs/cli/run-help.md", import.meta.url), "utf8");
const GET_LOCAL_VERSION_HELP = fs.readFileSync(
  new URL("../../docs/cli/get-local-version-help.md", import.meta.url),
  "utf8",
);
const DOCTOR_HELP = fs.readFileSync(
  new URL("../../docs/cli/doctor-help.md", import.meta.url),
  "utf8",
);
const EXPORT_HELP = fs.readFileSync(
  new URL("../../docs/cli/export-help.md", import.meta.url),
  "utf8",
);

const program = new Command();

program
  .name("ghostwire")
  .description("The ultimate Ghostwire plugin - multi-model orchestration, LSP tools, and more")
  .version(VERSION, "-v, --version", "Show version number");

program
  .command("install")
  .description("Install and configure ghostwire with interactive setup")
  .option("--no-tui", "Run in non-interactive mode (requires all options)")
  .option("--openai <value>", "OpenAI/ChatGPT subscription: no, yes (default: no)")
  .option("--gemini <value>", "Gemini integration: no, yes")
  .option("--copilot <value>", "GitHub Copilot subscription: no, yes")
  .option("--opencode-zen <value>", "OpenCode Zen access: no, yes (default: no)")
  .option("--zai-coding-plan <value>", "Z.ai Coding Plan subscription: no, yes (default: no)")
  .option("--kimi-for-coding <value>", "Kimi For Coding subscription: no, yes (default: no)")
  .option("--skip-auth", "Skip authentication setup hints")
  .option("--install-path <path>", "Path to plugin installation (for local development)")
  .option("--local-only", "Only register as local plugin (don't add to OpenCode plugin list)")
  .addHelpText("after", INSTALL_HELP)
  .action(async (options) => {
    const args: InstallArgs = {
      tui: options.tui !== false,
      openai: options.openai,
      gemini: options.gemini,
      copilot: options.copilot,
      opencodeZen: options.opencodeZen,
      zaiCodingPlan: options.zaiCodingPlan,
      kimiForCoding: options.kimiForCoding,
      skipAuth: options.skipAuth ?? false,
      installPath: options.installPath,
      localOnly: options.localOnly ?? false,
    };
    const exitCode = await install(args);
    process.exit(exitCode);
  });

program
  .command("run <message>")
  .description("Run ghostwire with todo/background task completion enforcement")
  .option("-a, --agent <name>", "Agent to use (default: operator)")
  .option("-d, --directory <path>", "Working directory")
  .option("-t, --timeout <ms>", "Timeout in milliseconds (default: 30 minutes)", parseInt)
  .addHelpText("after", RUN_HELP)
  .action(async (message: string, options) => {
    const runOptions: RunOptions = {
      message,
      agent: options.agent,
      directory: options.directory,
      timeout: options.timeout,
    };
    const exitCode = await run(runOptions);
    process.exit(exitCode);
  });

program
  .command("get-local-version")
  .description("Show current installed version and check for updates")
  .option("-d, --directory <path>", "Working directory to check config from")
  .option("--json", "Output in JSON format for scripting")
  .addHelpText("after", GET_LOCAL_VERSION_HELP)
  .action(async (options) => {
    const versionOptions: GetLocalVersionOptions = {
      directory: options.directory,
      json: options.json ?? false,
    };
    const exitCode = await getLocalVersion(versionOptions);
    process.exit(exitCode);
  });

program
  .command("doctor")
  .description("Check ghostwire installation health and diagnose issues")
  .option("--verbose", "Show detailed diagnostic information")
  .option("--json", "Output results in JSON format")
  .option("--category <category>", "Run only specific category")
  .addHelpText("after", DOCTOR_HELP)
  .action(async (options) => {
    const doctorOptions: DoctorOptions = {
      verbose: options.verbose ?? false,
      json: options.json ?? false,
      category: options.category,
    };
    const exitCode = await doctor(doctorOptions);
    process.exit(exitCode);
  });

program
  .command("export")
  .description("Export Ghostwire orchestration intelligence for external agent runtimes")
  .option("--target <value>", "Export target: copilot, codex, all (default: all)")
  .option("-d, --directory <path>", "Output directory (default: current working directory)")
  .option("--force", "Overwrite existing output files")
  .addHelpText("after", EXPORT_HELP)
  .action(async (options) => {
    const exitCode = await exportGenius({
      target: options.target,
      directory: options.directory,
      force: options.force ?? false,
    });
    process.exit(exitCode);
  });

program
  .command("version")
  .description("Show version information")
  .action(() => {
    console.log(`ghostwire v${VERSION}`);
  });

program
  .command("sync-models")
  .description("Sync model configuration to global OpenCode settings")
  .action(async () => {
    const { runSyncModels } = await import("./commands/sync-models");
    const exitCode = await runSyncModels();
    process.exit(exitCode);
  });

program.addCommand(createMcpOAuthCommand());

program.parse();
