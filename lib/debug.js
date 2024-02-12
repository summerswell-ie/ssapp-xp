const logger = require( './logger' );

const _debug = {
  unhandledRejections : new Map(),

  init : function() {
    logger.log( '[debug] Initing' );
    process.on('unhandledRejection', _debug.onUnhandledRejection );
    process.on('rejectionHandled', _debug.onUnhandledRejection );
  },

  onUnhandledRejection : function( reason, p ) {
    _debug.unhandledRejections.set( p, reason );
    logger.debug('[debug] Unhandled Rejection at: Promise', p, 'reason:', reason);
  },

  onHandledRejection : function( p ) {
    _debug.unhandledRejections.delete( p );
  },

  toString : function() {
    _debug.unhandledRejections.forEach( ( key, val ) => {
      logger.debug('[debug] Unhandled Rejection at: Promise', p, 'reason:', reason);
    });
  },

};

module.exports = _debug;