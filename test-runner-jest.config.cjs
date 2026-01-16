const { getJestConfig } = require('@storybook/test-runner')

const defaultConfig = getJestConfig()

module.exports = {
  ...defaultConfig,
  testTimeout: 30000,
}
