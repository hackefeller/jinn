#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const MAX_ACTIVE_BYTES = 50 * 1024 * 1024
const MAX_ARCHIVES = 10

const ENV_ASSIGNMENT_REGEX = /\b([A-Za-z_][A-Za-z0-9_]*)=(?:"[^"]*"|'[^']*'|[^\s]+)/g
const SECRET_FLAG_REGEX = /(--(?:token|password|secret|api-key))(?:=|\s+)(?:"[^"]*"|'[^']*'|[^\s]+)/gi

function getByPath(obj, path) {
  let cursor = obj
  for (const key of path) {
    if (!cursor || typeof cursor !== 'object') return undefined
    cursor = cursor[key]
  }
  return cursor
}

function firstString(payload, paths) {
  for (const path of paths) {
    const value = getByPath(payload, path)
    if (typeof value === 'string' && value.length > 0) return value
  }
  return ''
}

function firstNumber(payload, paths) {
  for (const path of paths) {
    const value = getByPath(payload, path)
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
      return Number(value)
    }
  }
  return undefined
}

function normalizeEventType(eventName, payload) {
  const input = `${eventName || ''} ${firstString(payload, [["hook_event_name"], ["hookEventName"], ["event"]])}`
    .toLowerCase()
    .replace(/[^a-z]/g, '')

  if (input.includes('pretooluse')) return 'pre_tool_use'
  if (input.includes('posttooluse')) return 'post_tool_use'
  if (input.includes('sessionstart')) return 'session_start'
  return 'unknown'
}

export function redactCommand(command) {
  return command
    .replace(ENV_ASSIGNMENT_REGEX, (full, key) => {
      const normalized = String(key).toUpperCase()
      if (
        normalized.includes('TOKEN') ||
        normalized.includes('PASSWORD') ||
        normalized.includes('SECRET') ||
        normalized.includes('API_KEY')
      ) {
        return `${key}=[REDACTED]`
      }
      return full
    })
    .replace(SECRET_FLAG_REGEX, '$1=[REDACTED]')
}

export function hashCommand(command) {
  return createHash('sha256').update(command).digest('hex')
}

function findRepoRoot(startCwd) {
  let current = resolve(startCwd || process.cwd())
  while (true) {
    if (existsSync(join(current, '.git'))) return current
    const parent = dirname(current)
    if (parent === current) return resolve(startCwd || process.cwd())
    current = parent
  }
}

function rotateIfNeeded(logFilePath, nextBytes, maxBytes = MAX_ACTIVE_BYTES, maxArchives = MAX_ARCHIVES) {
  if (!existsSync(logFilePath)) return
  const currentSize = statSync(logFilePath).size
  if (currentSize + nextBytes <= maxBytes) return

  for (let index = maxArchives; index >= 1; index -= 1) {
    const src = index === 1 ? logFilePath : `${logFilePath}.${index - 1}`
    const dest = `${logFilePath}.${index}`

    if (!existsSync(src)) continue
    if (index === maxArchives && existsSync(dest)) unlinkSync(dest)
    renameSync(src, dest)
  }
}

export function createAuditEvent(eventName, payload) {
  const eventType = normalizeEventType(eventName, payload)
  const commandRaw = firstString(payload, [
    ['tool_input', 'command'],
    ['tool_input', 'cmd'],
    ['toolInput', 'command'],
    ['toolInput', 'cmd'],
    ['tool', 'input', 'command'],
    ['tool', 'input', 'cmd'],
    ['tool', 'command'],
    ['tool', 'cmd'],
    ['command'],
    ['cmd'],
    ['input', 'command'],
    ['input', 'cmd'],
    ['args', 'command'],
    ['args', 'cmd'],
  ])

  const commandRedacted = redactCommand(commandRaw)

  const event = {
    schema_version: '1',
    event_type: eventType,
    ts: new Date().toISOString(),
    session_id: firstString(payload, [
      ['session_id'],
      ['sessionId'],
      ['session', 'id'],
      ['session', 'session_id'],
    ]),
    tool_name: firstString(payload, [
      ['tool_name'],
      ['toolName'],
      ['tool', 'name'],
      ['name'],
    ]),
    cwd: firstString(payload, [['cwd'], ['workdir'], ['working_directory']]) || process.cwd(),
    command_redacted: commandRedacted,
    command_hash_sha256: hashCommand(commandRaw),
  }

  if (eventType === 'post_tool_use') {
    event.exit_code = firstNumber(payload, [
      ['exit_code'],
      ['exitCode'],
      ['tool_response', 'exit_code'],
      ['toolResponse', 'exitCode'],
      ['result', 'exit_code'],
      ['result', 'exitCode'],
    ])
    event.duration_ms = firstNumber(payload, [
      ['duration_ms'],
      ['durationMs'],
      ['elapsed_ms'],
      ['elapsedMs'],
      ['tool_response', 'duration_ms'],
      ['toolResponse', 'durationMs'],
      ['result', 'duration_ms'],
      ['result', 'durationMs'],
    ])
  }

  return event
}

export function appendAuditEvent(logFilePath, event, options = {}) {
  const maxBytes = options.maxBytes ?? MAX_ACTIVE_BYTES
  const maxArchives = options.maxArchives ?? MAX_ARCHIVES

  const line = `${JSON.stringify(event)}\n`
  const lineBytes = Buffer.byteLength(line)

  mkdirSync(dirname(logFilePath), { recursive: true })
  rotateIfNeeded(logFilePath, lineBytes, maxBytes, maxArchives)
  writeFileSync(logFilePath, line, { encoding: 'utf8', flag: 'a' })
}

export function processHookPayload(eventName, payload, options = {}) {
  const cwd = firstString(payload, [['cwd'], ['workdir'], ['working_directory']]) || process.cwd()
  const root = options.repoRoot ?? findRepoRoot(cwd)
  const logFilePath = options.logFilePath ?? join(root, '.ghostwire', 'logs', 'agent-cli.jsonl')
  try {
    const event = createAuditEvent(eventName, payload)
    appendAuditEvent(logFilePath, event, options)
    return { ok: true, logFilePath, event }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, logFilePath, error: message }
  }
}

function readStdin() {
  return new Promise((resolveStdin) => {
    let raw = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      raw += chunk
    })
    process.stdin.on('end', () => resolveStdin(raw))
    process.stdin.on('error', () => resolveStdin(''))
  })
}

async function main() {
  const eventName = process.argv[2] || ''

  try {
    const raw = await readStdin()
    const payload = raw.trim() ? JSON.parse(raw) : {}
    const result = processHookPayload(eventName, payload)
    if (!result.ok) {
      process.stderr.write(`[ghostwire-agent-cli-audit] logging failed: ${result.error}\n`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`[ghostwire-agent-cli-audit] logging failed: ${message}\n`)
  }

  process.exit(0)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
