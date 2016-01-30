/*
 * Handles GUI and orchestrates objects
 */
function ScalaZenIDE(){
    
    var currentSketch;
    var server = new AutoCompleteServer();
    var editor = new Editor(server);
    var gallery = new Gallery();
    
    this.init = function(){
        gallery.init();
        bindEvents();
    };
    
    function bindEvents(){
        win.on('close', function() {
            // hides to shutDown gracefully in background
            this.hide(); 
            
            shutDownProcesses().then(function(){
                gui.App.quit();
            });
        });

        $('#home').click(function() {
            changeSection();
            
            $('#main-menu').addClass('active');
        });

        $('#gallery-btn').click(function() {
            changeSection();
            
            $('#gallery-btn').addClass('active');
            $('#gallery').show(500);
        });

        $('#create-sketch').click(function() {
            $('#preview').hide();
            var newSketchName = $('#new-sketch-name').val();

            currentSketch = new Sketch(newSketchName, editor);

            currentSketch.start(function(){
                $('#preview').show(500);
                $('#compile-progress-bar').hide(500);
                $('#loading-progress-bar').hide(500);
                
                server.startFor(currentSketch);
            });

            showCodeEditor();
        });

        $('#preview').click(function() {
            $('#preview').hide(500);
            $('#compile-progress-bar').show(500);
            
            currentSketch.preview();
        });
    }
    
    function showCodeEditor(){
        changeSection();
        
        $('#code-editor').show(500);
        $('#new-sketch').addClass('active');
        $('#new-sketch-modal').modal('hide');
    }
    
    function shutDownProcesses(){
        return Promise.all([
            server.shutDown(), currentSketch && currentSketch.close()
        ]);
    }
    
    function changeSection(){
        //Disable selected menu button, and hide current content
        $('#main-menu').children().removeClass('active');
        $('#content').children().hide();
    }
}