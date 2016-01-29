var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var exec = require('child_process').exec;
var win = require('nw.gui').Window.get();

win.showDevTools();

/*
 * DOCUMENT READY
 */
$(document).ready( function(){
    var IDE = new ScalaZenIDE();
});
                                    
                                    
