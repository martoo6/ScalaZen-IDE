/*
 * Handles GUI and orchestrates objects
 */
function ScalaZenIDE(){
    
    var editor;
    var currentSketch;
    var server = new AutoCompleteServer();
    var gallery; /////////// ESTO TIENE QUE INITEARSE ACA
    
    (function init(){
        new Gallery();
        initEditor();
        bindEvents();
    }());
    
    function bindEvents(){
        win.on('close', function() {
            this.hide();

            server.shutDown();

            this.close(true);
        });

        $('#home-btn').click(function() {
            //Escondo y desactivo todo lo demas
            $('#main-menu').children().removeClass("active");
            $('#content').children().hide();
            //Muestro lo que quiero
            $('#main-menu').addClass("active");
        });

        $('#gallery-btn').click(function() {
            //Escondo y desactivo todo lo demas
            $('#main-menu').children().removeClass("active");
            $('#content').children().hide();
            //Muestro lo que quiero
            $('#gallery-btn').addClass("active");
            $('#gallery').show(500);
        });

        $('#create-sketch').click(function() {
            var newSketchName = $('#new-sketch-name').val();

            currentSketch = new Sketch(newSketchName, editor, server);

            $('#compile-actions').children().hide();
            $('#compile-progress-bar').show();

            showCodeEditor();
        });


        /*
         * WRITES EDITOR CODE INTO FILE, COMPILE AND FASTOPT?
         */
        $('#compile').click(function() {
            currentSketch.compile();
        });

        $('#preview').click(function() {
            currentSketch.preview();
        });
    }
    
    function showCodeEditor(){
        //Escondo y desactivo todo lo demas
        $('#main-menu').children().removeClass("active");
        $('#content').children().hide();
        //Muestro lo que quiero
        $('#code-editor').show(500);
        $('#new-sketch').addClass("active");
        $('#new-sketch-modal').modal('hide');
    }
    
    function initEditor(){
        var langTools = ace.require("ace/ext/language_tools");
        
        editor = ace.edit("editor");

        editor.getSession().setMode("ace/mode/scala");
        editor.setDisplayIndentGuides(true);

        var scalaCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                server.getCompletions({
                    "point": editor.session.doc.positionToIndex(pos), 
                    "file": path.resolve(currentSketch.appPath()),
                    "contents": editor.getValue()
                });
            }
        };    

        langTools.setCompleters([scalaCompleter]);
        editor.setOptions({enableBasicAutocompletion: true});
        editor.$blockScrolling = Infinity; // Prevents Ace warnings
    };
}