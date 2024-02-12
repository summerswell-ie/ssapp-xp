/**
 * _cmdline
 */
const _cmdline = {
  args    : [],
  cleaned : [],

  /**
   * init
   */
  init : function() {
    _cmdline.args = process.argv.slice(2);
    _cmdline.cleaned = _cmdline.args.map( arg => _cmdline._clean( arg ) );
  },

  /**
   * 
   */
  _clean : function( option ) {

    if ( option.startsWith( '--' ) ) { 
      option = option.slice(2);
    } else if ( option.startsWith( '/' ) ) {
      option = option.slice(1);
    } else if ( option.startsWith( '-' ) ) {
      option = option.slice(1);
    }

    const eqPos = option.indexOf( '=' );

    if ( eqPos > -1 ) {
      option = option.slice(0, eqPos );
    }
    

    return option.toLowerCase();
  },

  /**
   * optionIndex
   */
  optionIndex : function( option ) {
    option = _cmdline._clean( option );    
    return _cmdline.cleaned.indexOf( option );
  },

  /**
   * optionValue
   */
  optionValue : function( option ) {
    const optIndex = _cmdline.optionIndex( option );
    if ( optIndex == -1 ) { return null; }
    var fullOption = _cmdline.args[optIndex];
    const eqPos = fullOption.indexOf( '=' );
    if ( eqPos > -1 ) {
      return fullOption.slice( eqPos +1 );
    } else {
      return _cmdline.args[optIndex+1];
    }
  },

  /**
   * hasOption
   */
  hasOption : function( option ) {    
    return ( _cmdline.optionIndex( option ) > -1 );
  },
};
_cmdline.init();
module.exports = _cmdline;