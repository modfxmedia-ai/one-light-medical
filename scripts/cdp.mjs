/**
 * Minimal zero-dependency Chrome DevTools Protocol client.
 *
 * Node 22+ ships a global WebSocket, so driving Chrome directly is cheaper than
 * pulling in Puppeteer just to take screenshots and read element boxes.
 */

import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch() {
  const port = 9000 + Math.floor(Math.random() * 900);
  const chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "cdp-"))}`,
    "about:blank",
  ]);
  chrome.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
    } catch {
      /* still booting */
    }
    if (!wsUrl) await sleep(250);
  }
  if (!wsUrl) throw new Error("chrome devtools endpoint never came up");

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let seq = 0;
  const pending = new Map();
  const listeners = new Map();

  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      listeners.get(msg.method)?.forEach((fn) => fn(msg.params));
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = (seq += 1);
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const once = (method) =>
    new Promise((resolve) => {
      const list = listeners.get(method) ?? [];
      list.push(resolve);
      listeners.set(method, list);
    });

  return {
    send,
    once,
    async open(url, { width = 1440, height = 765, scale = 1, settle = 2200 } = {}) {
      await send("Page.enable");
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: scale,
        mobile: false,
      });
      const loaded = once("Page.loadEventFired");
      await send("Page.navigate", { url });
      await loaded;
      await sleep(settle);
    },
    async close() {
      await send("Browser.close").catch(() => {});
      ws.close();
      chrome.kill();
    },
  };
}
