$(function(){
    //when document is ready, attachs event to dismiss popovers
    $(document).on("click", function hideAllSharePopovers() {
        $(".share-btn").popover("hide");
    });
});

function showShareLinkFor(sketch){
    return function(event){
        event && event.stopPropagation();

        $(".share-btn").not(this).popover("hide");

        $(this).popover('show').on('shown.bs.popover ', function () {
            var $linkInput = $(`#${sketch}-link`);

            readSketch(sketch)
                .then(determineIfshouldCreateNewGist)
                .then(createGist)
                .then(storeGistAndShow(sketch, $linkInput))
                .catch(reuseGistIfCodeDidntChange(sketch, $linkInput));
        })
    }
}

function reuseGistIfCodeDidntChange(sketch, $link){
    return function determine(whatHappened){
        $link.html(
            (whatHappened == "Sketch hasn't changed, show the old saved gist")
                ?`https://gist.github.com/${localStorage.getItem(sketch)}`
                :"There was an error! but here's your link: WHAT IS THAT BEHIND YOU?! *runs away*");
    }
}

function storeGistAndShow(sketch, $link) {
    return function storeGist(gist){
        localStorage.setItem(sketch, gist.id);

        $link.html(gist.html_url);
    }
}

function sketchInGalleryHTML(sketchName, thumbnailPath){
    return `<li id="sketch-${sketchName}" class="sketch">
                    <button title="share" class="share-btn" >
                        <img src="img/share.svg" style="border: 2px solid white">
                    </button>
                    <img src="${thumbnailPath}">
                    <span class="sketch-text">${sketchName}</span>
                </li>`;
}

function readSketch(sketch){
    return new Promise(function(redSketch, couldntReadBecause){
        fs.readFile(`../sketches/${sketch}/src/main/scala/ThreeJSApp.scala`, function(anError, sketchBuffer){
            if(anError)
                couldntReadBecause(anError);
            else
                redSketch({
                    name: sketch,
                    code: sketchBuffer.toString()
                });
        });
    });
}

function determineIfshouldCreateNewGist(sketch){
    return new Promise(function(createNewGist, shouldntCreateGist){

        var gistId = localStorage.getItem(sketch.name);

        if(!gistId){
            createNewGist(sketch);
        }
        else {
            $.get(`https://api.github.com/gists/${gistId}`).then(function(gist){
                var sketchGistData = gist.files["sketch.scala"];

                var getGistContents = new Promise(function(gotContents){
                    if(sketchGistData.truncated)
                        $.get(sketchGistData.raw_url).then(gotContents);
                    else
                        gotContents(sketchGistData.content);
                });

                getGistContents.then(function(gistContents){
                    if(areSameContents(sketch.code, gistContents))
                        shouldntCreateGist("Sketch hasn't changed, show the old saved gist");
                    else
                        createNewGist(sketch);
                });
            });
        }
    });
}

function createGist(sketch){
    return $.ajax({
        url: 'https://api.github.com/gists',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            "description": sketch.name,
            "public": true,
            "files": {
                "sketch.scala": {
                    "content": sketch.code
                }
            }
        })
    });
}

function areSameContents(str1, str2){
    return str1.replace(/\s/g, "") == str2.replace(/\s/g, "");
}

function shareLinkPopoverOptions(sketch){
    return {
        html:true,
            trigger: "manual",
        content:function() {
            return `<div contenteditable="true" id="${sketch}-link" class="share-link" readonly>Sharing...</div>`;
        },
        template:
            `<div onclick="arguments[0].stopPropagation()" class="popover" role="tooltip">
                <div class="arrow"></div>
                <div class="popover-content"></div>
            </div>`
    }
}
