const path = require( 'path' );
const fs   = require( 'fs' );

process.mainPath        = path.dirname( require.main.filename ); // path.dirname( process.mainModule.filename );
process.outPath         =  process.pkg ? path.dirname( process.execPath ) : process.mainPath;
process.mainPathResolve = ( relative ) => path.resolve( process.mainPath, relative );
process.outPathResolve  = ( relative ) => path.resolve( process.outPath, relative );
process.appVersion      = require( process.mainPathResolve( 'package.json') ).version;

var oldFsReadSync = fs.readSync;
var newFsReadSync = function(fd, buffer, offset, length, position ) {
  if ( length === 0 ) { return 0; }
  return oldFsReadSync( fd, buffer, offset, length, position );
}
fs.readSync = newFsReadSync;


fsHuman = function (size) {
  var i = Math.floor( Math.log(size) / Math.log(1024) );
  return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
},

tsFormat = function( isoTimestamp ) {
  const jsDate = new Date( isoTimestamp );
  return jsDate.getFullYear() + "-" + ( jsDate.getMonth() + 1 ).toString().padStart( 2, '0' ) + "-" + ( jsDate.getDate() + 1 ).toString().padStart( 2, 0 ) + " " + 
         jsDate.getHours().toString().padStart( 2, '0' ) + ":" + jsDate.getMinutes().toString().padStart( 2, '0' );
  // return isoTimestamp.substr( 0, 10 ) + " " + new Date( isoTimestamp ).toLocaleTimeString();
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {    
  String.prototype.padStart = function padStart(targetLength,padString) {
      targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
      padString = String((typeof padString !== 'undefined' ? padString : ' '));
      if (this.length > targetLength) {
          return String(this);
      }
      else {
          targetLength = targetLength-this.length;
          if (targetLength > padString.length) {
              padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
          }
          return padString.slice(0,targetLength) + String(this);
      }
  };
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd(targetLength,padString) {
      targetLength = targetLength>>0; //floor if number or convert non-number to 0;
      padString = String((typeof padString !== 'undefined' ? padString : ' '));
      if (this.length > targetLength) {
          return String(this);
      }
      else {
          targetLength = targetLength-this.length;
          if (targetLength > padString.length) {
              padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
          }
          return String(this) + padString.slice(0,targetLength);
      }
  };
}

if ( !Number.prototype.round ) {  
  Number.prototype.round = function( precision ) {
    var factor = Math.pow(10, precision);
    var tempNumber = this * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  }
}



isValidObjectPath = function( fullObjectPath ) {
  const objectParts = fullObjectPath.split( '.' );  
  var current = null;
  for ( var i=0; i< objectParts.length; i++ ) {
    current = ( current ? current + '.' : '' ) + objectParts[i];
    const objType = eval( 'typeof( ' + current + ')' );
    if ( objType === 'undefined' ) {
      return false;
    }
    const objVal = eval( current );
    if ( objVal === null ) {
      return false;
    }    
  }
  return true;
}


require( './requireex' );