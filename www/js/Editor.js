function Editor(autoCompleteServer){
    
    var editor = ace.edit('editor');
    var langTools = ace.require('ace/ext/language_tools');

    editor.getSession().setMode('ace/mode/scala');
    editor.setDisplayIndentGuides(true);

    var scalaCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            autoCompleteServer.getCompletions({
                'point': editor.session.doc.positionToIndex(pos),
                'contents': editor.getValue(),
                'callback': callback
            });
        }
    };    

    langTools.setCompleters([scalaCompleter]);
    editor.setOptions({enableBasicAutocompletion: true});
    editor.$blockScrolling = Infinity; // Prevents Ace warnings
    
    return editor;
};