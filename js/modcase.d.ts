declare const modCase: {
    camel: {
        snake: (str: string) => string;
        kebab: (str: string) => string;
    };
    snake: {
        camel: (str: string) => string;
        kebab: (str: string) => string;
    };
    kebab: {
        camel: (str: string) => string;
        snake: (str: string) => string;
    };
};
export default modCase;
//# sourceMappingURL=modcase.d.ts.map