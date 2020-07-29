export const themes = {
    lightss: {
        name: 'Jasny SS',
        def: [
            ['background', '#fcfcfc'],
            ['foreground', 'white'],
            ['textColor', '#4a4a4a'],
            ['ppColour', '#6772E5'],
            ['alternate', '#3273dc'],
            ['hover', '#eee'],
            ['highlight', '#39f939'],
            ['decrease', 'red'],
            ['increase', 'green']
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
            ['hover', '#444'],
            ['highlight', 'green'],
            ['decrease', 'red'],
            ['increase', 'green']
        ]
    }
}

export const setTheme = name => (themes[name] ? themes[name] : 'darkss').def.map(s => document.documentElement.style.setProperty('--' + s[0], s[1]))
export const setSsDefaultTheme = () => setTheme(getComputedStyle(document.documentElement).getPropertyValue('--foreground').length ? 'darkss' : 'lightss')