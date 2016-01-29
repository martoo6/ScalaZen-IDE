/*
 * Handles server interfacing for the autocomplete features
 */
function AutoCompleteServer(){
    var callId = 0;
    var socket;
    var process;
    var currentSketch;
    
    this.shutDown = function(){
        if(socket) socket.close();
        
        if(process) process.kill('SIGKILL');
    };
    
    this.startFor = function(sketch){
        currentSketch = sketch;
        
        process = exec("../ensime "+ currentSketch.sketchFolder() + '/.ensime');
        
        process.stdout.on('data', function(data) {
            console.log('stdout: ' + data);

            if(isReady(data)){
                fs.readFile(currentSketch.sketchFolder() + '/.ensime_cache/http',function (err, port) {
                    //Open Websockets for compile/autocomplete/etc
                    socket = new WebSocket('ws://127.0.0.1:' + port + '/jerky');

                    socket.onopen = function () {
                        //Show options when conected to server
                        $('#compile-actions').children().show(500);
                        $('#compile-progress-bar').hide();
                        socket.send(JSON.stringify({"callId" : 0,"req" : {"typehint":"ConnectionInfoReq"}}));
                    };

                    socket.onclose = function () {
                        console.log('%cLost ensime server connection!', 'color:red');
                    };

                }); 
            }
        });

        process.stderr.on('data', function(data){
            console.log('%cstderr: ' + data, 'color:red');
        });
    };
    
    this.getCompletions = function(editorData){
        if (socket) {
            var req = JSON.stringify({
                "callId" : ++callId,
                "req" : {
                    "point": editorData.point, 
                    "maxResults":100,
                    "typehint":"CompletionsReq",
                    "caseSens":true,
                    "fileInfo": {
                        "file": path.resolve(currentSketch.appPath()),
                        "contents": editorData.contents
                    },
                    "reload":false
                }
            });

            socket.send(req);

            socket.onmessage = function (event) {
                console.log('%c__________________________________Event Data__________________________________', 'color:blue');
                console.log('%c'+event.data, 'color:blue');
                console.log('%c______________________________________________________________________________', 'color:blue');

                //TODO: Order the list acording to user usage (history), also filter by blacklist
                var jsonData = JSON.parse(event.data);

                if(jsonData.payload.typehint === 'CompletionInfoList'){
                   var list = jsonData.payload.completions.map(function(e){
                        var printName = e.name;
                        var compoundName = e.name;
                        if(e.typeSig.sections.length > 0){
                            printName+='()'; 
                            var lst = e.typeSig.sections[0].map(function(x){return x[0]+':'+x[1]; });
                            compoundName += '(' + lst.join(", ") + ')';
                        }
                        compoundName += ' :' + e.typeSig.result;
                        return {value: e.name, caption: compoundName, score: e.relevance};
                    });

                    callback(null, list);            
                }
            };
        }
    };
    
    function isReady(data){
        return data.indexOf('Setting up new file watchers') > -1;
    }
}