// Browser polyfills for Node.js globals required by Web3 libraries
// This file should be imported at the top of the root layout

if (typeof window !== "undefined") {
  // Polyfill global object for libraries expecting Node.js environment
  if (typeof (window as any).global === "undefined") {
    ;(window as any).global = window
  }

  // Polyfill process.env for libraries that check environment
  if (typeof (window as any).process === "undefined") {
    ;(window as any).process = {
      env: {},
      browser: true,
      version: "",
      versions: {},
      nextTick: (fn: Function) => setTimeout(fn, 0),
    }
  }

  // Ensure Buffer is available globally if needed
  if (typeof (window as any).Buffer === "undefined") {
    try {
      const { Buffer } = require("buffer")
      ;(window as any).Buffer = Buffer
    } catch (e) {
      // Buffer polyfill not available, skip
    }
  }
}

export {}
