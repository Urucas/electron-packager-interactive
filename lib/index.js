import inquirer from 'inquirer'
import semafor from 'semafor'
import packager from 'electron-packager'
import path from 'path'
import util from 'util'

export default function interactive () {
  // Logging library.
  const log = semafor()

  // Get the name from the package.json file.
  function getPackageName () {
    try {
      const pkg = require(path.join(process.cwd(), 'package.json'))
      return pkg.name
    } catch (e) {
      return ''
    }
  }

  function runElectronPackager (settings) {
    log.log('Electron packager settings:')
    log.log(settings)
    packager(settings, (err, appPath) => {
      if (err) {
        return error(err)
      }
      log.ok(`Application packaged successfully to '${appPath}'`)
    })
  }

  // Default values for answers.
  const settings = {
    dir: process.cwd(),
    name: getPackageName(),
    platform: 'all',
    arch: 'all',
    electronVersion: '1.2.2',
    out: path.join(process.cwd(), 'releases'),
    'appBundleId': '',
    'appVersion': '',
    overwrite: true,
    asar: false
  }

  // Log and close the process.
  function error (msg) {
    log.log('')
    log.fail(msg.toString())
    process.exit(1)
  }

  // Start the cli.
  inquirer.prompt([
    {
      type: 'confirm',
      name: 'overwrite',
      message: 'Overwrite output directory ?',
      default: true
    },
    {
      type: 'confirm',
      name: 'asar',
      message: 'Use asar source packaging ?',
      default: settings.asar
    },
    {
      type: 'input',
      name: 'sourcedir',
      message: 'Select Electron app source directory:',
      default: settings.dir
    },
    {
      type: 'input',
      name: 'out',
      message: 'Select Electron app output directory:',
      default: settings.out
    },
    {
      type: 'input',
      name: 'appname',
      message: 'Select Application name:',
      default: settings.name
    },
    {
      type: 'input',
      name: 'bundle_id',
      message: 'Select App Bundle Id (optional):'
    },
    {
      type: 'input',
      name: 'appVersion',
      message: 'Select App Version(optional):',
      default: '0.0.1'
    },
    {
      type: 'input',
      name: 'icon',
      message: 'Select Electron icon file:'
    },
    {
      type: 'input',
      name: 'electronVersion',
      message: 'Select Electron version release:',
      default: settings.electronVersion
    },
    {
      type: 'checkbox',
      name: 'platform',
      message: 'Select platforms:',
      choices: ['all', 'linux', 'darwin', 'win32']
    },
    {
      type: 'checkbox',
      name: 'arch',
      message: 'Select architecture:',
      choices: ['all', 'ia32', 'x64', 'armv7l']
    }
  ], answers => {
    // Get the options and defaults.
    const options = util._extend(settings, answers)

    // Fix two answers.
    options.arch = answers.arch.join(',')
    if (options.arch === '') {
      options.arch = null
      log.warn(`No arch specified, defaulting to ${process.arch}`)
    }
    options.platform = answers.platform.join(',')
    if (options.platform === '') {
      options.platform = null
      log.warn(`No platform specified, defaulting to ${process.platform}`)
    }

    if (options.arch && options.platform) {
    // Warn user selection darwin ia32, since
    // electron-packager will silently fail
    // Read mode here:
    // https://github.com/Urucas/electron-packager-interactive/issues/7
      if ((options.platform.includes('darwin') || options.platform.includes('all')) &&
          (options.arch.includes('ia32') || options.arch.includes('all'))) {
        error('Sorry, building for darwin ia32 is not supported by Electron')
      }
      if (options.arch === 'armv7l' && options.platform !== 'linux') {
        error('Sorry, Electron only supports building Linux targets using the armv7l arch')
      }
    }

    // Add output folder to ignore
    options.ignore = answers.out

    // Build
    runElectronPackager(options)
  })
}
