module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: [
    "<rootDir>/src/tests/**/*.test.ts",
    "<rootDir>/src/**/__tests__/**/*.ts",
  ],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/tests/**/*",
    "!src/**/__tests__/**/*",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
};
