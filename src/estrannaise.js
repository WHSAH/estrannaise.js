import {
  addTDERow,
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
} from './core.js';
import { attachPresetsDropdown, initializeDefaultPreset } from './presets.js';

window.addEventListener('DOMContentLoaded', () => {

    initializeDefaultPreset();

    attachDragNDropImport();

    attachOptionsEvents();

    attachPresetsDropdown();

    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();

    menstrualCycleButtonAttachOnOff();

    themeSetup();

    attachTipJarEvent();

    if (!loadFromURL()) {
        loadFromLocalStorage();
    }

    refresh();
});
