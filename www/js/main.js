
var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var exec = require('child_process').exec;

var win = require('nw.gui').Window.get();
win.showDevTools();


$( document ).ready( function(){
var callId = 0;

var socket;
var server; 

win.on('close', function() {
    // Hide the window to give user the feeling of closing immediately
    this.hide();
    if (typeof socket !== 'undefined') {
        socket.close();
    }
    server.kill('SIGKILL');
    this.close(true);
});

    var langTools = ace.require("ace/ext/language_tools");
    var editor = ace.edit("editor");
    
    editor.getSession().setMode("ace/mode/scala");
    editor.setDisplayIndentGuides(true);

    
    var scalaCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            if (typeof socket !== 'undefined') {
           	    callId++;

                var req = JSON.stringify({
                "callId" : callId,
                "req" : {
                		"point": editor.session.doc.positionToIndex(pos), 
                		"maxResults":100,
                        "typehint":"CompletionsReq",
                        "caseSens":true,
                        "fileInfo": {
                        			"file": path.resolve(newName + myApp), 
                        			"contents": editor.getValue()
                        			},
                        "reload":false
                        }
                });

        	    socket.send(req);


        	    socket.onmessage = function (event) {
                    console.log('__________________________________Event Data__________________________________');
                    console.log(event.data);
                    console.log('______________________________________________________________________________');

                    //TODO: Order the list acording to user usage (history), also filter by blacklist
                    var jsonData = JSON.parse(event.data)

                    if(jsonData.payload.typehint=='CompletionInfoList'){
                       var list = jsonData.payload.completions.map(function(e){
                            var printName = e.name
                            var compoundName = e.name 
                            if(e.typeSig.sections.length > 0){
                                printName+='()'; 
                                var lst = e.typeSig.sections[0].map(function(x){return x[0]+':'+x[1] })
                                compoundName += '(' + lst.join(", ") + ')';
                            }
                            compoundName += ' :' + e.typeSig.result;
                            return {value: e.name, caption: compoundName, score: e.relevance};
                        });

                        callback(null, list);            
                    }

                    
        	        //TODO: Close socket on exit actually
        	        //socket.close();
        	    };
            }
        }
    };

    //Sets only our own completer
    langTools.setCompleters([scalaCompleter]);
    editor.setOptions({enableBasicAutocompletion: true});

    editor.$blockScrolling = Infinity;//Prevents Ace warnings

    var newName;
    var newSketchName;
    var myApp = '/src/main/scala/ThreeJSApp.scala';
    
    $('#home').click(function() {
	//Escondo y desactivo todo lo demas
            $('#main-menu').children().removeClass("active");
            $('#content').children().hide();
            //Muestro lo que quiero
            $('#code-editor').hide();
	    $('#main-menu').addClass("active");
    });

    $('#create-sketch').click(function() {
        newSketchName = $('#new-sketch-name').val();
        newName = '../sketches/'+newSketchName;
        wrench.copyDirSyncRecursive('../templates/main-template', newName);

        $('#compile-actions').children().hide();
        $('#compile-progress-bar').show();

        console.log("File Name to Read: "+newName+myApp);
        fs.readFile(newName+myApp,function (err, data) {
            editor.setValue(data.toString());
        });    
            

        //Start Ensime Server per Sketch (Its ugly, I know)        
        
        var gensime = exec("cd "+newName+" && sbt gen-ensime", function (error, stdout, stderr) {
            server = exec("../ensime "+ path.resolve(newName) + '/.ensime', function (error2, stdout2, stderr2) {});
    	    server.stdout.on('data', function(data) {
          		console.log(`stdout: ${data}`);
        		
        		//Means, server is ready for action
        		if(data.indexOf('Setting up new file watchers') > -1){
        			fs.readFile(path.resolve(newName) + '/.ensime_cache/http',function (err, data) {
        		            //Open Websockets for compile/autocomplete/etc
        		            socket = new WebSocket('ws://127.0.0.1:' + data.toString() + '/jerky');

        		            socket.onopen = function () {
        		                //Show options when conected to server
        		                $('#compile-actions').children().show(500);
        		                $('#compile-progress-bar').hide();
        		                socket.send(JSON.stringify({"callId" : 0,"req" : {"typehint":"ConnectionInfoReq"}}));
        		            };

        		            socket.onclose = function () {
        		                console.log('Lost ensime server connection!');
        		            };

        		        }); 
        		}
    	    });

            server.stderr.on('data', function(data){
                console.log(`stderr: ${data}`);
            });
        });
        
    	gensime.stdout.on('data', function(data) {
      		console.log(`stdout: ${data}`);
    	});
           

        //Escondo y desactivo todo lo demas
        $('#main-menu').children().removeClass("active");
        $('#content').children().hide();
        //Muestro lo que quiero
        $('#code-editor').show(500);
        $('#new-sketch').addClass("active");
        $('#new-sketch-modal').modal('hide');
    });
    

    $('#compile').click(function() {
        fs.writeFile(newName+myApp, editor.getValue());
        var exec = require('child_process').exec;
        var proc = exec("cd "+newName+" && sbt clean compile fastOptJS", function(error, stdout, stderr){});
        proc.stdout.on('data', function(data){
            console.log(`stdout: ${data}`);
        });
        proc.stderr.on('data', function(data){
            console.log(`stderr: ${data}`);
        });
    });
    
   
    $('#preview').click(function() {
        var exec = require('child_process').exec;
        var proc2 = exec("x-www-browser "+newName+"/index.html");
    });
});
                                    
                                    
