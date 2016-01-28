
var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var kill = require('tree-kill');


var gui = require('nw.gui');

var win = gui.Window.get();
win.showDevTools();

var previewWin=false;

$( document ).ready( function(){
var callId = 0;

var socket;
var server; 
var sbtProc;



var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

win.on('close', function() {
    var self = this;
    // Hide the window to give user the feeling of closing immediately
    this.hide();
    gui.App.closeAllWindows();
    if (typeof socket !== 'undefined') {
        socket.close();
    }
    //Try to kill spawned processes
    if(typeof socket !== 'undefined'){
        kill(server.pid, 'SIGTERM', function(err){

            console.log("Server Killed");
            if(typeof sbtProc !== 'undefined'){
                kill(sbtProc.pid, 'SIGKILL',function(err){
                    console.log("SBT Killed");                    
                    
                    wrench.rmdirSyncRecursive(newName + '/.ensime_cache');
		            console.log("ENSIME CACHE CLEARED");

                    gui.App.quit();
                });
            }else{
                gui.App.quit();
            }   
        });
    }else{
        gui.App.quit();
    }
   
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

                    //TODO: Order the list acording to user usage (history), also filter by blacklist properly (this is not bad anyway)

                    //Implicit conversions and functions nobody know what they do.
                    var blacklist = ['Vec3ToVector3',
                                    'Vec3IntToVector3',
                                    'Vec3IntDoubleDoubleToVector3',
                                    'Vec3DoubleIntDoubleToVector3',
                                    'Vec3DoubleDoubleIntToVector3',
                                    'Vec3IntIntDoubleToVector3',
                                    'Vec3DoubleIntIntToVector3',
                                    'Vec3IntDoubleIntToVector3',
                                    'Vec2ToVector3',
                                    'Vec2IntToVector3',
                                    'Vec2DoubleIntToVector3',
                                    'Vec2IntDoubleToVector3',
                                    'IntToDouble',
                                    'SeqVec3ToVector3',
                                    'SeqVec3IntToVector3',
                                    'SeqVec3IntDoubleDoubleToVector3',
                                    'SeqVec3DoubleIntDoubleToVector3',
                                    'SeqVec3DoubleDoubleIntToVector3',
                                    'SeqVec3IntIntDoubleToVector3',
                                    'SeqVec3DoubleIntIntToVector3',
                                    'SeqVec3IntDoubleIntToVector3',
                                    'SeqVec2ToVector3',
                                    'SeqVec2IntToVector3',
                                    'SeqVec2DoubleIntToVector3',
                                    'SeqVec2IntDoubleToVector3',
                                    'SeqIntToColor',
                                    'IntToColor',
                                    '→',
                                    '->',
                                    '##',
                                    'finalize',
                                    'notifyAll',
                                    'ensuring',
                                    'vec2Double',
                                    'vec2Int',
                                    'vec2DoubleInt',
                                    'vec2IntDouble',
                                    'vec3Double',
                                    'vec3Int',
                                    'vec3IntDoubleDouble',
                                    'vec3DoubleIntDouble',
                                    'vec3DoubleDoubleInt',
                                    'vec3IntIntDouble',
                                    'vec3DoubleIntInt',
                                    'vec3IntDoubleInt'
                                    ];



                    var jsonData = JSON.parse(event.data)

                    if(jsonData.payload.typehint=='CompletionInfoList'){
                       var list = jsonData.payload.completions
                                                    .filter(function(e){
                                                        return blacklist.indexOf(e.name) == -1;
                                                    })
                                                    .map(function(e){
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

    var prevCount=1;

    $('#create-sketch').click(function() {
        
        //Pretty graphics
        $('#preview').hide();
        $('#compile-progress-bar').hide();
        $('#autocomplete-progress-bar').show();
        

        //Important Stuff
        newSketchName = $('#new-sketch-name').val();
        newName = '../sketches/'+newSketchName;
        wrench.copyDirSyncRecursive('../templates/main-template', newName);

        

        console.log("File Name to Read: "+newName+myApp);

        fs.readFile(newName+myApp,function (err, data) {
            editor.setValue(data.toString());
        });
            

        //Start Ensime Server per Sketch (Its ugly, I know)        
        
        //var gensime = exec("cd "+newName+" && sbt gen-ensime", function (error, stdout, stderr) {
        

        fs.readFile(path.resolve(newName) + '/.ensime',function (err, data) {

            //g repalces all instances
            //a-zA-Z0-9- Letter, number, and symbol -
            
            var newData = data.toString().replace(/templates\/[a-zA-Z0-9-]*\//g, "sketches/"+newName+"/")
                                        .replace(/templates\/[a-zA-Z0-9-]*\"/g, "sketches/"+newName+"\"");

            fs.writeFileSync(path.resolve(newName) + '/.ensime', newData);

            server = spawn("../ensime", [path.resolve(newName) + '/.ensime']);
    	    server.stdout.on('data', function(serverData) {
          	
                console.log(`[ENSIME] - stdout: ${serverData}`);
        		
        		//Means, server is ready for action
        		if(serverData.toString().indexOf('Setting up new file watchers') > -1){
        			fs.readFile(path.resolve(newName) + '/.ensime_cache/http',function (err, fileData) {
        		            //Open Websockets for compile/autocomplete/etc
        		            socket = new WebSocket('ws://127.0.0.1:' + fileData.toString() + '/jerky');

        		            socket.onopen = function () {
        		                socket.send(JSON.stringify({"callId" : 0,"req" : {"typehint":"ConnectionInfoReq"}}));
        		            };

        		            socket.onclose = function () {
        		                console.log('Lost ensime server connection!');
        		            };


        		    }); 
        		}

                if(serverData.toString().indexOf('received handled message FullTypeCheckCompleteEvent') > -1){
                    //Show options when server is ready to accept requests
                    $('#autocomplete-progress-bar').hide(500);
                    $('#preview').show(500);

                    //Open preview window as soon as the server autocomplete is ready for action.
                    if (previewWin == false) {
                        previewWin = gui.Window.open(newName + '/index.html', {
                            focus: true,
                            toolbar:false,
                            title: newName + " preview"
                        });
                    }


                }
    	    });

            server.stderr.on('data', function(data){
                console.log(`[ENSIME] - stderr: ${data}`);
            });
        });          

        //Escondo y desactivo todo lo demas
        $('#main-menu').children().removeClass("active");
        $('#content').children().hide();
        //Muestro lo que quiero
        $('#code-editor').show(500);
        $('#new-sketch').addClass("active");
        $('#new-sketch-modal').modal('hide');
    });   
   
    $('#preview').click(function() {

        fs.writeFile(newName+myApp, editor.getValue());

        if(typeof sbtProc == 'undefined'){
            sbtProc = spawn("sbt", ["~fastOptJS"], {cwd: path.resolve(newName)});
            sbtProc.stdout.on('data', function(data){
                console.log(`[SBT] - stdout: ${data}`);

                if(data.toString().indexOf("Waiting for source changes...") > -1){
                    //exec("x-www-browser "+newName+"/index.html");

                    if (previewWin == false) {
                        previewWin = gui.Window.open(newName + '/index.html', {
                            focus: true,
                            toolbar:false,
                            title: newName + " preview"
                        });
                        previewWin.on('close', function() {
                            this.hide();
                            previewWin = false;
                            this.close(true);
                        });
                    } else {
                        previewWin.reloadIgnoringCache();
                        previewWin.restore();
                    }


                    $('#preview').show(500);
                    $('#compile-progress-bar').hide(500);
                }

                sbtProc.stderr.on('data', function(data){
                    console.log(`[SBT] - stderr: ${data}`);
                });

            
            });  
        }
        
        $('#preview').hide(500);
        $('#compile-progress-bar').show(500);
	if (previewWin != false) previewWin.minimize();
    });
});
                                    
                                    
