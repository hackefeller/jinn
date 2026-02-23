import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { findServerForExtension, getAllServers, isServerInstalled } from "./config";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { tmpdir } from "os";

describe("isServerInstalled", () => {
  let tempDir: string;
  let savedEnv: { [key: string]: string | undefined };

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "lsp-config-test-"));
    savedEnv = {
      PATH: process.env.PATH,
      Path: process.env.Path,
      PATHEXT: process.env.PATHEXT,
    };
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error(`Failed to clean up temp dir: ${e}`);
    }

    if (process.platform === "win32") {
      const pathVal = savedEnv.PATH ?? savedEnv.Path;
      if (pathVal === undefined) {
        delete process.env.PATH;
        delete process.env.Path;
      } else {
        process.env.PATH = pathVal;
        process.env.Path = pathVal;
      }
    } else {
      if (savedEnv.PATH === undefined) {
        delete process.env.PATH;
      } else {
        process.env.PATH = savedEnv.PATH;
      }

      if (savedEnv.Path === undefined) {
        delete process.env.Path;
      } else {
        process.env.Path = savedEnv.Path;
      }
    }

    const pathextVal = savedEnv.PATHEXT;
    if (pathextVal === undefined) {
      delete process.env.PATHEXT;
    } else {
      process.env.PATHEXT = pathextVal;
    }
  });

  test("detects executable in PATH", () => {
    const binName = "test-lsp-server";
    const ext = process.platform === "win32" ? ".cmd" : "";
    const binPath = join(tempDir, binName + ext);

    writeFileSync(binPath, "echo hello");

    const pathSep = process.platform === "win32" ? ";" : ":";
    process.env.PATH = `${tempDir}${pathSep}${process.env.PATH || ""}`;

    expect(isServerInstalled([binName])).toBe(true);
  });

  test("returns false for missing executable", () => {
    expect(isServerInstalled(["non-existent-server"])).toBe(false);
  });

  if (process.platform === "win32") {
    test("Windows: detects executable with Path env var", () => {
      const binName = "test-lsp-server-case";
      const binPath = join(tempDir, binName + ".cmd");
      writeFileSync(binPath, "echo hello");

      delete process.env.PATH;
      process.env.Path = tempDir;

      expect(isServerInstalled([binName])).toBe(true);
    });

    test("Windows: respects PATHEXT", () => {
      const binName = "test-lsp-server-custom";
      const binPath = join(tempDir, binName + ".COM");
      writeFileSync(binPath, "echo hello");

      process.env.PATH = tempDir;
      process.env.PATHEXT = ".COM;.EXE";

      expect(isServerInstalled([binName])).toBe(true);
    });

    test("Windows: ensures default extensions are checked even if PATHEXT is missing", () => {
      const binName = "test-lsp-server-default";
      const binPath = join(tempDir, binName + ".bat");
      writeFileSync(binPath, "echo hello");

      process.env.PATH = tempDir;
      delete process.env.PATHEXT;

      expect(isServerInstalled([binName])).toBe(true);
    });

    test("Windows: ensures default extensions are checked even if PATHEXT does not include them", () => {
      const binName = "test-lsp-server-ps1";
      const binPath = join(tempDir, binName + ".ps1");
      writeFileSync(binPath, "echo hello");

      process.env.PATH = tempDir;
      process.env.PATHEXT = ".COM";

      expect(isServerInstalled([binName])).toBe(true);
    });
  } else {
    test("Non-Windows: does not use windows extensions", () => {
      const binName = "test-lsp-server-win";
      const binPath = join(tempDir, binName + ".cmd");
      writeFileSync(binPath, "echo hello");

      process.env.PATH = tempDir;

      expect(isServerInstalled([binName])).toBe(false);
    });
  }
});

