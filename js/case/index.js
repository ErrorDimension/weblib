const modCase = {
    camel: {
        snake: (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        kebab: (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    },
    snake: {
        camel: (str) => str.replace(/_[a-z]/g, letter => letter.toUpperCase().replace(/_/g, '')),
        kebab: (str) => str.replace(/([a-z])_([a-z])/g, '$1-$2').toLowerCase()
    },
    kebab: {
        camel: (str) => str.replace(/-[a-z]/g, letter => letter.toUpperCase().replace(/-/g, '')),
        snake: (str) => str.replace(/([a-z])-([a-z])/g, '$1_$2').toLowerCase()
    }
};
export default modCase;
