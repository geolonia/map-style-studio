module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['e2e/support/world.ts', 'e2e/support/hooks.ts', 'e2e/step-definitions/**/*.ts'],
    paths: ['e2e/features/**/*.feature'],
    format: ['progress', 'html:e2e-report.html'],
    publishQuiet: true,
  },
};
