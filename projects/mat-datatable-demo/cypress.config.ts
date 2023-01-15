/*
 * setupNodeEvents is required, as angular multi project workspace uses
 * tsconfig.app.json as a typescript configuration file and without the
 * webpack preprocessor cypress expects a file named tsconfig.json.
 *
 * No 'component' config element, as this is a demo without a component.
 */

import * as webpackPreprocessor from '@cypress/webpack-preprocessor';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: false,
    setupNodeEvents: (on, config) => {
      const defaults = webpackPreprocessor.defaultOptions;
      on('file:preprocessor', webpackPreprocessor(defaults));
      return config;
    }
  }
});
