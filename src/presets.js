/**
 * Each preset should have the following keys set:
 *
 * * `menstrualCycle` - Show menstrual cycle overlay or not
 * * `intervalDays` - When true, show days as interval, or false as absolute
 * * `steady` - array of array for each steady-state dose
 * * `multi` - array of array for each multi-dose
 */
export const Presets = {

    // To display first when loading the page
    'default': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 4, 'EEn im'],
            [10, 4, 'EC im', false, true]
        ],
        'multi': [
            [0, 4, 'EV im'],
            [20, 4, 'EEn im'],
            [40, 0.1, 'patch ow']
        ]
    },
    'een-monotherapy-7': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 4, 'EEn im', true, false]
        ],
        'multi': [
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
        ]
    },
    'een-monotherapy-10': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [10, 6, 'EEn im', true, false]
        ],
        'multi': [
            [10, 6, 'EEn im'],
            [10, 6, 'EEn im'],
            [10, 6, 'EEn im'],
            [10, 6, 'EEn im'],
            [10, 6, 'EEn im'],
            [10, 6, 'EEn im'],
            [10, 6, 'EEn im'],
            [10, 6, 'EEn im'],
        ]
    },
    'ev-monotherapy-4': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 3, 'EV im', true, false]
        ],
        'multi': [
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
        ]
    },
    'ec-monotherapy-7': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 5, 'EC im', true, false]
        ],
        'multi': [
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
        ]
    },
    'ester-monotherapies': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 3, 'EV im', true, false],
            [7, 4, 'EEn im', true, false],
            [10, 6, 'EEn im', true, false],
            [7, 5, 'EC im', true, false],
            [14, 15, 'EUn im', true, false],
            [30, 40, 'EUn casubq', true, false]
        ],
        'multi': []
    },
    'ev34-to-een47-monotherapy': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [],
        'multi': [
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
        ]
    },
    'eun-monotherapy-30': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [30, 40, 'EUn casubq', true, false]
        ],
        'multi': [
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq']
        ]
    },
    'eun-monotherapy-14': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [14, 15, 'EUn im', true, false]
        ],
        'multi': [
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
            [14, 15, 'EUn im'],
        ]
    },
    'patch-monotherapy': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [3.5, 0.4, 'patch tw', true, true],
            [7, 0.3, 'patch ow', true, true]
        ],
        'multi': []
    },
    'mimic-menstrual-cycle': {
        'menstrualCycle': true,
        'intervalDays': false,
        'steady': [],
        'multi': [
            [13.5, 1, 'EB im'],
            [16, 4, 'EEn im'],
            [41.5, 1, 'EB im'],
            [44, 4, 'EEn im'],
            [69.5, 1, 'EB im'],
            [72, 4, 'EEn im'],
        ]
    },
    'missed-een-dose-7': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 4, 'EEn im', true, false]
        ],
        'multi': [
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [14, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
        ]
    },
    'missed-ev-dose-4': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 3, 'EV im', true, false]
        ],
        'multi': [
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [8, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
        ]
    },
    'correct-missed-een-dose-7': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 4, 'EEn im', true, false]
        ],
        'multi': [
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [14, 6, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
        ]
    },
    'correct-missed-ev-dose-4': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 3, 'EV im', true, false]
        ],
        'multi': [
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [8, 4, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
        ]
        },
    'preemptcorrect-missed-een-dose-7': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 4, 'EEn im', true, false]
        ],
        'multi': [
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 9, 'EEn im'],
            [14, 5, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
        ]
    },
    'preemptcorrect-missed-ev-dose-4': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 3, 'EV im', true, false]
        ],
        'multi': [
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 6, 'EV im'],
            [8, 4, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
        ]
    },
    'een-monotherapy-loadingdose': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 4, 'EEn im', true, false]
        ],
        'multi': [
            [7, 8, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
        ]
    },
    'ev-monotherapy-loadingdose': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 3, 'EV im', true, false]
        ],
        'multi': [
            [4, 6, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
        ]
    },
    'ec-monotherapy-loadingdose': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 5, 'EC im', true, false]
        ],
        'multi': [
            [7, 8, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
            [7, 5, 'EC im'],
        ]
    },
    'ev-to-een-loadingdose': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [],
        'multi': [
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 3, 'EV im'],
            [4, 7, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
            [7, 4, 'EEn im'],
        ]
    },
    'eun-monotherapy-loadingdose': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [30, 40, 'EUn casubq', true, false]
        ],
        'multi': [
            [30, 100, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq'],
            [30, 40, 'EUn casubq']
        ]
    },
    'wpath-toomuch-toospaced': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [14, 30, 'EV im', true, true],
            [14, 30, 'EC im', true, true]
        ],
        'multi': []
    },
    'wpath-toolittle-toospaced': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [14, 5, 'EV im', true, true],
            [14, 5, 'EC im', true, true]
        ],
        'multi': []
    },
    'wpath-toomuch': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 10, 'EV im', true, true],
            [7, 10, 'EC im', true, true]
        ],
        'multi': []
    },
    'wpath-toolittle': {
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [7, 2, 'EV im', true, true],
            [7, 2, 'EC im', true, true]
        ],
        'multi': []
    },
    'peak-performance': {
        'menstrualCycle': true,
        'intervalDays': true,
        'steady': [],
        'multi': [
            [0.0, 0.145, 'EB im'],
            [0.667, 0.022, 'EB im'],
            [0.333, 0.021, 'EB im'],
            [0.333, 0.019, 'EB im'],
            [0.333, 0.018, 'EB im'],
            [0.333, 0.016, 'EB im'],
            [0.333, 0.019, 'EB im'],
            [0.333, 0.018, 'EB im'],
            [0.333, 0.017, 'EB im'],
            [0.333, 0.023, 'EB im'],
            [0.333, 0.017, 'EB im'],
            [0.333, 0.026, 'EB im'],
            [0.333, 0.023, 'EB im'],
            [0.333, 0.026, 'EB im'],
            [0.333, 0.025, 'EB im'],
            [0.333, 0.026, 'EB im'],
            [0.333, 0.022, 'EB im'],
            [0.333, 0.025, 'EB im'],
            [0.333, 0.025, 'EB im'],
            [0.333, 0.028, 'EB im'],
            [0.333, 0.032, 'EB im'],
            [0.333, 0.037, 'EB im'],
            [0.333, 0.036, 'EB im'],
            [0.333, 0.034, 'EB im'],
            [0.333, 0.037, 'EB im'],
            [0.333, 0.035, 'EB im'],
            [0.333, 0.039, 'EB im'],
            [0.333, 0.047, 'EB im'],
            [0.333, 0.053, 'EB im'],
            [0.333, 0.062, 'EB im'],
            [0.333, 0.069, 'EB im'],
            [0.333, 0.082, 'EB im'],
            [0.333, 0.082, 'EB im'],
            [0.333, 0.101, 'EB im'],
            [0.333, 0.092, 'EB im'],
            [0.333, 0.108, 'EB im'],
            [0.333, 0.101, 'EB im'],
            [0.333, 0.165, 'EB im'],
            [0.333, 0.18, 'EB im'],
            [0.333, 0.215, 'EB im'],
            [0.333, 0.176, 'EB im'],
            [0.333, 0.123, 'EB im'],
            [0.333, 0.034, 'EB im'],
            [2.0, 0.014, 'EB im'],
            [0.333, 0.053, 'EB im'],
            [0.333, 0.046, 'EB im'],
            [0.333, 0.063, 'EB im'],
            [0.333, 0.061, 'EB im'],
            [0.333, 0.074, 'EB im'],
            [0.333, 0.071, 'EB im'],
            [0.333, 0.079, 'EB im'],
            [0.333, 0.075, 'EB im'],
            [0.333, 0.077, 'EB im'],
            [0.333, 0.07, 'EB im'],
            [0.333, 0.079, 'EB im'],
            [0.333, 0.073, 'EB im'],
            [0.333, 0.083, 'EB im'],
            [0.333, 0.095, 'EB im'],
            [0.333, 0.1, 'EB im'],
            [0.333, 0.089, 'EB im'],
            [0.333, 0.074, 'EB im'],
            [0.333, 0.053, 'EB im'],
            [0.333, 0.064, 'EB im'],
            [0.333, 0.064, 'EB im'],
            [0.333, 0.08, 'EB im'],
            [0.333, 0.082, 'EB im'],
            [0.333, 0.087, 'EB im'],
            [0.333, 0.078, 'EB im'],
            [0.333, 0.061, 'EB im'],
            [0.333, 0.034, 'EB im'],
            [0.333, 0.016, 'EB im'],
            [0.333, 0.023, 'EB im'],
            [0.333, 0.034, 'EB im'],
            [0.333, 0.053, 'EB im'],
            [0.333, 0.045, 'EB im'],
            [0.333, 0.016, 'EB im'],
        ]
    }
};
