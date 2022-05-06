const modCase = {
    camel: {
        snake: (str: string): string => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        kebab: (str: string): string => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    },
    snake: {
        camel: (str: string): string => str.replace(/_[a-z]/g, letter => letter.toUpperCase().replace(/_/g, '')),
        kebab: (str: string): string => str.replace(/([a-z])_([a-z])/g, '$1-$2').toLowerCase()
    },
    kebab: {
        camel: (str: string): string => str.replace(/-[a-z]/g, letter => letter.toUpperCase().replace(/-/g, '')),
        snake: (str: string): string => str.replace(/([a-z])-([a-z])/g, '$1_$2').toLowerCase()
    }
}


export default modCase
