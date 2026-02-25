export const PITCH_TYPES = {
    fastball: {
        id: 'fastball',
        name: '4-Seam Fastball',
        shortName: 'FB',
        key: 'Digit1',
        baseSpeed: 95,
        movement: { x: 0, y: 2 },
        difficulty: 0.8,
        description: 'Fast and straight',
        color: '#FF4444',
    },
    sinker: {
        id: 'sinker',
        name: '2-Seam Sinker',
        shortName: 'SI',
        key: 'Digit2',
        baseSpeed: 92,
        movement: { x: 4, y: -6 },
        difficulty: 0.9,
        description: 'Heavy sink, arm-side run',
        color: '#FF8844',
    },
    curveball: {
        id: 'curveball',
        name: 'Curveball',
        shortName: 'CB',
        key: 'Digit3',
        baseSpeed: 80,
        movement: { x: -3, y: -12 },
        difficulty: 1.2,
        description: '12-6 drop',
        color: '#44AAFF',
    },
    slider: {
        id: 'slider',
        name: 'Slider',
        shortName: 'SL',
        key: 'Digit4',
        baseSpeed: 85,
        movement: { x: -8, y: -4 },
        difficulty: 1.1,
        description: 'Sharp lateral break',
        color: '#44FF88',
    },
    changeup: {
        id: 'changeup',
        name: 'Changeup',
        shortName: 'CH',
        key: 'Digit5',
        baseSpeed: 82,
        movement: { x: 5, y: -8 },
        difficulty: 1.0,
        description: 'Speed change with fade',
        color: '#FFFF44',
    },
    cutter: {
        id: 'cutter',
        name: 'Cutter',
        shortName: 'CUT',
        key: 'Digit6',
        baseSpeed: 90,
        movement: { x: -4, y: -2 },
        difficulty: 1.0,
        description: 'Late cutting action',
        color: '#FF44FF',
    },
};

// Get available pitches for a pitcher (based on star rating)
export function getPitcherRepertoire(pitcher) {
    const pitches = ['fastball']; // everyone has a fastball

    if (pitcher.stars >= 2 || pitcher.stats.pitchBreak > 60) {
        pitches.push('changeup');
    }
    if (pitcher.stars >= 2 || pitcher.stats.pitchBreak > 65) {
        pitches.push('slider');
    }
    if (pitcher.stars >= 3 || pitcher.stats.pitchBreak > 70) {
        pitches.push('curveball');
    }
    if (pitcher.stars >= 3 || pitcher.stats.pitchSpeed > 85) {
        pitches.push('sinker');
    }
    if (pitcher.stars >= 4 || pitcher.stats.pitchControl > 85) {
        pitches.push('cutter');
    }

    return pitches;
}
