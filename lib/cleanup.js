/* cleanup.js
 * Handler for Node exit conditions
 * Based on http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits/21947851#21947851
 */

function noOp() {};

/**
 * _cleanup
 */
const _cleanup = {
  callback : null,

  /**
   * init
   */
  init : function( callback ) {
    _cleanup.callback = callback || noOp;

    // *** When we get the cleanup event, call the callback
    process.on( 'cleanup', _cleanup.callback );
    
    // *** Handle the other events
    process.on( 'exit',   () => { process.emit( 'cleanup' ) } );
    process.on( 'SIGINT', () => { console.log( 'Ctrl-C' ); process.exit(2); } );
    process.on( 'SIGHUP', () => { console.log( 'SigHup' ); process.exit(2); } );

  },
};
module.exports = _cleanup;