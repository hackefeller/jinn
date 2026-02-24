/**
 * Parse YAML frontmatter from markdown file content
 * Extracts content between first and second --- delimiters
 */

/**
 * Parse YAML frontmatter from markdown file
 *
 * @param content - Full markdown file content
 * @returns Object with frontmatter (YAML string) and body (markdown string)
 * @throws Error if frontmatter is missing or malformed
 */
export function parseYamlFrontmatter(content: string): {
  frontmatter: string;
  body: string;
} {
  // Remove leading whitespace but preserve the content structure
  const trimmedContent = content.trimStart();

  // Must start with ---
  if (!trimmedContent.startsWith("---")) {
    throw new Error("Markdown file must start with --- (YAML frontmatter delimiter)");
  }

  // Find the closing --- delimiter
  const endDelimiterIndex = trimmedContent.indexOf("\n---", 3);
  if (endDelimiterIndex === -1) {
    throw new Error("Markdown file has opening --- but no closing --- for YAML frontmatter");
  }

  // Extract frontmatter (content between delimiters, excluding the --- markers)
  const frontmatter = trimmedContent.substring(3, endDelimiterIndex).trim();

  // Extract body (everything after closing ---)
  const body = trimmedContent.substring(endDelimiterIndex + 4).trimStart();

  if (!frontmatter) {
    throw new Error("YAML frontmatter is empty");
  }

  return { frontmatter, body };
}

/**
 * Simple YAML parser for agent metadata
 * Handles basic YAML: key-value pairs, nested objects, and arrays
 * Does NOT handle complex YAML features (anchors, references, etc.)
 *
 * @param yamlString - YAML content to parse
 * @returns Parsed object (values are strings, needs further processing)
 * @throws Error if YAML is malformed
 */
export function parseYaml(yamlString: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yamlString.split("\n");

  let currentKey: string | null = null;
  let currentArray: unknown[] = [];
  let arrayIndent = 0;
  let nestedObject: Record<string, unknown> | null = null;
  let nestedObjectKey: string | null = null;
  let nestedObjectIndent = 0;

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    // Count leading spaces to determine nesting level
    const indent = line.match(/^( *)/)?.[1]?.length ?? 0;
    const trimmedLine = line.trim();

    // Handle nested objects (like models: {primary: X, fallback: Y})
    if (nestedObjectKey && indent > nestedObjectIndent && trimmedLine.includes(":")) {
      const [key, ...valueParts] = trimmedLine.split(":");
      const value = valueParts.join(":").trim();
      nestedObject![key.trim()] = parseValue(value);
      continue;
    }

    // Close nested object if we dedent
    if (nestedObjectKey && indent <= nestedObjectIndent && trimmedLine.includes(":")) {
      result[nestedObjectKey] = nestedObject;
      nestedObject = null;
      nestedObjectKey = null;
    }

    // Handle arrays (like tags: [item1, item2])
    if (trimmedLine.startsWith("- ")) {
      const value = trimmedLine.substring(2).trim();
      currentArray.push(parseValue(value));
      continue;
    }

    // Close array and store if we're no longer in array context
    if (currentArray.length > 0 && !trimmedLine.startsWith("- ")) {
      if (currentKey) {
        result[currentKey] = currentArray;
        currentArray = [];
        currentKey = null;
      }
    }

    // Parse key-value pairs
    if (trimmedLine.includes(":")) {
      const [key, ...valueParts] = trimmedLine.split(":");
      const keyTrimmed = key.trim();
      const value = valueParts.join(":").trim();

      // If value is empty or starts with -, it might be an object or array
      if (!value || value.startsWith("{") || value.startsWith("[")) {
        currentKey = keyTrimmed;
        if (value === "" || value.startsWith("{")) {
          // Start of nested object
          nestedObject = {};
          nestedObjectKey = keyTrimmed;
          nestedObjectIndent = indent;
        }
      } else if (value.startsWith("- ")) {
        // Inline array marker (rare but handle it)
        currentKey = keyTrimmed;
        currentArray = [parseValue(value.substring(2).trim())];
        arrayIndent = indent;
      } else {
        // Simple value
        result[keyTrimmed] = parseValue(value);
      }
    }
  }

  // Close any remaining array
  if (currentArray.length > 0 && currentKey) {
    result[currentKey] = currentArray;
  }

  // Close any remaining nested object
  if (nestedObjectKey) {
    result[nestedObjectKey] = nestedObject;
  }

  return result;
}

/**
 * Parse YAML value: handles strings, numbers, booleans, null
 * Removes quotes from strings
 *
 * @param value - Raw YAML value string
 * @returns Parsed value
 */
function parseValue(value: string): unknown {
  if (!value) return null;

  // Handle booleans
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;

  // Handle null
  if (value.toLowerCase() === "null" || value === "~") return null;

  // Handle numbers
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }

  // Handle quoted strings
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  // Return as string
  return value;
}
