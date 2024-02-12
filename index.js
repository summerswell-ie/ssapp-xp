/**
 * summerswell - app core - windows XP
 * 
 * Windows XP compatible modules for client apps.
 */
console.log( '▓ SS App XP: ', require( './package.json' ).version );
require( './lib/injects' );

const _core = {
  cleanup            : require( './lib/cleanup' ),
  cmdline            : require( './lib/cmdline' ),
  config             : require( './lib/config' ),
  debug              : require( './lib/debug' ),  
  defaultSettingsINI : require( './lib/defaultSettingsINI' ),
  express            : require( './lib/express' ),
  guid               : require( './lib/guid' ),
  localdb            : require( './lib/localdb' ),
  logger             : require( './lib/logger' ),
  models             : require( './lib/models' ),
  qex                : require( './lib/qex-es5' ),
  settings           : require( './lib/settings' ),
  tasks              : require( './lib/taskRunner' ),
};

 module.exports = _core;
