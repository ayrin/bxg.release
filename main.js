window.CheckImage = {
    DISTANCE_MAX : Math.sqrt(195075)
};

(function(myApp) 
{
    myApp.Build = function() 
    {
        myApp.orgCanvas = document.createElement("canvas");
        myApp.orgCanvas.width = "512";
        myApp.orgCanvas.height = "512";
        myApp.orgCanvas.style.top = "10px";
        myApp.orgCanvas.style.left = "10px";
        myApp.orgCanvas.style.position = "absolute";
        myApp.orgCanvas.style.border = "1px solid #000000";
        document.body.appendChild(myApp.orgCanvas);
        
        myApp.orgctx = myApp.orgCanvas.getContext("2d");
        
        myApp.targetCanvas = document.createElement("canvas");
        myApp.targetCanvas.width = "512";
        myApp.targetCanvas.height = "512";
        myApp.targetCanvas.style.top = "10px";
        myApp.targetCanvas.style.left = (myApp.orgCanvas.width + 20) + "px";
        myApp.targetCanvas.style.position = "absolute";
        myApp.targetCanvas.style.border = "1px solid #000000";
        document.body.appendChild(myApp.targetCanvas);
        
        myApp.targetctx = myApp.targetCanvas.getContext("2d");
        
        myApp.btnComp = document.createElement("img");
        myApp.btnComp.src = "./res/btn_compare.jpg";
        myApp.btnComp.onclick = function(ev) {
            myApp.Comparing();
        };
        myApp.btnComp.style.position = "absolute";
        myApp.btnComp.style.width = "100px";
        myApp.btnComp.style.height = "50px";
        myApp.btnComp.style.top = (myApp.orgCanvas.height + 20) + "px";
        myApp.btnComp.style.left = "10px";
        document.body.appendChild(myApp.btnComp);
        
        myApp.similarityText = document.createElement("div");
        myApp.similarityText.style.top = "532px";
        myApp.similarityText.style.left = "120px";
        myApp.similarityText.style.position = "absolute";
        myApp.similarityText.style.width = "100px";
        myApp.similarityText.style.height = "50px";
        myApp.similarityText.style.border = "1px solid #000000";
        myApp.similarityText.innerHTML = "&nbsp&nbsp Similarity";
        document.body.appendChild(myApp.similarityText);
        
        function onDrop(ev) {
            ev.preventDefault();
            if (ev.dataTransfer && ev.dataTransfer.items && ev.dataTransfer.items.length && ev.dataTransfer.items[0].type.indexOf('image/') == 0) {
                var file = ev.dataTransfer.items[0].getAsFile();
                if (file){
                    var reader = new FileReader();
                    reader.onload = function(evLoad)
                    {
                        var img = document.createElement("img");
                        img.src = evLoad.target.result;
                        
                        img.onload = function() {
                            var ctx = ev.target.getContext("2d");
                            ctx.clearRect(0, 0, 512, 512);
                            ctx.drawImage(img, 0, 0);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        };
        
        function onDragOver(ev) {
            ev.preventDefault();
        };
        myApp.orgCanvas.ondrop = onDrop;
        myApp.orgCanvas.ondragover = onDragOver;
        myApp.targetCanvas.ondrop = onDrop;
        myApp.targetCanvas.ondragover = onDragOver;
        
        var img = document.createElement("img");
        img.src = "./res/info.jpg";
        
        var imgt = document.createElement("img");
        imgt.src = "./res/info.jpg";
        
        img.onload = function() {
            myApp.orgctx.drawImage(img, 0, 0);
        }
        
        imgt.onload = function() {
            myApp.targetctx.drawImage(imgt, 0, 0);
        }
    };

    myApp.Comparing = function() 
    {
        myApp.orgData = myApp.orgctx.getImageData(0, 0, myApp.orgCanvas.width + 0, myApp.orgCanvas.height + 0);
        myApp.targetData = myApp.targetctx.getImageData(0, 0, myApp.targetCanvas.width + 0, myApp.targetCanvas.height + 0);
        
        var orgDataStructure = [];
        var targetDataStructure = [];
        var i, j, k;
        for (i = 0; i <= 9; i++) {
            orgDataStructure[i] = [];
            targetDataStructure[i] = [];
            for (j = 0; j < Math.pow(4,i); j++) {
                orgDataStructure[i][j] = [];
                targetDataStructure[i][j] = [];
                    for (var k = 0; k < 4; k++) {
                        orgDataStructure[i][j][k] = 0;
                        targetDataStructure[i][j][k] = 0;
                    }
            }
        }
        var lp, x, y, pow;
        for (i = 0; i <= 9; i++) {
            pow = Math.pow(2,i);
            for (lp = 0; lp < myApp.orgData.data.length; lp++) {
                k = lp % 4;
                x = Math.floor(lp / 4) % 512;
                y = Math.floor((lp / 4) / 512);
                j = Math.floor(x / (512 / pow)) + Math.floor(y / (512 / pow)) * pow;
                orgDataStructure[i][j][k] += myApp.orgData.data[lp] / (262144 / (pow*pow));
            }
        }
        
        for (i = 0; i <= 9; i++) {
            pow = Math.pow(2,i);
            for (lp = 0; lp < myApp.targetData.data.length; lp++) {
                k = lp % 4;
                x = Math.floor(lp / 4) % 512;
                y = Math.floor((lp / 4) / 512);
                j = Math.floor(x / (512 / pow)) + Math.floor(y / (512 / pow)) * pow;
                targetDataStructure[i][j][k] += myApp.targetData.data[lp] / (262144 / (pow*pow));
            }
        }
        
        var similarity = 0; //it has 0 ~ 100% as a value.
        
        //////////////////////////////////////////////////////////////////////////
        // comparing with physical distance between two points on the RGB cube. //
        //////////////////////////////////////////////////////////////////////////
        
        for (i = 0; i <= 9; i++) {
            var maxJ = Math.pow(4, i);
            for (j = 0; j < maxJ; j++) {
                var d = 0;
                for (k = 0; k < 3; k++) {
                    var a = orgDataStructure[i][j][k] - targetDataStructure[i][j][k];
                    d += a*a;
                }
                d = Math.sqrt(d);
                similarity += (((myApp.DISTANCE_MAX - d) / myApp.DISTANCE_MAX) / maxJ) * 10; 
            }
        }
        myApp.similarityText.innerHTML = "&nbsp&nbsp Similarity<br>&nbsp&nbsp&nbsp&nbsp&nbsp" + similarity.toFixed(0) + "%";
console.log(similarity);
    };
    
    
    // myApp.FindSquare = function() {
    //     myApp.UploadImage();
        
    //     myApp.orgData = myApp.orgctx.getImageData(10, 10, myApp.orgCanvas.width + 0, myApp.orgCanvas.height + 0);
    //     myApp.targetData = myApp.targetctx.getImageData(20 + myApp.orgCanvas.width, 10, myApp.targetCanvas.width + 0, myApp.targetCanvas.height + 0);
        
    //     console.log(myApp.orgData);
    //     console.log(myApp.targetData);
        
    //     (function() {
    //         var r = myApp.targetData.data[0], g, b, a;
            
            
    //             for (var j = 4; j < myApp.targetCanvas.width * 4; j+=4) {
    //                 myApp.targetData.data[j] 
    //             }
    //     })();
        
    // };

})(window.CheckImage);