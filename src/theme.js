export const themes = {
    lightss: {
        name: 'Jasny SS',
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
            ['navHover', '#111']
        ]
    },

    darkss: {
        name: 'Ciemny SS',
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
            ['increase', '#42b129']
        ]
    },

    drakonno: {
        name: 'Drakonno',
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
            ['increase', '#42b129']
        ]
    },

    sombra: {
        name: 'Sombra',
        def: [
            ['background', '#000'],
            ['foreground', '#090909'],
            ['textColor', '#888'],
            ['ppColour', '#8992e8'],
            ['alternate', '#aaa'],
            ['selected', '#222'],
            ['hover', '#333'],
            ['highlight', '#222'],
            ['decrease', '#f94022'],
            ['increase', '#42b129']
        ]
    },
}

export const setTheme = name => (themes[name] ? themes[name] : 'darkss').def.map(s => document.documentElement.style.setProperty('--' + s[0], s[1]))
export const setSsDefaultTheme = () => setTheme(getComputedStyle(document.documentElement).getPropertyValue('--foreground').length ? 'darkss' : 'lightss')