describe("LSP config source precedence", () => {
  let tempDir: string;
  let projectDir: string;
  let configDir: string;
  let previousCwd: string;
  let previousConfigDir: string | undefined;

  const writeJson = (path: string, value: unknown) => {
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, JSON.stringify(value, null, 2));
  };

  const writeRaw = (path: string, value: string) => {
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, value);
  };

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "lsp-precedence-test-"));
    projectDir = join(tempDir, "project");
    configDir = join(tempDir, "config");
    mkdirSync(projectDir, { recursive: true });
    mkdirSync(configDir, { recursive: true });
    previousCwd = process.cwd();
    previousConfigDir = process.env.OPENCODE_CONFIG_DIR;
    process.chdir(projectDir);
    process.env.OPENCODE_CONFIG_DIR = configDir;
  });

  afterEach(() => {
    process.chdir(previousCwd);
    if (previousConfigDir === undefined) {
      delete process.env.OPENCODE_CONFIG_DIR;
    } else {
      process.env.OPENCODE_CONFIG_DIR = previousConfigDir;
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("project_ghostwire_jsonc_takes_precedence_over_project_ghostwire_json", () => {
    writeJson(join(projectDir, ".opencode", "ghostwire.json"), {
      lsp: { fromProjectJson: { command: ["bun"], extensions: [".prio-a"] } },
    });
    writeRaw(
      join(projectDir, ".opencode", "ghostwire.jsonc"),
      `{
        // higher priority
        "lsp": { "fromProjectJsonc": { "command": ["bun"], "extensions": [".prio-a"] } }
      }`,
    );

    const result = findServerForExtension(".prio-a");
    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.server.id).toBe("fromProjectJsonc");
    }
  });

  test("project_ghostwire_json_is_used_when_jsonc_missing", () => {
    writeJson(join(projectDir, ".opencode", "ghostwire.json"), {
      lsp: { ghostwireProject: { command: ["bun"], extensions: [".prio-b"] } },
    });

    const result = findServerForExtension(".prio-b");
    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.server.id).toBe("ghostwireProject");
    }
  });

  test("user_ghostwire_jsonc_takes_precedence_over_user_ghostwire_json", () => {
    writeJson(join(configDir, "ghostwire.json"), {
      lsp: { fromUserJson: { command: ["bun"], extensions: [".prio-c"] } },
    });
    writeRaw(
      join(configDir, "ghostwire.jsonc"),
      `{
        "lsp": { "fromUserJsonc": { "command": ["bun"], "extensions": [".prio-c"] } }
      }`,
    );

    const result = findServerForExtension(".prio-c");
    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.server.id).toBe("fromUserJsonc");
    }
  });

  test("user_ghostwire_json_is_used_when_jsonc_missing", () => {
    writeJson(join(configDir, "ghostwire.json"), {
      lsp: { ghostwireUser: { command: ["bun"], extensions: [".prio-d"] } },
    });

    const result = findServerForExtension(".prio-d");
    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.server.id).toBe("ghostwireUser");
    }
  });

  test("project_overrides_user_overrides_opencode", () => {
    writeJson(join(configDir, "opencode.json"), {
      lsp: { sameServer: { command: ["bun"], extensions: [".prio-e"] } },
    });
    writeJson(join(configDir, "ghostwire.json"), {
      lsp: { sameServer: { command: ["bun"], extensions: [".prio-e"], priority: 10 } },
    });
    writeJson(join(projectDir, ".opencode", "ghostwire.json"), {
      lsp: { sameServer: { command: ["bun"], extensions: [".prio-e"], priority: 20 } },
    });

    const result = findServerForExtension(".prio-e");
    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.server.priority).toBe(20);
    }
  });

  test("invalid_high_priority_file_falls_back_to_next_candidate", () => {
    writeRaw(join(projectDir, ".opencode", "ghostwire.jsonc"), `{ invalid`);
    writeJson(join(projectDir, ".opencode", "ghostwire.json"), {
      lsp: { fallbackProject: { command: ["bun"], extensions: [".prio-f"] } },
    });

    const result = findServerForExtension(".prio-f");
    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.server.id).toBe("fallbackProject");
    }
  });

  test("disabled_lsp_entries_are_respected_across_sources", () => {
    writeJson(join(projectDir, ".opencode", "ghostwire.json"), {
      lsp: { blocked: { disabled: true } },
    });
    writeJson(join(configDir, "ghostwire.json"), {
      lsp: { blocked: { command: ["bun"], extensions: [".prio-g"] } },
    });

    const result = findServerForExtension(".prio-g");
    expect(result.status).toBe("not_configured");
  });

  test("plugin_servers_still_loaded_when_not_overridden", () => {
    const servers = getAllServers();
    expect(servers.length).toBeGreaterThan(0);
    expect(servers.some((server) => server.id === "typescript")).toBe(true);
  });
});
