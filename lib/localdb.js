const logger  = require( './logger' );
const qex     = require( './qex-es5' );
const sqlite  = require( 'sqlite3' ).verbose();
const fs      = require( 'fs' );
const path    = require( 'path' );

const _localdb = {
  config : {
    dbFilename : '.data/localdata.db'
  },
  db : null,
  connected : false,

  openDatabase : () => {
    const def = qex.defer();
    logger.log( `[localdb] Using database file: ${_localdb.config.dbFilename}` );

    require('fs').mkdirSync( path.dirname( _localdb.config.dbFilename ), { recursive: true } );

    _localdb.db = new sqlite.Database( 
      _localdb.config.dbFilename,
      ( error ) => {
        if ( error ) {
          _localdb.connected = false;
          def.reject( error );
        } else {
          logger.log( `[localdb] Connected` );
          _localdb.connected = true;
          def.resolve( _localdb.db );
        }
      }
    );
    return def.promise;
  },

  closeDatabase : () => {
    const def = qex.defer();    
      _localdb.db.close( ( error ) => {
        if ( error ) {
          def.reject( error );
        } else {
          _localdb.connected = false;
          def.resolve();
        }
      })    
    return def.promise;
  },

  all : ( statement, params, options ) => {
    const def = qex.defer();
    _localdb.db.all( statement, params || [], ( error, result ) => {
      if ( error ) {
        def.reject( error );
      } else {
        if ( options ) {
          if ( options.hasOwnProperty( 'mapFunction') ) {
            result = result.map( options.mapFunction );
          }
          if ( options.hasOwnProperty( 'reduceFunction') ) {
            result = result.reduce( options.reduceFunction, {} );
          }
          if ( options.hasOwnProperty( 'filterFunction' ) ) {
            result = result.filter( options.filterFunction );
          }
        }
        def.resolve( result );
      }
    });
    return def.promise;
  },

  get : ( statement, params ) => {
    const def = qex.defer();
    _localdb.db.get( statement, params, ( error, row ) => {
      if ( error ) {
        def.reject( error );
      } else {
        def.resolve( row );
      }
    } )
    return def.promise;
  },

  /**
   * updateObject
   */
  updateObject : function( table, where, data ) {
    const setClause   = Object.keys( data ).map( col => `${col} = ?` ).join( ', ' );
    const whereClause = Object.keys( where ).map( col => `( ${col} = ? )` ).join( ' AND ' );
    const setValues   = Object.keys( data ).map( col => data[col] );
    const whereValues = Object.keys( where ).map( col => where[col] );
    const updateQuery = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    return _localdb.run( updateQuery, setValues.concat( whereValues ) );
  },

  /**
   * insertObject
   */
  insertObject : function( table, data ) {
    const columns = Object.keys( data );
    const paramMarkers = columns.map( col => '?' ).join(',' );
    const insertQuery = `INSERT INTO ${table} ( ${columns.join(',')} ) VALUES ( ${paramMarkers} ) `;
    const paramValues = columns.map( col => data[col] );
    // console.log( insertQuery, paramValues );
    return _localdb.run( insertQuery, paramValues );      
  },

  replaceObject : function( table, data ) {
    const columns = Object.keys( data );
    const paramMarkers = columns.map( col => '?' ).join(',' );
    const insertQuery = `REPLACE INTO ${table} ( ${columns.join(',')} ) VALUES ( ${paramMarkers} ) `;
    const paramValues = columns.map( col => data[col] );
    // logger.debug( insertQuery, paramValues );
    return _localdb.run( insertQuery, paramValues );      
  },

  /**
   * insertObjectCheckId
   */
  insertObjectCheckId : function( table, data, idField ) {
    const columns = Object.keys( data );
    const paramMarkers = columns.map( col => '?' ).join(',' );
    const insertQuery = `INSERT INTO ${table} ( ${columns.join(',')} ) SELECT ${paramMarkers} WHERE NOT EXISTS ( SELECT 1 FROM ${table} WHERE ${idField} = ? ) `;
    const paramValues = columns.map( col => data[col] );
    paramValues.push( data[idField] );
    return _localdb.exec( insertQuery, paramValues );      
  },

  exec : ( statement, params ) => {
    const def = qex.defer();
    _localdb.db.get( statement, params, ( error ) => {
      if ( error ) {
        def.reject( error );
      } else {
        def.resolve( true );
      }
    })
    return def.promise;
  },

  run : ( statement, params ) => {
    const def = qex.defer();
    _localdb.db.run( statement, params, function( error ) {
      if ( error ) {
        def.reject( error );
      } else {
        // this.lastID - value of the last inserted row ID
        // this.changes - number of rows affected by this query
        def.resolve( this );
      }
    })
    return def.promise;
  },

  init : ( options ) => {
    Object.assign( _localdb.config, options || {} );
    return _localdb.openDatabase();
  },

};
module.exports = _localdb;