/**
 * config
 * 
 * (c) summerswell.ie
 */

 const fs = require( 'fs' );

 const _config = {
   _ : {},
   load : () => { 
     // *** Check whether the config file exists outside of the packaged binary
     const outFilename   = process.outPathResolve( 'config.json' );
     const mainFilename  = process.mainPathResolve( 'config.json' );  
 
     const outExists     = fs.existsSync( outFilename );
     const mainExists     = fs.existsSync( mainFilename );
 
     const outConfig   = outExists ? require( outFilename ) : {};
     const mainConfig  = mainExists ? require( mainFilename ) : {};     
 
     Object.assign( _config._, mainConfig, outConfig );
 
     console.log( `[config] Config: ${JSON.stringify( _config._ ) }`)
   },
   save : () => { fs.writeFileSync( process.outPathResolve( 'config.json' ), JSON.stringify( _config._, null, 2 ) ) },
 };
 module.exports = _config