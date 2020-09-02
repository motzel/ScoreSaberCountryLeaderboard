export const themes = {
    darkss: {
        name: 'Jedyny słuszny',
        _key: 'themes.dark',
        def: [
            ['background', '#222'],
            ['foreground', '#252525'],
            ['textColor', '#eee'],
            ['ppColour', '#8992e8'],
            ['alternate', '#72a8ff'],
            ['selected', '#3273dc'],
            ['hover', '#333'],
            ['highlight', '#484848'],
            ['decrease', '#f94022'],
            ['increase', '#42b129'],
            ['faded', '#3e3e3e'],
        ]
    },

    lightss: {
        name: 'Wypalający oczy',
        _key: 'themes.light',
        def: [
            ['background', '#fcfcfc'],
            ['foreground', 'white'],
            ['textColor', '#4a4a4a'],
            ['ppColour', '#6772E5'],
            ['alternate', '#3273dc'],
            ['selected', '#a5d0f5'],
            ['hover', '#eee'],
            ['highlight', '#39f939'],
            ['decrease', '#f94022'],
            ['increase', '#42b129'],
            ['navBg', '#252525'],
            ['navText', '#eee'],
            ['navHover', '#111'],
            ['faded', '#dedede'],
        ]
    },

    drakonno: {
        name: 'Drakonno',
        _key: 'themes.drakonno',
        def: [
            ['background', '#002b36'],
            ['foreground', '#073642'],
            ['textColor', '#839496'],
            ['ppColour', '#6772E5'],
            ['alternate', '#b58900'],
            ['selected', '#002b36'],
            ['hover', '#285661'],
            ['highlight', '#162c31'],
            ['decrease', '#f94022'],
            ['increase', '#42b129'],
            ['faded', '#0a4c5d'],
        ]
    },

    sombra: {
        name: 'Sombra',
        _key: 'themes.sombra',
        def: [
            ['background', '#1f0001'],
            ['foreground', '#2f0042'],
            ['textColor', '#fff'],
            ['ppColour', '#f50004'],
            ['alternate', '#fff'],
            ['selected', '#0f008f'],
            ['hover', '#0f008f'],
            ['highlight', '#0f008f'],
            ['decrease', '#f94022'],
            ['increase', '#42b129'],
            ['faded', '#680092'],
        ]
    },
}

// temporary SSE workaround
const sseVars = [
    ['color-ahead', 'rgb(0, 128, 0)'],
    ['color-behind', 'rgb(128, 0, 0)'],
    ['color-highlight', 'darkgreen']
];

export const setTheme = name => (themes[name] ? themes[name] : 'darkss').def.concat(sseVars).map(s => document.documentElement.style.setProperty('--' + s[0], s[1]))
export const getSsDefaultTheme = () => getComputedStyle(document.documentElement).getPropertyValue('--foreground').length ? 'darkss' : 'lightss';
export const setSsDefaultTheme = () => setTheme(getSsDefaultTheme())