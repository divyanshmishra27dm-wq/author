/**
 * SCORM 2004 (2nd/3rd/4th Edition) API_1484_11 Wrapper with Graceful Local Fallback
 */
const SCORM2004 = (function () {
  let api = null;
  let initialized = false;
  let terminated = false;
  const LOCAL_KEY = 'hdfc_academy_bse_day2_scorm2004_v2';

  function findAPI(win) {
    let attempts = 0;
    while (win && !win.API_1484_11 && win.parent && win.parent !== win && attempts < 15) {
      attempts++;
      win = win.parent;
    }
    return win && win.API_1484_11 ? win.API_1484_11 : null;
  }

  function getAPI() {
    if (api) return api;
    api = findAPI(window);
    if (!api && window.opener) {
      api = findAPI(window.opener);
    }
    return api;
  }

  function init() {
    if (initialized) return true;
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
    return initialized;
  }

  function getValue(param) {
    const handle = getAPI();
    if (handle && initialized && !terminated) {
      return handle.GetValue(param) || '';
    }
    try {
      const store = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
      return store[param] || '';
    } catch (e) {
      return '';
    }
  }

  function setValue(param, val) {
    const strVal = String(val);
    const handle = getAPI();
    if (handle && initialized && !terminated) {
      return handle.SetValue(param, strVal) === 'true';
    }
    try {
      const store = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
      store[param] = strVal;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      return false;
    }
  }

  function commit() {
    const handle = getAPI();
    if (handle && initialized && !terminated) {
      return handle.Commit('') === 'true';
    }
    return true;
  }

  function finish() {
    if (terminated) return true;
    commit();
    const handle = getAPI();
    if (handle && initialized) {
      const res = handle.Terminate('');
      terminated = (res === 'true' || res === true);
      return terminated;
    }
    terminated = true;
    return true;
  }

  function saveState(stateObj) {
    setValue('cmi.suspend_data', JSON.stringify(stateObj));
    if (stateObj.currentChapter !== undefined) {
      setValue('cmi.location', String(stateObj.currentChapter));
    }
    if (typeof stateObj.progressMeasure === 'number') {
      setValue('cmi.progress_measure', stateObj.progressMeasure.toFixed(2));
    }
    if (typeof stateObj.scoreScaled === 'number') {
      setValue('cmi.score.scaled', stateObj.scoreScaled.toFixed(2));
      setValue('cmi.score.raw', String(Math.round(stateObj.scoreScaled * 100)));
      setValue('cmi.score.min', '0');
      setValue('cmi.score.max', '100');
    }
    if (stateObj.completed) {
      setValue('cmi.completion_status', 'completed');
      setValue('cmi.success_status', stateObj.scoreScaled >= 0.6 ? 'passed' : 'completed');
      setValue('cmi.exit', 'normal');
    }
    commit();
  }

  function loadState() {
    const raw = getValue('cmi.suspend_data');
    if (!raw) return null;
    try {
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