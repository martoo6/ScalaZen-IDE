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
            return `<div class="share-controls">
                        <button class="btn btn-default copy-btn" onclick="copyLinkToClipboard(this)">
                            <svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 14 16" width="14">
                                <path d="M2 12h4v1H2v-1z m5-6H2v1h5v-1z m2 3V7L6 10l3 3V11h5V9H9z m-4.5-1H2v1h2.5v-1zM2 11h2.5v-1H2v1z m9 1h1v2c-0.02 0.28-0.11 0.52-0.3 0.7s-0.42 0.28-0.7 0.3H1c-0.55 0-1-0.45-1-1V3c0-0.55 0.45-1 1-1h3C4 0.89 4.89 0 6 0s2 0.89 2 2h3c0.55 0 1 0.45 1 1v5h-1V5H1v9h10V12zM2 4h8c0-0.55-0.45-1-1-1h-1c-0.55 0-1-0.45-1-1s-0.45-1-1-1-1 0.45-1 1-0.45 1-1 1h-1c-0.55 0-1 0.45-1 1z"></path>
                            </svg>
                        </button>
                        <div contenteditable="true" id="${sketch}-link" class="form-control share-link" readonly>Sharing...</div>
                    </div>`;
        },
        template:
            `<div onclick="arguments[0].stopPropagation()" class="popover" role="tooltip">
                <div class="arrow"></div>
                <div class="popover-content"></div>
            </div>`
    }
}

function copyLinkToClipboard(copyBtn){
    if(!gui) throw new Error("Node webkit gui must be defined globally like so => gui = require('nw.gui')");

    var clipboard = gui.Clipboard.get();

    var gistLink = $(copyBtn).siblings(".share-link").text();

    clipboard.set(gistLink, 'text');
}
