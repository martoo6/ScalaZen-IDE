/*
 * Allows to init the gallery
 */

function Gallery(){
    
    this.init = function(){
        
        /*
         * FOREACH SKETCH, APPENDS APPENDS IT TO THE GRID AND CREATES ANIMONSCROOLL ON GRID
         */ 
        fs.readdir('../sketches', function(err, folders){

            folders
                .filter(function(f){return fs.statSync('../sketches/'+f).isDirectory();})
                .forEach(function(folder){
                    var li = $('#grid').append('<li><a href=""><img src="https://s-media-cache-ak0.pinimg.com/236x/3c/34/14/3c3414790d7bda08e59062cd0258770a.jpg">'+ folder +'</a></li>');
                    li.click(function(){
                        //TODO: now we have to do this differently
                        //                    loadSketch('../sketches/'+folder);
                        //                    showCodeEditor();
                    });
                });

            new AnimOnScroll( document.getElementById( 'grid' ), {
                minDuration : 0.4,
                maxDuration : 0.7,
                viewportFactor : 0.2
            });
        });
    };
}