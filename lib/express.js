/** -----------------------------------------------------------------------
 * Express
 * 
  -----------------------------------------------------------------------*/  
  const express           = require( 'express' );
  const Q                 = require( 'q' );
  const bodyparser        = require( 'body-parser' );
  const morgan            = require( 'morgan' );
  const requireDirectory  = require( 'require-directory' );
  const cors              = require( 'cors' );
  const logger            = require( './logger' );  
  
  /**
   * Express Module
   */
  const _express = {
    _app     : null,
    _express : express,
  
    listenPort : 0, 
  
    init : function( config ) {
      logger.log( `[express] Init` );
      const def = Q.defer();
      _express._app = express();
      _express._app.set( "views", process.mainPathResolve( "views" ) );      
      _express._app.set( "view engine", "ejs" );
      _express._app.use( morgan( 'dev' ) );
      _express._app.use( bodyparser.json( {limit:'50mb'}) );
      _express._app.use( bodyparser.urlencoded({ extended: true } ) );
      _express._app.use( "/assets", express.static( process.mainPathResolve( 'assets') ) );
      _express._app.use( cors() );
  
      // *** Inject the partial function
      _express._app.use( "*", function( req, res, next ) {
        res.renderPartial = function( mainview, partial, data ) {
          data.partials = { content: partial };
          res.render( mainview, data );
        }

        res.renderEJSPartial = function( mainview, data, partial, partialdata ) {          
          data.partials = { content: { view: partial, data: partialdata } };
          res.render( mainview, data );
        }

        next();
      });

      _express.listenPort = config.listenPort || _express.listenPort;
      _express.listenHost = config.listenHost || '0.0.0.0';
  
      _express.loadRoutes( process.mainPathResolve( 'routes' ) ); 
  
      _express._server = _express._app.listen( _express.listenPort, _express.listenHost, function() {
        logger.log( "[express] Server listening at http://" + _express._server.address().address + ":" + _express._server.address().port );
        def.resolve( _express );
      }); 
  
      return def.promise;
    },
  
    /**
     * loadRoutes
     */
    loadRoutes : function( routePath ) {
      logger.log( `[express] Loading routes` );
      _express.routes = requireDirectory( module, routePath, { visit: _express.onRouteVisit } );
    },
  
    handleRouteResult : function( details ) {
      const router = express.Router();

      details.endpoints.forEach( function( endpoint ) {
        router[endpoint[0]]( endpoint[1], endpoint[2] );
      });

      _express._app.use( details.base, router );
    },

    /**
     * onRouteVisit
     */
    onRouteVisit : function( route ) {
      if ( typeof( route.init ) !== 'undefinted' ) {
        try {
          const route_result = route.init( _express );
          
          if ( typeof( route_result ) !== 'undefined' ) {
            // console.log( route_result );
            _express.handleRouteResult( route_result );
          }
          
        } catch( err ) {
          logger.error( `[express] Error initing route: ${route} | Error: ${err}` );
        }
      }
    }
  
  };
  module.exports = _express;