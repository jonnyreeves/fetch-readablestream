// Karma configuration
// Generated on Wed Feb 17 2016 15:48:21 GMT+0000 (GMT)

/*eslint-env node*/
/*eslint no-var: 0*/
module.exports = function(config) {

  // Browsers to run on Sauce Labs
  // Check out https://saucelabs.com/platforms for all browser/OS combos
  var customLaunchers = {
    /* Safari appears broken on saucelabs, but works locally.
    'SL_Safari': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11'
    },
    */
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'linux'
    },
    'SL_Firefox': {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'linux'
    },
    /* need to figure out what's broken in edge.
    'SL_Edge': {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10'
    },
    */
    'SL_IE10': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '11'
    }
  };

  var reporters = ['dots'];
  var browsers = [];
  var singlerun = false;

  if (process.env.SAUCE_USERNAME) {
    reporters.push('saucelabs');
    Array.prototype.push.apply(browsers, Object.keys(customLaunchers));
    singlerun = true;
  }

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    sauceLabs: {
      recordScreenshots: false,
      connectOptions: {
        port: 5757,
        logfile: 'sauce_connect.log'
      },
      public: 'public'
    },

    // list of files / patterns to load in the browser
    files: [
      './node_modules/babel-polyfill/dist/polyfill.js',
      'node_modules/text-encoding/lib/encoding.js',
      'node_modules/web-streams-polyfill/dist/polyfill.js',
      'build/integration-tests.js'
    ],


    // list of files to exclude
    exclude: [
    ],

    proxies: {
      '/srv': 'http://localhost:2001/srv',
    },


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters,


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    browsers: browsers,
    captureTimeout: 120000,
    customLaunchers: customLaunchers,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: singlerun,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1
  })
};
