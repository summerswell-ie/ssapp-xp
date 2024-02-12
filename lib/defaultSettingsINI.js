const fs = require( 'fs' );
const logger = require( './logger' );
const ini = require( 'ini' );
const qex = require( './qex-es5' );
const settings = require( './settings' );

const _defaultSettings = {
  iniFilename : '',
  hasIniFile  : false,
  iniFileContents : '',
  iniConfig : {},
  
  /**
   * 
   */
  replaceDataSettings : () => {
    Object.keys( _defaultSettings.iniConfig ).forEach( section => {
      logger.log( `[setup] INI Section: ${section}` );
      if ( settings._.hasOwnProperty( section ) ) {
        Object.keys( _defaultSettings.iniConfig[section] ).forEach( key => {
          logger.log( `[setup] Replacing setting: ${section}->${key}` )
          settings._[section][key] = _defaultSettings.iniConfig[section][key];
        })
        settings.updateSetting( section, settings._[section] );
      }      
    });
    return qex.justReturn();
  },

  init : () => {
    try {
      _defaultSettings.iniFilename = process.outPathResolve( 'defaultSettings.ini' );
      _defaultSettings.hasIniFile  = fs.existsSync( _defaultSettings.iniFilename );

      if ( _defaultSettings.hasIniFile ) {
        logger.log( `[setup] Has INI file` );
        _defaultSettings.iniFileContents = fs.readFileSync( _defaultSettings.iniFilename, 'utf-8');
        _defaultSettings.iniConfig = ini.parse( _defaultSettings.iniFileContents );

        console.log( _defaultSettings.iniConfig );        
      }
    } catch( err ) {
      logger.log( `[setup] Error loading INI file: ${err.message}` ); 
    }
  },
};
module.exports = _defaultSettings;