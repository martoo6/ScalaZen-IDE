
var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var kill = require('tree-kill');



var win = require('nw.gui').Window.get();
win.showDevTools();


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
                    
                    wrench.rmdirSyncRecursive(newName + '/.ensime_cache', function(d){
                        console.log("ENSIME CACHE CLEARED");
                        self.close(true);
                    });
                });
            }else{
                self.close(true);
            }   
        });
    }else{
        self.close(true);
    }
   
});

function exitSketch(){
    
}

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

    var prevCount=1;

    $('#create-sketch').click(function() {
        
        //Pretty graphics
        $('#compile-progress-bar').hide();
        $('#compile-actions').children().hide();
        $('#autocomplete-progress-bar').show();
        $('#compile-progress-bar').show();

        //Important Stuff
        newSketchName = $('#new-sketch-name').val();
        newName = '../sketches/'+newSketchName;
        wrench.copyDirSyncRecursive('../templates/main-template', newName);

        

        console.log("File Name to Read: "+newName+myApp);
        fs.readFile(newName+myApp,function (err, data) {
            editor.setValue(data.toString());

            sbtProc = spawn("sbt", ["~fastOptJS"], {cwd: path.resolve(newName)});
            sbtProc.stdout.on('data', function(data){
                console.log(`stdout: ${data}`);

                if(data.toString().indexOf(prevCount+". Waiting for source changes...") > -1){
                    exec("x-www-browser "+newName+"/index.html");
                    $('#preview').show(500);
                    $('#compile-progress-bar').hide(500);
                }
            });
            sbtProc.stderr.on('data', function(data){
                console.log(`stderr: ${data}`);
            });
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
          	
                console.log(`stdout: ${serverData}`);
        		
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
                }
    	    });

            server.stderr.on('data', function(data){
                console.log(`stderr: ${data}`);
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
        prevCount++;
        $('#preview').hide(500);
        $('#compile-progress-bar').show(500);
    });
});
                                    
                                    
