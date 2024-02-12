const winston = require( 'winston' );
const dayjs   = require( 'dayjs' );
const Q       = require( 'q' );
const path    = require( 'path' );
const drotate = require( 'winston-daily-rotate-file' );
const fs      = require( 'fs' );

/**
 * MODULE: _log / cosoft_log
 */
const _log = {
  defaultLogger : null,

  /**
   * forceFilePath
   * Make sure the path to a file exists
   */
  forceFilePath : function( fileName ) {    
    try {
      var stats = fs.statSync( fileName );
    } catch(e) {}
    if ( stats && stats.isFile() ) return;

    const dir = path.dirname( fileName );
    if ( !fs.existsSync( dir ) ) {
      fs.mkdirSync( dir );
    }    
  },

  defaultOptions : {
    logFilePath : `${process.outPathResolve('logs')}`,
    fileName    : 'debug.log',
    maxFileSize : 1024 * 1024 * 100,   
    maxLogFiles : 20,
    timeFormat  : 'HH:mm:ss',
    maxLevel    : 'debug',
    showLevel   : true,
  },

  /**
   * Object to hold the original console.* methods.
   */
  originalConsole : {
    log     : console.log,
    error   : console.error,
    info    : console.info,
  },

  /**
   * replaceOriginalConsole
   * Replace the original console.* methods with the ones defined in the defaultLogger
   */
  replaceOriginalConsole : function() {
    console.log     = function() { _log.defaultLogger.log.apply( _log.defaultLogger, [ '*', ...arguments, '' ] ) };
    console.error   = function() { _log.defaultLogger.error.apply( _log.defaultLogger, [ ...arguments, '' ] ) };
    console.info    = function() { _log.defaultLogger.info.apply( _log.defaultLogger, [ ...arguments, '' ] ) };
  },

  /**
   * createLogger
   * Creates a new Logger
   */
  createLogger : function( overrideOptions ) {    
    var newLoggerOptions = Object.assign( {}, _log.defaultOptions, overrideOptions );

    var newLogger = new (winston.Logger)( { transports:[], exitOnError: !newLoggerOptions.handleExceptions } );
    newLogger.on( "error", error => { _log.originalConsole.error( error ) } );

    var canLogToFile = true;
    try {
      const logFileName = path.resolve( newLoggerOptions.logFilePath, newLoggerOptions.fileName );
      _log.forceFilePath( logFileName );

      newLogger.add( 
        winston.transports.DailyRotateFile,
        {
          name          : 'rotate-file',
          filename      : logFileName,
          json          : false,
          timestamp     : () => dayjs().format( newLoggerOptions.timeFormat ),
          colorize      : false,
          maxSize       : newLoggerOptions.maxFileSize,
          maxFiles      : newLoggerOptions.maxLogFiles,
          zippedArchive : true,     
          level         : newLoggerOptions.maxLevel,
          showLevel     : newLoggerOptions.showLevel
        }      
      );

      var test_filename = path.join( newLogger.transports['rotate-file'].dirname, newLogger.transports['rotate-file']._getFilename() );  
      fs.appendFileSync( test_filename, '' );

    } catch( err ) {
      _log.originalConsole.error( "[ logger | Couldn't create file log", newLoggerOptions, err, "]" );
      canLogToFile = false;
    }

    newLogger.add( 
      winston.transports.Console,
      {
        json              : false,
        timestamp         : () => dayjs().format( newLoggerOptions.timeFormat ),
        colorize          : true  ,
        level             : newLoggerOptions.maxLevel,  
        showLevel         : newLoggerOptions.showLevel           
      }
    );

    var newAbstractLogger = {
      log     : function() { newLogger.info( ...arguments ) },
      error   : function() { newLogger.error( ...arguments ) },
      info    : function() { newLogger.info( ...arguments ) },
      debug   : function() { newLogger.log( 'debug', ...arguments ) },
      logger  : newLogger,
      stream  : {
        write : ( message, encoding ) => { newLogger.info( message.slice( 0, -1 ) ) },
      },
      canLogToFile,
    };
    return newAbstractLogger;
  },

  /**
   * createDefaultLogger
   */
  createDefaultLogger : function() {
    _log.defaultLogger = _log.createLogger( );       
  },
  
  /**
   * init
   */
  init : function( options ) {
    try {
      Object.assign( _log.defaultOptions, options );      
      _log.createDefaultLogger();            
      _log.replaceOriginalConsole();      
    } catch( error ) {      
      _log.originalConsole.error( error );
    }
    return _log;
  },

  // ** Convenience methods to access the defaultLogger
  log   : function() { _log.defaultLogger.log.apply   ( _log.defaultLogger, arguments ) },
  error : function() { _log.defaultLogger.error.apply ( _log.defaultLogger, arguments ) },
  info  : function() { _log.defaultLogger.info.apply  ( _log.defaultLogger, arguments ) },
  debug : function() { _log.defaultLogger.debug.apply ( _log.defaultLogger, arguments ) },
  
  // *** Slackbot : function() { return require( "./slackbot" )( _log ) },
};
module.exports = _log;