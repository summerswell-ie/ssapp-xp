/**
 * Inject require[Local|Lib|Task] into global
 */
requireLocal  = ( moduleRelativePath ) => require( process.mainPathResolve( moduleRelativePath ) );
requireLib    = ( libName ) => require( process.mainPathResolve( `lib/${libName}` ) );
requireTask   = ( taskName ) => requie( process.mainPathResolve( `tasks/${taskName}` ) );
requireES5    =  ( es5moduleName, moduleName ) =>  process.versions.v8 < '5' ? require( es5moduleName ) : require( moduleName );
requireES5Lib =  ( es5moduleName, moduleName ) =>  process.versions.v8 < '5' ? requireLib( es5moduleName ) : requireLib( moduleName );