module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/test/**/*.ts",
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ]
}; 