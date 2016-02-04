var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var spawn = require('child_process').spawn;
var kill = require('tree-kill');
var gui = require('nw.gui');
var win = gui.Window.get();

win.showDevTools();

$(document).ready( function(){
    var IDE = new ScalaZenIDE().init();
    
    
    win.on('close', function() {
        this.hide(); // hides to shutDown gracefully in background

        IDE.shutDown()
           .then(function(){
               gui.App.quit();
           });
    });
});