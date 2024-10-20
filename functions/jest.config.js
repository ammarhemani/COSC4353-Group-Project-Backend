module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    collectCoverage: false, // Enable coverage collection
    coverageDirectory: 'coverage', // Output directory for coverage reports
    collectCoverageFrom: [
        "src/modules/**/*.{js,jsx,ts,tsx}", // Collect coverage from all JavaScript and TypeScript files in src
        "!**/node_modules/**",       // Exclude node_modules
        "!**/lib/**",                // Exclude the lib folder if you don't want coverage for it
        "!**/*.d.ts"                 // Exclude TypeScript declaration files
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};
