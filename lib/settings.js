const qex     = require( './qex-es5' );
const localdb = require( './localdb' );
const logger  = require( './logger' );

const _settings = {
  _ : {},

  _databaseChanges : () => {
    return qex.runSequence([
      [ 
        localdb.exec, 
        `CREATE TABLE IF NOT EXISTS settings ( 
           name TEXT PRIMARY KEY, 
           value TEXT 
        )`
      ]
    ]);
  },

  _defaultSettings : ( defaultSettings ) => {
    logger.log( `[data] Checking default settings` );    
    return qex.runSequence(
      defaultSettings.map( setting => {
        return [ localdb.insertObjectCheckId, 'settings', setting, 'name' ]
      })
    );
  },

  updateSetting : ( name, value ) => {
    logger.log( `[data] Updating ${name}`, value );
    Object.assign( _settings._[name], value );
    return localdb.updateObject( 'settings', { name: name }, { value: JSON.stringify(_settings._[name] ) } );
  },


  _loadSettings : () => {
    logger.log( `[data] Loading settings` );
    return localdb.all( 'SELECT * FROM settings' )
      .then( settingsResult => {                
        _settings._ = settingsResult.reduce( ( current, item ) => {
          current[item.name] = JSON.parse( item.value );
          return current;
        }, {} )        
        process.emit( 'ss-settingsreload', _settings.settings );
        return _settings.settings;
      });
  },

  init : ( defaultSettings ) => {
    return qex.runSequence([
      [ _settings._databaseChanges ],      
      [ _settings._defaultSettings, defaultSettings || {} ],
      [ _settings._loadSettings ],
    ])
  },
};

module.exports = _settings;