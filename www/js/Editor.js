function Editor(autoCompleteServer){
  
  var aceEditor;
  var currentSketch;
  
  this.load = function(sketch){
      currentSketch = sketch;
      
      return sketch
              .start(aceEditor)
              .then(function(){
                autoCompleteServer.startFor(currentSketch);
              });
  };
  
  this.unloadSketch = function(){
    return currentSketch.close();  
  };
  
  this.previewSketch = function(){
      currentSketch.preview();
  };
    
  this.init = function(){
    aceEditor = ace.edit('editor');
    
    var langTools = ace.require('ace/ext/language_tools');

    var scalaCompleter = {
        getCompletions: function(aceEditor, session, pos, prefix, callback) {
            autoCompleteServer.getCompletions({
                'point': aceEditor.session.doc.positionToIndex(pos),
                'contents': aceEditor.getValue(),
                'callback': callback
            });
        }
    };    

    aceEditor.getSession().setMode('ace/mode/scala');
    aceEditor.setDisplayIndentGuides(true);
    langTools.setCompleters([scalaCompleter]);
    aceEditor.setOptions({enableBasicAutocompletion: true});
    aceEditor.$blockScrolling = Infinity; // Prevents Ace warnings
  };
};