module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ['./src/app/_tests_/setup.jest.tsx'],
    testEnvironmentOptions: {
      customExportConditions: ['node'],
    },
    globals: {
      'ts-jest': {
        tsConfig: 'tsconfig.test.json'
      }
    },
  };