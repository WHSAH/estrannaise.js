import {
  attachDragNDropImport,
  attachOptionsEvents,
  attachMultidoseButtonsEvents,
  attachSteadyStateButtonsEvents,
  menstrualCycleButtonAttachOnOff,
  themeSetup,
  attachTipJarEvent,
  loadFromURL,
  loadFromLocalStorage,
  refresh,
  attachPresetsDropdown,
  initializeDefaultPreset
} from './core.js';

window.addEventListener('DOMContentLoaded', () => {

    initializeDefaultPreset();

    attachDragNDropImport();

    attachOptionsEvents();

    attachPresetsDropdown();

    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();

    menstrualCycleButtonAttachOnOff();

    themeSetup();

    // attachTipJarEvent();

    if (!loadFromURL()) {
        loadFromLocalStorage();
    }

    refresh();
});
