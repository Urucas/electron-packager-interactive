"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = interactive;

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

var _semafor = require("semafor");

var _semafor2 = _interopRequireDefault(_semafor);

var _electronPackager = require("electron-packager");

var _electronPackager2 = _interopRequireDefault(_electronPackager);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function interactive() {
  // Logging library.
  var log = (0, _semafor2.default)();

  // Get the name from the package.json file.
  function get_package_name() {
    try {
      var pkg = require(_path2.default.join(process.cwd(), "package.json"));
      return pkg.name;
    } catch (e) {}
    return "";
  }

  // Default values for answers.
  var settings = {
    dir: process.cwd(),
    name: get_package_name(),
    platform: "all",
    arch: "all",
    version: "1.2.2",
    out: _path2.default.join(process.cwd(), "releases"),
    "app-bundle-id": "",
    "app-version": "",
    overwrite: true,
    asar: false
  };

  // Log and close the process.
  function error(msg) {
    log.log("");
    log.fail(msg.toString());
    process.exit(1);
  }

  // Start the cli.
  _inquirer2.default.prompt([{
    type: "confirm",
    name: "overwrite",
    message: "Overwrite output directory ?",
    default: true
  }, {
    type: "confirm",
    name: "asar",
    message: "Use asar source packaging ?",
    default: settings.asar
  }, {
    type: "input",
    name: "sourcedir",
    message: "Select Electron app source directory:",
    default: settings.dir
  }, {
    type: "input",
    name: "out",
    message: "Select Electron app output directory:",
    default: settings.out
  }, {
    type: "input",
    name: "appname",
    message: "Select Application name:",
    default: settings.name
  }, {
    type: "input",
    name: "bundle_id",
    message: "Select App Bundle Id (optional):"
  }, {
    type: "input",
    name: "app_version",
    message: "Select App Version(optional):",
    default: "0.0.1"
  }, {
    type: "input",
    name: "icon",
    message: "Select Electron icon file:"
  }, {
    type: "input",
    name: "version",
    message: "Select Electron version release:",
    default: settings.version
  }, {
    type: "checkbox",
    name: "platform",
    message: "Select platforms:",
    choices: ["all", "linux", "darwin", "win32"]
  }, {
    type: "checkbox",
    name: "arch",
    message: "Select architecture:",
    choices: ["all", "ia32", "x64"]
  }], function (answers) {
    // Get the options and defaults.
    var options = _util2.default._extend(settings, answers);

    // Fix two answers.
    options.arch = answers.arch.join(",");
    options.platform = answers.platform.join(",");

    // Add output folder to ignore
    options.ignore = answers.out;

    // Compile.
    run_electron_packager(options);
  });

  function run_electron_packager(settings) {
    log.log("Electron packager settings:");
    log.log(settings);

    (0, _electronPackager2.default)(settings, function (err, appPath) {
      if (err) {
        return error(err);
      }

      log.ok("Application packaged successfully to \"" + appPath + "\"");
    });
  }
}