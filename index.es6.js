import inquirer from 'inquirer'
import semafor from 'semafor'
import glue from 'glue-path'
import packager from 'electron-packager'
import colors from 'colors'

export default function interactive(verbose = true) {
  
  let log = semafor();

  let default_version = "0.30.4";
  let default_src = process.cwd();
  let default_out = glue([process.cwd(), "releases"]);
  
  let get_package_name = () => {
    try {
      var pkg_path = glue([process.cwd(), "package.json"]);
      var pkg = require(pkg_path);
      return pkg.name;
    }catch(e){}
    return "";
  }

  let settings = {
    dir: default_src,
    name: null, 
    platform: "all",
    arch: "all",
    version: default_version,
    out: default_out,
    "app-bundle-id": "",
    "app-version": "",
    overwrite: true,
    asar: false
  };

  let error = (msg) => {
    log.fail(msg.toString());
    process.exit(1);
  }

  let ask_overwrite = (cb) => {
    let overwrite_prompt = {
      type : 'confirm', 
      name : "overwrite",
      message: "Overwrite output directory ?",
      default: true
    }
    inquirer.prompt(overwrite_prompt, (response) => {
      cb(response.overwrite);
    });
  }

  let ask_asar = (cb) => {
    let asar_prompt = {
      type : 'confirm', 
      name : "asar",
      message: "Use asar source packaging ?",
      default: false
    }
    inquirer.prompt(asar_prompt, (response) => {
      cb(response.asar);
    });
  }

  let ask_sourcedir = (cb) => {
    let sourcedir_prompt = {
      type : 'input', 
      name : "sourcedir",
      message: "Select Electron app source directory:",
      default: default_src
    }
    inquirer.prompt(sourcedir_prompt, (response) => {
      var sourcedir = response.sourcedir.trim();
      if(sourcedir == "") {
        sourcedir = default_src;
      }
      cb(sourcedir);
    });
  }

  let ask_out = (cb) => {
    let out_prompt = {
      type : 'input', 
      name : "out",
      message: "Select Electron app output directory:",
      default: default_out
    }
    inquirer.prompt(out_prompt, (response) => {
      var out = response.out.trim();
      if(out == "") {
        out = default_out;
      }
      cb(out);
    });
  }

  let ask_appname = (cb) => {
    let appname_prompt = {
      type : 'input', 
      name : "appname",
      message: "Select Application name:",
      default: get_package_name()
    }
    inquirer.prompt(appname_prompt, (response) => {
      var appname = response.appname.trim();
      if(appname == "") {
        error("Must provide the application name");
        return;
      }
      cb(appname);
    });
  }

  let ask_app_bundle_id = (cb) => {
    let bundle_id_prompt = {
      type : 'input', 
      name : "bundle_id",
      message: "Select App Bundle Id (optional):"
    }
    inquirer.prompt(bundle_id_prompt, (response) => {
      cb(response.bundle_id);
    });
  }

  let ask_app_version = (cb) => {
    let app_version_prompt = {
      type : 'input', 
      name : "app_version",
      message: "Select App Version(optional):",
      default: "0.0.1"
    }
    inquirer.prompt(app_version_prompt, (response) => {
      cb(response.app_version);
    });
  }

  let ask_electron_version = (cb) => {
    let version_prompt = {
      type : 'input', 
      name : "version",
      message: "Select Electron version release:",
      default: default_version
    }
    inquirer.prompt(version_prompt, (response) => {
      var version = response.version.trim();
      if(version == "") {
        version == default_version;  
      }
      cb(version);
    });
  }

  let ask_arch = (cb) => {
    let choices = ['all', 'ia32', 'x64'];
    let arch_prompt = {
      type : 'checkbox', 
      name : "arch",
      message: "Select architecture:",
      choices: choices
    }
    inquirer.prompt(arch_prompt, (response) => {
      let arch = response.arch; 
      if(arch.length == 0) {
        cb("all");
        return;
      }
      if(arch.indexOf('all') != -1) {
        cb("all");
        return;
      }
      if(arch.indexOf('ia32') != -1 && 
          arch.indexOf('x63') != -1) {
        cb("all");
        return;
      }
      cb(arch.join(","));
    });
  }

  let ask_platform = (cb) => {
    let choices = ['all', 'linux', 'darwin', 'win32'];
    let platform_prompt = {
      type : 'checkbox', 
      name : "platforms",
      message: "Select platforms:",
      choices: choices
    }
    inquirer.prompt(platform_prompt, (response) => {
      let platforms = response.platforms; 
      if(platforms.length == 0) {
        cb("all");
        return;
      }
      if(platforms.indexOf('all') != -1) {
        cb("all");
        return;
      }
      if(platforms.indexOf('linux') != -1 && 
          platforms.indexOf('darwin') != -1 &&
          platforms.indexOf('win32') != -1) {
        cb("all");
        return;
      }
      cb(platforms.join(","));
    });
  }
  
  let run_electron_packager = (settings) => {
    log.log("Electron packager settings:".white);
    log.log(settings);
    
    packager(settings, (err, appPath) => {
      if(err) {
        error(err);
        return;
      }
      log.ok("Application packaged successfuly!")
      log.log(appPath);
    });
  }

  ask_appname( (appname) => {
    settings.name = appname;
  ask_sourcedir( (src) => {
    settings.dir = src;
  ask_platform( (platforms) => {
    settings.platform = platforms;
  ask_arch( (arch) => {
    settings.arch = arch;
  ask_electron_version( (version) => {
    settings.version = version;
  ask_out( (out) => {
    settings.out = out;
  ask_overwrite( (overwrite) => {
    settings.overwrite = overwrite;
  ask_asar( (asar) => {
    settings.asar = asar;
  ask_app_bundle_id( (bundle_id) => {
    settings["app-bundle-id"] = bundle_id;
  ask_app_version( (app_version) => {
    settings["app-version"] = app_version;

  run_electron_packager(settings);
  
  })})})})})})})})})}); // <- this is ugly

}
