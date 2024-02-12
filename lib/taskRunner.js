const logger            = require( './logger' );
const requireDirectory  = require( "require-directory" );

const _task = {
  tasks : null,

  config : {
    taskDir : process.mainPathResolve( 'tasks/' ),
  },

  /**
   * init
   * Loads all the JS files in the tasksDir directory.
   */
  init : function( config ) {
    Object.assign( _task.config, config );
    logger.log( '[taskRunner] Task Directory:', _task.config.taskDir );

    try {
      _task.tasks = requireDirectory( module, _task.config.taskDir );
      logger.log( `[taskRunner] Loaded ${Object.keys(_task.tasks).length} tasks` );
    } catch( requireError ) {
      logger.error( '[taskRunner] Error loading tasks: ', requireError );
    }
  },

  /**
   * start
   * Runs the start function of all the loaded modules.
   */
  start : function() {
    logger.log( '[taskRunner] Running start functions' );
    Object.keys( _task.tasks )
      .forEach( taskModule => {
        if ( _task.tasks[taskModule].hasOwnProperty( 'start' ) ) {
          _task.tasks[taskModule].start();
        }
      });
  },

  stop : function() {
    logger.log( '[taskRunner] Running stop functions' );
    if ( _task.tasks ) {
      Object.keys( _task.tasks )
        .forEach( taskModule => {
          if ( _task.tasks[taskModule].hasOwnProperty( 'stop' ) ) {
            _task.tasks[taskModule].stop();
          }
        });
    }
  }
};

module.exports = _task;