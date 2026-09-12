/**
 * Embed bridge for Fellowship OS / JGA parent frames.
 * Standalone play works with zero parent.
 *
 * Protocol (postMessage, targetOrigin '*' by default — parent should filter):
 *   Child → Parent:
 *     { source: 'jga-td', type: 'ready', payload: {...} }
 *     { source: 'jga-td', type: 'start', payload: { runId, gefaehrte, siegelrune, riderId } }
 *     { source: 'jga-td', type: 'pause', payload: { paused: true|false } }
 *     { source: 'jga-td', type: 'wave', payload: { wave, score, ruhmRun } }
 *     { source: 'jga-td', type: 'end', payload: { victory, wave, score, ruhmEarned, totalRuhm, rank } }
 *     { source: 'jga-td', type: 'score', payload: { score, ruhmRun, lives, gold } }
 *   Parent → Child:
 *     { source: 'jga-os', type: 'cmd', cmd: 'pause'|'resume'|'start'|'mute'|'unmute'|'getState' }
 */
(function (global) {
  const SOURCE = 'jga-td';
  const PARENT_SOURCE = 'jga-os';
  let handlers = {};
  let lastState = {};

  function emit(type, payload) {
    const msg = { source: SOURCE, type, payload: payload || {}, ts: Date.now() };
    lastState = Object.assign({}, lastState, payload || {}, { lastEvent: type });
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(msg, '*');
      }
    } catch (_) {}
    const cbName = 'on' + type.charAt(0).toUpperCase() + type.slice(1);
    if (typeof handlers[cbName] === 'function') {
      try { handlers[cbName](payload); } catch (_) {}
    }
    if (typeof handlers.onEvent === 'function') {
      try { handlers.onEvent(type, payload); } catch (_) {}
    }
    return msg;
  }

  function onMessage(ev) {
    const data = ev && ev.data;
    if (!data || data.source !== PARENT_SOURCE) return;
    if (data.type !== 'cmd') return;
    const cmd = data.cmd;
    if (typeof handlers.onCommand === 'function') {
      try { handlers.onCommand(cmd, data); } catch (_) {}
    }
  }

  if (typeof global.addEventListener === 'function') {
    global.addEventListener('message', onMessage);
  }

  global.JgaTdBridge = {
    version: '1.0.0',
    emit,
    getState() { return Object.assign({}, lastState); },
    setHandlers(h) { handlers = Object.assign({}, handlers, h || {}); },
    PROTOCOL: {
      childSource: SOURCE,
      parentSource: PARENT_SOURCE,
      events: ['ready', 'start', 'pause', 'wave', 'end', 'score'],
      commands: ['pause', 'resume', 'start', 'mute', 'unmute', 'getState']
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
