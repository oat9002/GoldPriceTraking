module.exports = {
    parser: "babel-eslint",
    parserOptions: {
        ecmaVersion: 7,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:react/recommended"],
    plugins: ["react-hooks"],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        semi: ["error", "always"],
        quotes: ["error", "double", { allowTemplateLiterals: true }],
        "no-unused-vars": "off",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
        "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
    },
};
