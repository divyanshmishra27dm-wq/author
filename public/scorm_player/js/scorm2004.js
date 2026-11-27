/**
 * SCORM 2004 (2nd/3rd/4th Edition) API_1484_11 Wrapper with Robust Offline & Cross-Origin Fallback
 */
var SCORM2004 = (function () {
  let api = null;
  let initialized = false;
  let terminated = false;
  const memoryStore = {};

  function getStorageKey() {
    try {
      if (typeof window !== 'undefined') {
        if (window.COURSE_STORAGE_KEY) return window.COURSE_STORAGE_KEY;
        if (window.COURSE_ID) return 'hdfc_scorm2004_' + window.COURSE_ID;
        const pathKey = (window.location && window.location.pathname)
          ? window.location.pathname.split('/').pop().replace(/[^a-zA-Z0-9_-]/g, '_')
          : 'default';
        return 'hdfc_scorm2004_' + pathKey;
      }
    } catch (e) {}
    return 'hdfc_scorm2004_default_store';
  }

  function findAPI(win) {
    let attempts = 0;
    try {
      while (win && attempts < 15) {
        try {
          if (win.API_1484_11) return win.API_1484_11;
        } catch (secErr) {
          // Cross-origin restriction hit, stop traversing up
          break;
        }
        if (!win.parent || win.parent === win) break;
        attempts++;
        win = win.parent;
      }
    } catch (e) {}
    return null;
  }

  function getAPI() {
    if (api) return api;
    try {
      api = findAPI(window);
      if (!api && window.opener) {
        try {
          api = findAPI(window.opener);
        } catch (openerErr) {}
      }
    } catch (e) {
      api = null;
    }
    return api;
  }

  function init() {
    if (initialized) return true;
    try {
      const handle = getAPI();
      if (handle) {
        const res = handle.Initialize('');
        initialized = (res === 'true' || res === true);
        if (initialized) {
          const status = getValue('cmi.completion_status');
          if (!status || status === 'unknown' || status === 'not attempted') {
            setValue('cmi.completion_status', 'incomplete');
          }
          setValue('cmi.exit', 'suspend');
          commit();
        }
      } else {
        initialized = true; // Standalone / preview mode
      }
    } catch (e) {
      initialized = true;
    }
    return initialized;
  }

  function getValue(param) {
    try {
      const handle = getAPI();
      if (handle && initialized && !terminated) {
        return handle.GetValue(param) || '';
      }
    } catch (e) {}

    try {
      const key = getStorageKey();
      const raw = localStorage.getItem(key);
      const store = raw ? JSON.parse(raw) : memoryStore;
      return store[param] || '';
    } catch (e) {
      return memoryStore[param] || '';
    }
  }

  function setValue(param, val) {
    const strVal = String(val);
    try {
      const handle = getAPI();
      if (handle && initialized && !terminated) {
        return handle.SetValue(param, strVal) === 'true';
      }
    } catch (e) {}

    memoryStore[param] = strVal;
    try {
      const key = getStorageKey();
      const raw = localStorage.getItem(key);
      const store = raw ? JSON.parse(raw) : {};
      store[param] = strVal;
      localStorage.setItem(key, JSON.stringify(store));
      return true;
    } catch (e) {
      return true;
    }
  }

  function commit() {
    try {
      const handle = getAPI();
      if (handle && initialized && !terminated) {
        return handle.Commit('') === 'true';
      }
    } catch (e) {}
    return true;
  }

  function finish() {
    if (terminated) return true;
    commit();
    try {
      const handle = getAPI();
      if (handle && initialized) {
        const res = handle.Terminate('');
        terminated = (res === 'true' || res === true);
        return terminated;
      }
    } catch (e) {}
    terminated = true;
    return true;
  }

  function saveState(stateObj) {
    try {
      setValue('cmi.suspend_data', JSON.stringify(stateObj));
      if (stateObj.currentChapter !== undefined) {
        setValue('cmi.location', String(stateObj.currentChapter));
      }
      if (typeof stateObj.scoreScaled === 'number') {
        setValue('cmi.score.scaled', stateObj.scoreScaled.toFixed(2));
        setValue('cmi.score.raw', String(Math.round(stateObj.scoreScaled * 100)));
        setValue('cmi.score.min', '0');
        setValue('cmi.score.max', '100');
      }
      if (stateObj.completed) {
        setValue('cmi.completion_status', 'completed');
        setValue('cmi.success_status', (stateObj.scoreScaled || 0) >= 0.6 ? 'passed' : 'completed');
        setValue('cmi.progress_measure', '1.00');
        setValue('cmi.exit', 'normal');
      } else {
        setValue('cmi.completion_status', 'incomplete');
        if (typeof stateObj.progressMeasure === 'number') {
          setValue('cmi.progress_measure', stateObj.progressMeasure.toFixed(2));
        }
        setValue('cmi.exit', 'suspend');
      }
      commit();
    } catch (e) {
      console.warn('saveState warning:', e);
    }
  }

  function loadState() {
    try {
      const raw = getValue('cmi.suspend_data');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function isConnected() {
    return !!getAPI();
  }

  return { init, getValue, setValue, commit, finish, saveState, loadState, isConnected };
})();
if (typeof window !== 'undefined') window.SCORM2004 = SCORM2004;