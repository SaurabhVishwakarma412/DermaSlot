// backend/src/utils/metrics.js
// Zero-dependency Prometheus metrics collector

const requestCounts = new Map();
const requestDurations = new Map();

/**
 * Record an HTTP request metric
 * @param {string} method HTTP method (GET, POST, etc.)
 * @param {string} route Path or route pattern
 * @param {number} status HTTP status code
 * @param {number} durationMs Request duration in milliseconds
 */
function recordRequest(method, route, status, durationMs) {
  const sanitizedRoute = (route || "unknown").replace(/[/\\?#].*$/, (match) => match);
  const key = `method="${method}",route="${sanitizedRoute}",status="${status}"`;

  requestCounts.set(key, (requestCounts.get(key) || 0) + 1);
  requestDurations.set(key, (requestDurations.get(key) || 0) + durationMs);
}

/**
 * Generate Prometheus 0.0.4 text format metrics
 * @param {object} options
 * @param {boolean} options.databaseConnected Whether MongoDB is connected
 * @returns {string} Prometheus formatted metrics string
 */
function getMetrics({ databaseConnected = false } = {}) {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  const uptime = process.uptime();

  const lines = [
    "# HELP process_uptime_seconds The process uptime in seconds.",
    "# TYPE process_uptime_seconds gauge",
    `process_uptime_seconds ${uptime.toFixed(3)}`,
    "",
    "# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.",
    "# TYPE process_cpu_user_seconds_total counter",
    `process_cpu_user_seconds_total ${(cpu.user / 1e6).toFixed(3)}`,
    "",
    "# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.",
    "# TYPE process_cpu_system_seconds_total counter",
    `process_cpu_system_seconds_total ${(cpu.system / 1e6).toFixed(3)}`,
    "",
    "# HELP nodejs_memory_heap_used_bytes Process heap memory used in bytes.",
    "# TYPE nodejs_memory_heap_used_bytes gauge",
    `nodejs_memory_heap_used_bytes ${memory.heapUsed}`,
    "",
    "# HELP nodejs_memory_heap_total_bytes Process total heap memory in bytes.",
    "# TYPE nodejs_memory_heap_total_bytes gauge",
    `nodejs_memory_heap_total_bytes ${memory.heapTotal}`,
    "",
    "# HELP nodejs_memory_rss_bytes Process resident set size in bytes.",
    "# TYPE nodejs_memory_rss_bytes gauge",
    `nodejs_memory_rss_bytes ${memory.rss}`,
    "",
    "# HELP pedoderma_db_connection_status Database connection status (1 = connected, 0 = disconnected).",
    "# TYPE pedoderma_db_connection_status gauge",
    `pedoderma_db_connection_status ${databaseConnected ? 1 : 0}`,
    "",
    "# HELP pedoderma_http_requests_total Total number of HTTP requests processed.",
    "# TYPE pedoderma_http_requests_total counter"
  ];

  if (requestCounts.size === 0) {
    lines.push('pedoderma_http_requests_total{method="none",route="none",status="200"} 0');
  } else {
    for (const [labels, count] of requestCounts.entries()) {
      lines.push(`pedoderma_http_requests_total{${labels}} ${count}`);
    }
  }

  lines.push("");
  lines.push("# HELP pedoderma_http_request_duration_ms_total Total duration in milliseconds for HTTP requests.");
  lines.push("# TYPE pedoderma_http_request_duration_ms_total counter");

  if (requestDurations.size === 0) {
    lines.push('pedoderma_http_request_duration_ms_total{method="none",route="none",status="200"} 0');
  } else {
    for (const [labels, duration] of requestDurations.entries()) {
      lines.push(`pedoderma_http_request_duration_ms_total{${labels}} ${duration.toFixed(2)}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

module.exports = {
  recordRequest,
  getMetrics,
};

