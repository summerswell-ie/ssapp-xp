const Q = require( 'q' );
const _qex = {
  
  defer : function() { return Q.defer() },
  justReturn : function(ret) { return Q(ret||-1); },
  
  /**
   * runSequence
   */
  runSequence : function( promiseArray ) {
    if ( promiseArray.length === 0 ) { return Q(-1); }
    
    var def       = Q.defer();
    var results   = [];
    
    const firstPromise = promiseArray[0];
    const restPromises = promiseArray.splice(1);

    const firstFunc    = firstPromise[0];
    const firstArgs    = firstPromise.splice(1);

    try {
      var prom = firstFunc.apply( firstFunc, firstArgs );    

      restPromises.forEach( promiseFuncArray => {
        const func = promiseFuncArray[0];
        const args = promiseFuncArray.splice(1);
        
        prom = prom.then( function( funcResult ) {
          results.push( funcResult );
          return func.apply( func, args );
        } );    
      } );

      prom.then( function( funcResult ) {
        results.push( funcResult );
        def.resolve( results );
      })
      .catch( def.reject );
    } catch( error ) {      
      def.reject( error );
    }

    return def.promise;
  },

  /**
   * runAll
   */
  runAll : function( promiseArray ) {
    const promiseFuncs = [];
    promiseArray.forEach( promiseFuncArray => {
      const func = promiseFuncArray[0];
      const args = promiseFuncArray.splice(1);
      promiseFuncs.push( func.apply( func, args ) );
    });
    return Q.all( promiseFuncs );
  }

};
module.exports = _qex;