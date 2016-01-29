function Sketch(sketchName, editor, server){
    var self = this;
    var name = sketchName;
    var sketchFolder = '../sketches/' + name;
    var threeJsApp = '/src/main/scala/ThreeJSApp.scala';

    this.preview = function(){
        exec("x-www-browser " + sketchFolder + "/index.html");
    };
    
    this.sketchFolder = function(){
        return sketchFolder;
    };

    this.appPath = function(){
        return sketchFolder + threeJsApp;
    };
    
    this.compile = function(){
        fs.writeFile(this.appPath(), editor.getValue());
        
        var proc = exec("cd " + sketchFolder + " && sbt clean compile fastOptJS");
        
        proc.stdout.on('data', function(data){
            console.log('%cstdout: ' + data, 'color:blue');
        });
        proc.stderr.on('data', function(data){
            console.log('%cstderr: ' + data, 'color:red');
        });
    };
    
    /*************
     * CONSTRUCTOR
     *************/
    wrench.copyDirSyncRecursive('../templates/main-template', sketchFolder);

    console.log("%cFile Name to Read: " + this.appPath(), 'color:blue');

    fs.readFile(this.appPath(),function (err, data) {
        editor.setValue(data.toString());
    });
    
    //Start Ensime Server per Sketch (Its ugly, I know)
    var gensime = exec("cd " + sketchFolder + " && sbt gen-ensime", function (error, stdout, stderr) {
        server.startFor(self);
    });

    gensime.stdout.on('data', function(data) {
        console.log("stdout: " + data);
    });
}