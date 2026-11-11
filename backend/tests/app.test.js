// backend/tests/app.test.js
const { test, describe } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const app = require("../src/app");

/**
 * Helper to dispatch in-memory HTTP requests to an Express application
 * without requiring TCP network sockets (zero port conflicts, sandbox safe).
 */
function request(app, { method = "GET", url = "/", headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const req = new http.IncomingMessage();
    req.method = method;
    req.url = url;
    req.headers = { host: "localhost", ...headers };

    const res = new http.ServerResponse(req);
    res.assignSocket({
      _writableState: {},
      on: () => {},
      once: () => {},
      emit: () => {},
      write: () => {},
      end: () => {},
    });

    let resBody = "";
    res.write = (chunk) => {
      if (chunk) resBody += chunk;
      return true;
    };

    res.end = (chunk) => {
      if (chunk) resBody += chunk;
      
      const contentType = res.getHeader("content-type") || "";
      let json = null;
      if (typeof contentType === "string" && contentType.includes("application/json")) {
        try {
          json = JSON.parse(resBody);
        } catch (_) {}
      }

      resolve({
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: resBody,
        json,
      });
    };

    try {
      app.handle(req, res);
    } catch (err) {
      reject(err);
    }
  });
}

describe("Backend Application & DevOps Health Probes", () => {
  test("GET / should return 200 with running message", async () => {
    const res = await request(app, { method: "GET", url: "/" });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.json);
    assert.strictEqual(res.json.message, "Dermaslot API is running");
  });

  test("GET /healthz (Kubernetes Liveness Probe) should return 200 with healthy status", async () => {
    const res = await request(app, { method: "GET", url: "/healthz" });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.json);
    assert.strictEqual(res.json.status, "healthy");
    assert.ok(typeof res.json.uptime === "number");
    assert.ok(res.json.timestamp);
  });

  test("GET /api/health (Readiness Probe) should return valid health status", async () => {
    const res = await request(app, { method: "GET", url: "/api/health" });
    assert.ok([200, 503].includes(res.statusCode));
    assert.ok(res.json);
    assert.ok(["ok", "unavailable"].includes(res.json.status));
    assert.ok(["connected", "disconnected"].includes(res.json.database));
  });
});
