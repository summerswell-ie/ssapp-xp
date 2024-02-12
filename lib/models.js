const requireDirectory = require( 'require-directory' );
const fs = require( 'fs' );
const logger = require( './logger' );

const _models = {
  config : {
    modelDir : process.mainPathResolve( 'models/' ), // *** We want this to be inside the pkg
  },
  init : ( config ) => {
    Object.assign( _models.config, config );
    logger.log( `[models] Model Directory: ${_models.config.modelDir}` );

    try {
      if ( fs.existsSync( _models.config.modelDir ) ) {
        _models._ = requireDirectory( module, _models.config.modelDir );
        logger.log( `[models] Loaded ${Object.keys( _models._ ).length} models` );
        logger.log( '[models] Running init' );
        _models.initModels();
      }
    } catch( requireError ) {
      logger.error( `[models] Error loading models: ${requireError.message}` );      
    }
  },

  initModels : () => {
    logger.log( `[models] Running init functions` );
    Object.keys( _models._ )
      .forEach( modelName => {
        if ( _models._[modelName].hasOwnProperty( 'init' ) ) {
          try {
            _models._[modelName].init();
          } catch( initError ) {
            logger.log( `[models] Error initing ${modelName} : ${initError.message}` );
            logger.error( initError );
          }
        }
      });
  },
};
module.exports = _models;