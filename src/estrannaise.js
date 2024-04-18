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
} from './core';
import { attachPresetsDropdown } from './presets';

export function initializeApp() {
    // Add default curves
    // mentrual cycle mimic
    addTDERow('multidose-table',  0, 4, 'EV im');
    addTDERow('multidose-table', 20, 4, 'EEn im');
    addTDERow('multidose-table', 40, 0.1, 'patch ow');

    // EEn steady state
    addTDERow('steadystate-table', 7, 4, 'EEn im');
    addTDERow('steadystate-table', 10, 4, 'EC im', false, true);

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
};
