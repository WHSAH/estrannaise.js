import {
    refresh,
    addTDERow,
    deleteAllRows,
    setDaysAsIntervals,
    setDaysAsAbsolute,
    turnMenstrualCycleOn,
    turnMenstrualCycleOff,
  } from './core.js';

/**
 * Apply default, so the page can show an example of use and data
 */
export function initializeDefaultPreset() {
    addTDERow('multidose-table',  0, 4, 'EV im');
    addTDERow('multidose-table', 20, 4, 'EEn im');
    addTDERow('multidose-table', 40, 0.1, 'patch ow');

    // EEn and EC steady state
    addTDERow('steadystate-table', 7, 4, 'EEn im');
    addTDERow('steadystate-table', 10, 4, 'EC im', false, true);
}

/**
 * Define a set of preset configurations
 *
 * TODO: Remove DOM manipulation
 */
export function attachPresetsDropdown() {
    let presetDropdown = document.getElementById('dropdown-presets');

    presetDropdown.addEventListener('change', () => {
        // TODO: Consider harm redux here, are "speedrun" examples appropriate?
        switch(this.value) {
            case 'een-monotherapy-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 4, 'EEn im', true, false);
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                refresh();
                break;
            case 'een-monotherapy-10':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 10, 6, 'EEn im', true, false);
                addTDERow('multidose-table', 10, 6, 'EEn im');
                addTDERow('multidose-table', 10, 6, 'EEn im');
                addTDERow('multidose-table', 10, 6, 'EEn im');
                addTDERow('multidose-table', 10, 6, 'EEn im');
                addTDERow('multidose-table', 10, 6, 'EEn im');
                addTDERow('multidose-table', 10, 6, 'EEn im');
                addTDERow('multidose-table', 10, 6, 'EEn im');
                addTDERow('multidose-table', 10, 6, 'EEn im');
                refresh();
                break;
            case 'ev-monotherapy-4':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 4, 3, 'EV im', true, false);
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                refresh();
                break;
            case 'ec-monotherapy-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 5, 'EC im', true, false);
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                refresh();
                break;
            case 'ester-monotherapies':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 4, 3, 'EV im', true, false);
                addTDERow('steadystate-table', 7, 4, 'EEn im', true, false);
                addTDERow('steadystate-table', 10, 6, 'EEn im', true, false);
                addTDERow('steadystate-table', 7, 5, 'EC im', true, false);
                addTDERow('steadystate-table', 14, 15, 'EUn im', true, false);
                addTDERow('steadystate-table', 30, 40, 'EUn casubq', true, false);
                addTDERow('multidose-table');
                refresh();
                break;
            case 'ev34-to-een47-monotherapy':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                refresh();
                break;
            case 'eun-monotherapy-30':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 30, 40, 'EUn casubq', true, false);
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                refresh();
                break;
            case 'eun-monotherapy-14':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 14, 15, 'EUn im', true, false);
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                addTDERow('multidose-table', 14, 15, 'EUn im');
                refresh();
                break;
            case 'patch-monotherapy':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 3.5, 0.4, 'patch tw', true, true);
                addTDERow('steadystate-table', 7, 0.3, 'patch ow', true, true);
                addTDERow('multidose-table');
                refresh();
                break;
            case 'mimic-menstrual-cycle':
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                addTDERow('steadystate-table');
                setDaysAsAbsolute(false);
                turnMenstrualCycleOn();
                addTDERow('multidose-table', 13.5, 1, 'EB im');
                addTDERow('multidose-table',   16, 4, 'EEn im');
                addTDERow('multidose-table', 41.5, 1, 'EB im');
                addTDERow('multidose-table',   44, 4, 'EEn im');
                addTDERow('multidose-table', 69.5, 1, 'EB im');
                addTDERow('multidose-table',   72, 4, 'EEn im');
                refresh();
                break;
            case 'missed-een-dose-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 4, 'EEn im', true, false);
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 14, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                refresh();
                break;
            case 'missed-ev-dose-4':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 4, 3, 'EV im', true, false);
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 8, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                refresh();
                break;
            case 'correct-missed-een-dose-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 4, 'EEn im', true, false);
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 14, 6, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                refresh();
                break;
            case 'correct-missed-ev-dose-4':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 4, 3, 'EV im', true, false);
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 8, 4, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                refresh();
                break;
            case 'preemptcorrect-missed-een-dose-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 4, 'EEn im', true, false);
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 9, 'EEn im');
                addTDERow('multidose-table', 14, 5, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                refresh();
            case 'preemptcorrect-missed-ev-dose-4':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 4, 3, 'EV im', true, false);
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 6, 'EV im');
                addTDERow('multidose-table', 8, 4, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                refresh();
                break;
            case 'een-monotherapy-speedrun-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 4, 'EEn im', true, false);
                addTDERow('multidose-table', 7, 8, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                refresh();
                break;
            case 'ev-monotherapy-speedrun-4':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 4, 3, 'EV im', true, false);
                addTDERow('multidose-table', 4, 6, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                refresh();
                break;
            case 'ec-monotherapy-speedrun-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 5, 'EC im', true, false);
                addTDERow('multidose-table', 7, 8, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                addTDERow('multidose-table', 7, 5, 'EC im');
                refresh();
                break;
            case 'ev34-to-een47-speedrun':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 3, 'EV im');
                addTDERow('multidose-table', 4, 7, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                addTDERow('multidose-table', 7, 4, 'EEn im');
                refresh();
                break;
            case 'eun-monotherapy-speedrun-30':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 30, 40, 'EUn casubq', true, false);
                addTDERow('multidose-table', 30, 100, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                addTDERow('multidose-table', 30, 40, 'EUn casubq');
                refresh();
                break;
            case 'silly-wpath8-14':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 14, 30, 'EV im', true, true);
                addTDERow('multidose-table');
                refresh();
                break;
            case 'very-silly-wpath8-14':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 14, 5, 'EV im', true, true);
                addTDERow('multidose-table');
                refresh();
                break;
            case 'silly-wpath8-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 10, 'EC im', true, true);
                addTDERow('multidose-table');
                refresh();
                break;
            case 'very-silly-wpath8-7':
                turnMenstrualCycleOff();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table', 7, 2, 'EC im', true, true);
                addTDERow('multidose-table');
                refresh();
                break;
            case 'peak-performance':
                turnMenstrualCycleOn();
                deleteAllRows('multidose-table');
                deleteAllRows('steadystate-table');
                setDaysAsIntervals(false);
                addTDERow('steadystate-table');
                addTDERow('multidose-table', 0.0, 0.145, 'EB im');
                addTDERow('multidose-table', 0.667, 0.022, 'EB im');
                addTDERow('multidose-table', 0.333, 0.021, 'EB im');
                addTDERow('multidose-table', 0.333, 0.019, 'EB im');
                addTDERow('multidose-table', 0.333, 0.018, 'EB im');
                addTDERow('multidose-table', 0.333, 0.016, 'EB im');
                addTDERow('multidose-table', 0.333, 0.019, 'EB im');
                addTDERow('multidose-table', 0.333, 0.018, 'EB im');
                addTDERow('multidose-table', 0.333, 0.017, 'EB im');
                addTDERow('multidose-table', 0.333, 0.023, 'EB im');
                addTDERow('multidose-table', 0.333, 0.017, 'EB im');
                addTDERow('multidose-table', 0.333, 0.026, 'EB im');
                addTDERow('multidose-table', 0.333, 0.023, 'EB im');
                addTDERow('multidose-table', 0.333, 0.026, 'EB im');
                addTDERow('multidose-table', 0.333, 0.025, 'EB im');
                addTDERow('multidose-table', 0.333, 0.026, 'EB im');
                addTDERow('multidose-table', 0.333, 0.022, 'EB im');
                addTDERow('multidose-table', 0.333, 0.025, 'EB im');
                addTDERow('multidose-table', 0.333, 0.025, 'EB im');
                addTDERow('multidose-table', 0.333, 0.028, 'EB im');
                addTDERow('multidose-table', 0.333, 0.032, 'EB im');
                addTDERow('multidose-table', 0.333, 0.037, 'EB im');
                addTDERow('multidose-table', 0.333, 0.036, 'EB im');
                addTDERow('multidose-table', 0.333, 0.034, 'EB im');
                addTDERow('multidose-table', 0.333, 0.037, 'EB im');
                addTDERow('multidose-table', 0.333, 0.035, 'EB im');
                addTDERow('multidose-table', 0.333, 0.039, 'EB im');
                addTDERow('multidose-table', 0.333, 0.047, 'EB im');
                addTDERow('multidose-table', 0.333, 0.053, 'EB im');
                addTDERow('multidose-table', 0.333, 0.062, 'EB im');
                addTDERow('multidose-table', 0.333, 0.069, 'EB im');
                addTDERow('multidose-table', 0.333, 0.082, 'EB im');
                addTDERow('multidose-table', 0.333, 0.082, 'EB im');
                addTDERow('multidose-table', 0.333, 0.101, 'EB im');
                addTDERow('multidose-table', 0.333, 0.092, 'EB im');
                addTDERow('multidose-table', 0.333, 0.108, 'EB im');
                addTDERow('multidose-table', 0.333, 0.101, 'EB im');
                addTDERow('multidose-table', 0.333, 0.165, 'EB im');
                addTDERow('multidose-table', 0.333, 0.18, 'EB im');
                addTDERow('multidose-table', 0.333, 0.215, 'EB im');
                addTDERow('multidose-table', 0.333, 0.176, 'EB im');
                addTDERow('multidose-table', 0.333, 0.123, 'EB im');
                addTDERow('multidose-table', 0.333, 0.034, 'EB im');
                addTDERow('multidose-table', 2.0, 0.014, 'EB im');
                addTDERow('multidose-table', 0.333, 0.053, 'EB im');
                addTDERow('multidose-table', 0.333, 0.046, 'EB im');
                addTDERow('multidose-table', 0.333, 0.063, 'EB im');
                addTDERow('multidose-table', 0.333, 0.061, 'EB im');
                addTDERow('multidose-table', 0.333, 0.074, 'EB im');
                addTDERow('multidose-table', 0.333, 0.071, 'EB im');
                addTDERow('multidose-table', 0.333, 0.079, 'EB im');
                addTDERow('multidose-table', 0.333, 0.075, 'EB im');
                addTDERow('multidose-table', 0.333, 0.077, 'EB im');
                addTDERow('multidose-table', 0.333, 0.07, 'EB im');
                addTDERow('multidose-table', 0.333, 0.079, 'EB im');
                addTDERow('multidose-table', 0.333, 0.073, 'EB im');
                addTDERow('multidose-table', 0.333, 0.083, 'EB im');
                addTDERow('multidose-table', 0.333, 0.095, 'EB im');
                addTDERow('multidose-table', 0.333, 0.1, 'EB im');
                addTDERow('multidose-table', 0.333, 0.089, 'EB im');
                addTDERow('multidose-table', 0.333, 0.074, 'EB im');
                addTDERow('multidose-table', 0.333, 0.053, 'EB im');
                addTDERow('multidose-table', 0.333, 0.064, 'EB im');
                addTDERow('multidose-table', 0.333, 0.064, 'EB im');
                addTDERow('multidose-table', 0.333, 0.08, 'EB im');
                addTDERow('multidose-table', 0.333, 0.082, 'EB im');
                addTDERow('multidose-table', 0.333, 0.087, 'EB im');
                addTDERow('multidose-table', 0.333, 0.078, 'EB im');
                addTDERow('multidose-table', 0.333, 0.061, 'EB im');
                addTDERow('multidose-table', 0.333, 0.034, 'EB im');
                addTDERow('multidose-table', 0.333, 0.016, 'EB im');
                addTDERow('multidose-table', 0.333, 0.023, 'EB im');
                addTDERow('multidose-table', 0.333, 0.034, 'EB im');
                addTDERow('multidose-table', 0.333, 0.053, 'EB im');
                addTDERow('multidose-table', 0.333, 0.045, 'EB im');
                addTDERow('multidose-table', 0.333, 0.016, 'EB im');
                refresh();
                break;
            default:
                break;
        }

    });

}
