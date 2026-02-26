import { afterEach, describe, expect, test } from 'bun:test'
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  appendAuditEvent,
  createAuditEvent,
  hashCommand,
  processHookPayload,
  redactCommand,
} from '../bin/agent-cli-audit.js'

const TMP_PREFIX = 'ghostwire-agent-cli-audit-'
const tmpPaths: string[] = []

function createTmpDir() {
  const path = join(tmpdir(), `${TMP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
  mkdirSync(path, { recursive: true })
  tmpPaths.push(path)
  return path
}

afterEach(() => {
  for (const path of tmpPaths.splice(0, tmpPaths.length)) {
    rmSync(path, { recursive: true, force: true })
  }
})

describe('agent-cli-audit', () => {
  test('redacts secret assignments and flags', () => {
    const command =
      "API_KEY=abcd1234 TOKEN='xyz' run --token abc --password=hidden --secret \"qwe\" --api-key zzz --name safe"
    const redacted = redactCommand(command)

    expect(redacted).toContain('API_KEY=[REDACTED]')
    expect(redacted).toContain('TOKEN=[REDACTED]')
    expect(redacted).toContain('--token=[REDACTED]')
    expect(redacted).toContain('--password=[REDACTED]')
    expect(redacted).toContain('--secret=[REDACTED]')
    expect(redacted).toContain('--api-key=[REDACTED]')
    expect(redacted).toContain('--name safe')
  })

  test('hashCommand is deterministic and sensitive to changes', () => {
    const a = hashCommand('echo hello')
    const b = hashCommand('echo hello')
    const c = hashCommand('echo hello!')

    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a).toHaveLength(64)
  })

  test('createAuditEvent builds required schema fields for pre tool use', () => {
    const event = createAuditEvent('preToolUse', {
      sessionId: 'session-1',
      toolName: 'exec_command',
      cwd: '/tmp/workspace',
      toolInput: { cmd: 'SECRET=abc echo ok' },
    })

    expect(event.schema_version).toBe('1')
    expect(event.event_type).toBe('pre_tool_use')
    expect(event.session_id).toBe('session-1')
    expect(event.tool_name).toBe('exec_command')
    expect(event.cwd).toBe('/tmp/workspace')
    expect(event.command_redacted).toContain('SECRET=[REDACTED]')
    expect(event.command_hash_sha256).toHaveLength(64)
  })

  test('createAuditEvent includes exit and duration for post tool use', () => {
    const event = createAuditEvent('postToolUse', {
      session_id: 'session-2',
      tool_name: 'exec_command',
      cwd: '/tmp/workspace',
      tool_input: { cmd: 'echo done' },
      exit_code: 3,
      duration_ms: 42,
    })

    expect(event.event_type).toBe('post_tool_use')
    expect(event.exit_code).toBe(3)
    expect(event.duration_ms).toBe(42)
  })

  test('rotates log file at max size and keeps bounded archives', () => {
    const root = createTmpDir()
    const logFilePath = join(root, '.ghostwire', 'logs', 'agent-cli.jsonl')

    for (let i = 0; i < 30; i += 1) {
      appendAuditEvent(
        logFilePath,
        {
          schema_version: '1',
          event_type: 'pre_tool_use',
          ts: new Date().toISOString(),
          session_id: `s-${i}`,
          tool_name: 'exec_command',
          cwd: root,
          command_redacted: `echo ${'x'.repeat(80)}`,
          command_hash_sha256: hashCommand(`echo ${i}`),
        },
        { maxBytes: 220, maxArchives: 3 },
      )
    }

    const active = readFileSync(logFilePath, 'utf8').trim().split('\n')
    const a1 = readFileSync(`${logFilePath}.1`, 'utf8').trim().split('\n')
    const a2 = readFileSync(`${logFilePath}.2`, 'utf8').trim().split('\n')
    const a3 = readFileSync(`${logFilePath}.3`, 'utf8').trim().split('\n')

    expect(active.length).toBeGreaterThan(0)
    expect(a1.length).toBeGreaterThan(0)
    expect(a2.length).toBeGreaterThan(0)
    expect(a3.length).toBeGreaterThan(0)
  })

  test('writes pre/post lifecycle events to same log stream', () => {
    const root = createTmpDir()
    const logFilePath = join(root, '.ghostwire', 'logs', 'agent-cli.jsonl')

    const pre = processHookPayload(
      'preToolUse',
      {
        session_id: 'session-x',
        tool_name: 'exec_command',
        cwd: root,
        tool_input: { cmd: 'echo hi' },
      },
      { logFilePath },
    )

    const post = processHookPayload(
      'postToolUse',
      {
        session_id: 'session-x',
        tool_name: 'exec_command',
        cwd: root,
        tool_input: { cmd: 'echo hi' },
        exit_code: 0,
        duration_ms: 12,
      },
      { logFilePath },
    )

    expect(pre.ok).toBe(true)
    expect(post.ok).toBe(true)

    const lines = readFileSync(logFilePath, 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))

    expect(lines).toHaveLength(2)
    expect(lines[0].event_type).toBe('pre_tool_use')
    expect(lines[1].event_type).toBe('post_tool_use')
    expect(lines[0].session_id).toBe('session-x')
    expect(lines[1].session_id).toBe('session-x')
  })

  test('fails safely when log path is not writable', () => {
    const root = createTmpDir()
    const blockDir = join(root, '.ghostwire')
    writeFileSync(blockDir, 'blocked', 'utf8')
    chmodSync(blockDir, 0o444)

    const result = processHookPayload('preToolUse', {
        session_id: 'session-y',
        tool_name: 'exec_command',
        cwd: root,
        tool_input: { cmd: 'echo fail-safe' },
      })

    expect(result.ok).toBe(false)
  })
})
