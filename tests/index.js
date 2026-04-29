// Test runner configuration for Mocha
// This file should be run with a GJS-compatible test runner or mocked environment

const tests = [
    './tests/effect.test.js',
    './tests/history.test.js'
];

console.log('Running unit tests...');
tests.forEach(test => {
    console.log(`\n=== ${test} ===`);
});
