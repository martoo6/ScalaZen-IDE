/*
 * Handles GUI and orchestrates objects
 */
function ScalaZenIDE(){
    
    var server = new AutoCompleteServer();
    var editor = new Editor(server);
    var gallery = new Gallery();
    
    this.init = function(){
        gallery.init();
        editor.init();
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
            hideCurrentSection();
            
            $('#main-menu').addClass('active');
        });

        $('#gallery-btn').click(function() {
            hideCurrentSection();
            
            $('#gallery-btn').addClass('active');
            $('#gallery').show(500);
        });

        $('#create-sketch').click(function() {
            $('#preview').hide();
            
            var newSketchName = $('#new-sketch-name').val();
            var newSketch = new Sketch(newSketchName, editor);

            editor
                .load(newSketch)
                .then(function(){
                    $('#preview').show(500);
                    $('#compile-progress-bar').hide(500);
                    $('#loading-progress-bar').hide(500);
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
        hideCurrentSection();
        
        $('#code-editor').show(500);
        $('#new-sketch').addClass('active');
        $('#new-sketch-modal').modal('hide');
    }
    
    function hideCurrentSection(){
        //Disable selected menu button, and hide current content
        $('#main-menu').children().removeClass('active');
        $('#content').children().hide();
    }
}