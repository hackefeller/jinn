/**
 * Import Telemetry System
 *
 * Tracks import success/failure rates and performance metrics.
 */

import type { ClaudeImportResult } from "./types";

export interface ImportEvent {
  id: string;
  timestamp: number;
  pluginName: string;
  path: string;
  success: boolean;
  duration: number;
  componentCounts: {
    commands: number;
    skills: number;
    agents: number;
    mcps: number;
    hooks: number;
  };
  errorCount: number;
  warningCount: number;
  config: {
    strict?: boolean;
    atomic?: boolean;
    dryRun?: boolean;
  };
}

export interface TelemetryMetrics {
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  successRate: number;
  averageDuration: number;
  totalComponents: number;
  averageComponentsPerImport: number;
  errorRate: number;
  topErrors: Array<{ code: string; count: number }>;
  topWarnings: Array<{ code: string; count: number }>;
}

export interface TelemetryConfig {
  enabled: boolean;
  maxEvents: number;
  persistToDisk: boolean;
  anonymizePaths: boolean;
}

export const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  enabled: true,
  maxEvents: 1000,
  persistToDisk: false,
  anonymizePaths: true,
};

/**
 * Telemetry collector for import operations
 */
export class ImportTelemetry {
  private events: ImportEvent[] = [];
  private config: TelemetryConfig;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...DEFAULT_TELEMETRY_CONFIG, ...config };
  }

  /**
   * Record an import event
   */
  recordEvent(
    result: ClaudeImportResult,
    duration: number,
    config: { strict?: boolean; atomic?: boolean; dryRun?: boolean } = {},
  ): ImportEvent {
    if (!this.config.enabled) {
      return null as unknown as ImportEvent;
    }

    const event: ImportEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      pluginName: result.report.pluginName,
      path: this.config.anonymizePaths
        ? this.anonymizePath(result.report.path)
        : result.report.path,
      success: result.report.errors.length === 0,
      duration,
      componentCounts: result.report.converted,
      errorCount: result.report.errors.length,
      warningCount: result.report.warnings.length,
      config,
    };

    this.events.push(event);

    // Trim old events if over limit
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }

    return event;
  }

  /**
   * Get telemetry metrics
   */
  getMetrics(): TelemetryMetrics {
    if (this.events.length === 0) {
      return {
        totalImports: 0,
        successfulImports: 0,
        failedImports: 0,
        successRate: 0,
        averageDuration: 0,
        totalComponents: 0,
        averageComponentsPerImport: 0,
        errorRate: 0,
        topErrors: [],
        topWarnings: [],
      };
    }

    const successful = this.events.filter((e) => e.success);
    const failed = this.events.filter((e) => !e.success);

    const totalDuration = this.events.reduce((sum, e) => sum + e.duration, 0);
    const totalComponents = this.events.reduce(
      (sum, e) =>
        sum +
        e.componentCounts.commands +
        e.componentCounts.skills +
        e.componentCounts.agents +
        e.componentCounts.mcps,
      0,
    );

    const totalErrors = this.events.reduce((sum, e) => sum + e.errorCount, 0);
    const totalWarnings = this.events.reduce((sum, e) => sum + e.warningCount, 0);

    // Aggregate errors and warnings
    const errorCodes = new Map<string, number>();
    const warningCodes = new Map<string, number>();

    for (const event of this.events) {
      // Note: In a real implementation, we'd parse error codes from the result
      // For now, we use generic categorization
      if (event.errorCount > 0) {
        const code = "GENERIC_ERROR";
        errorCodes.set(code, (errorCodes.get(code) ?? 0) + event.errorCount);
      }
      if (event.warningCount > 0) {
        const code = "GENERIC_WARNING";
        warningCodes.set(code, (warningCodes.get(code) ?? 0) + event.warningCount);
      }
    }

    return {
      totalImports: this.events.length,
      successfulImports: successful.length,
      failedImports: failed.length,
      successRate: (successful.length / this.events.length) * 100,
      averageDuration: totalDuration / this.events.length,
      totalComponents,
      averageComponentsPerImport: totalComponents / this.events.length,
      errorRate: (totalErrors / (this.events.length + totalErrors)) * 100,
      topErrors: Array.from(errorCodes.entries())
        .map(([code, count]) => ({ code, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topWarnings: Array.from(warningCodes.entries())
        .map(([code, count]) => ({ code, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 10): ImportEvent[] {
    return this.events.slice(-count).reverse();
  }

  /**
   * Get events for a specific plugin
   */
  getEventsForPlugin(pluginName: string): ImportEvent[] {
    return this.events.filter((e) => e.pluginName === pluginName);
  }

  /**
   * Get events within a time range
   */
  getEventsInRange(startTime: number, endTime: number): ImportEvent[] {
    return this.events.filter((e) => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Export telemetry data
   */
  export(): { events: ImportEvent[]; metrics: TelemetryMetrics; exportedAt: number } {
    return {
      events: [...this.events],
      metrics: this.getMetrics(),
      exportedAt: Date.now(),
    };
  }

  /**
   * Generate telemetry report
   */
  generateReport(): string {
    const metrics = this.getMetrics();

    const lines = [
      "=".repeat(70),
      "Import Telemetry Report",
      "=".repeat(70),
      "",
      `Generated: ${new Date().toISOString()}`,
      `Total Events: ${this.events.length}`,
      "",
      "Summary Metrics:",
      "-".repeat(70),
      `Total Imports: ${metrics.totalImports}`,
      `Successful: ${metrics.successfulImports}`,
      `Failed: ${metrics.failedImports}`,
      `Success Rate: ${metrics.successRate.toFixed(2)}%`,
      "",
      `Average Duration: ${metrics.averageDuration.toFixed(2)}ms`,
      `Total Components: ${metrics.totalComponents}`,
      `Avg Components/Import: ${metrics.averageComponentsPerImport.toFixed(2)}`,
      "",
      `Error Rate: ${metrics.errorRate.toFixed(2)}%`,
      "",
      "Recent Events (last 10):",
      "-".repeat(70),
    ];

    const recent = this.getRecentEvents(10);
    for (const event of recent) {
      const status = event.success ? "✓" : "✗";
      const date = new Date(event.timestamp).toLocaleString();
      lines.push(`${status} ${date} - ${event.pluginName} (${event.duration}ms)`);
    }

    lines.push("", "=".repeat(70));

    return lines.join("\n");
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private anonymizePath(path: string): string {
    // Remove user-specific parts of paths
    return path.replace(/\/Users\/[^/]+/, "/Users/<user>").replace(/\/home\/[^/]+/, "/home/<user>");
  }
}

// Singleton instance
let globalTelemetry: ImportTelemetry | null = null;

/**
 * Get or create the global telemetry instance
 */
export function getImportTelemetry(config?: Partial<TelemetryConfig>): ImportTelemetry {
  if (!globalTelemetry) {
    globalTelemetry = new ImportTelemetry(config);
  }
  return globalTelemetry;
}

/**
 * Reset the global telemetry instance
 */
export function resetImportTelemetry(): void {
  globalTelemetry = null;
}
