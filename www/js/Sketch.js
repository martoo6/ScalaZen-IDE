function Sketch(name){
    var editor;
    var sbtProc;
    var prevCount;
    
    var sketchFolder = '../sketches/' + name;
    var threeJsApp = '/src/main/scala/ThreeJSApp.scala';

    this.preview = function(){
        fs.writeFile(this.appPath(), editor.getValue());
        prevCount++;
    };

    this.absolutePath = function(){
        return path.resolve(sketchFolder);
    };
    
    this.appPath = function(){
        return sketchFolder + threeJsApp;
    };
    
    this.close = function(){
        return new Promise(function(resolve, reject){
            
            console.log('Clearing Ensime Cache!');
            try{
                wrench.rmdirSyncRecursive(sketchFolder + '/.ensime_cache'); 
            }
            catch(e){
                console.log('There was no cache :D');
            }
            
            console.log('Killing SBT!');
            if(sbtProc) kill(sbtProc.pid, 'SIGKILL', resolve);
        });
    };
    
    this.start = function(_editor){
        editor = _editor;
        
        //cant start twice
        this.start = function(){ throw Error('Sketch was already started!'); };
        
        return new Promise(function(resolve, reject){
            
            var previewWindow;

            wrench.copyDirSyncRecursive('../templates/main-template', sketchFolder);

            console.log('%cFile Name to Read: ' + this.appPath(), 'color:blue');

            fs.readFile(this.appPath(),function (err, data) {
                editor.setValue(data.toString());

                prevCount = 1; // drinking cynide is the better fix

                sbtProc = spawn('sbt', ['gen-ensime', '~fastOptJS'], {cwd: path.resolve(sketchFolder)});

                sbtProc.stdout.on('data', function(data){
                    console.log('stdout: ' + data);

                    if(data.toString().indexOf(prevCount+'. Waiting for source changes...') > -1){

                        if (!previewWindow) {
                            previewWindow = gui.Window.open(sketchFolder + '/index.html', {
                              focus: true
                            });
                            previewWindow.on('close', function() {
                                this.hide();
                                this.close(true);
                                previewWindow = null;
                            });
                        } else {
                            previewWindow.reloadIgnoringCache();
                        }

                        resolve();
                    }
                });

                sbtProc.stderr.on('data', function(data){
                    console.log('%cstderr: ' + data, 'color:red');
                });

            });
        });
    };
}