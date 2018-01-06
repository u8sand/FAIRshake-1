if (void 0 === window.jQuery) {
    var jQueryScript = document.createElement("script");
    if (jQueryScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js", document.getElementsByTagName("head")[0].appendChild(jQueryScript), "undefined" == typeof d3) {
        var d3Script = document.createElement("script");
        d3Script.src = "https://d3js.org/d3.v3.min.js", document.getElementsByTagName("head")[0].appendChild(d3Script)
    }
} else if ("undefined" == typeof d3) {
    var script = document.createElement("script");
    script.src = "https://d3js.org/d3.v3.min.js", document.getElementsByTagName("head")[0].appendChild(script);
}

var fairnessWrapper = document.createElement("div");
fairnessWrapper.id = "fairness-wrapper";

var fairness = document.createElement("div");
fairness.id = "fairness";
fairness.setAttribute("style","font-size:12px;text-align:left;font-family:arial, helvetica, clean, sans-serif;line-height:15px;width:120px;background-color:white;position:fixed;right:0;top:0;z-index:2147483636;padding:10px;-moz-box-shadow:0px 0px 5px #333333;-webkit-box-shadow:0px 0px 5px #333333;box-shadow:0px 0px 5px #333333");

var fairnessInsig = document.createElement("div");
fairnessInsig.setAttribute("class","fairness-insig");
fairnessInsig.setAttribute("style","margin:0 auto;")

var infoDiv = document.createElement("div");
var fairshakeLink = document.createElement("a");
fairshakeLink.setAttribute("href","http://amp.pharm.mssm.edu/fairshake");
fairshakeLink.setAttribute("id","fairshakeLink");
infoDiv.setAttribute("style","padding-top:10px;text-align:center;word-wrap:break-word;");
fairshakeLink.setAttribute("style","font-family:arial;line-height:15px;font-size:12px;");

var closeOverlay = document.createElement("a");
closeOverlay.setAttribute("class","close-overlay");
closeOverlay.setAttribute("style","line-height:10px;text-decoration:none;position:absolute;top:0;right:0;background:#eee;font-size:0.9em;padding:2px 5px;border:solid #ccc;border-width:0 0 1px 1px;display:block;")
closeOverlay.setAttribute("onclick","removeBklet();")
closeOverlay.setAttribute("href","javascript:void(0)")
closeOverlay.innerText = "X";

document.body.appendChild(fairnessWrapper);
fairnessWrapper.appendChild(fairness);
fairness.appendChild(fairnessInsig);
fairness.appendChild(infoDiv);
infoDiv.appendChild(fairshakeLink);
fairness.appendChild(closeOverlay);

function removeBklet(){
    a = document.getElementById("fairness-wrapper");
    a.parentNode.removeChild(a);
    b = document.getElementById("fairshakeScript");
    b.parentNode.removeChild(b);
}

var theURL = window.location.href;
var theQ = jQuery.ajax({
    async: false,
    url: 'http://amp.pharm.mssm.edu/fairshake/api/chrome_extension/getQ?',
    data: {
        'src': 'Bookmarklet',
        'url': theURL
        },
    success: function (data) {
        if (data === 'None') {
            notFound();
        }
    }
}).responseText;

if (theQ !== 'None') {
    var tQuestions = theQ.split(/u'|u"/);
    // // var tQuestions = dsQ.split(/', '|', "|", "|", '/);

for (i = 0; i <= 17; i++) {
    tQuestions[i] = tQuestions[i].replace(/',|",|\']|\[/g, '');
    tQuestions[i] = tQuestions[i].replace(/\\xa0/g,' '); //if returns \xa0 instead of a space in the resource name
}

document.getElementById("fairshakeLink").innerText = "FAIRness Insignia\n" + tQuestions[17]; //add resource name in overlay


jQuery.ajax({
    url: 'http://amp.pharm.mssm.edu/fairshake/api/chrome_extension/getAvg?',
    data: {
        'select': 'URL',
        'theURL': theURL
    },
    success: function (data) {
        if (data === 'None') {
                makeBlankInsig(tQuestions); //if getQ returns something but getAvg returns none
                //returnInvalid(); //if getQ returns none
        } else {
            makeInsig(data, tQuestions);
        }
    }
});
}

function makeInsig(avg, qstns) {

    scale = d3.scale.linear().domain([-1, 1])
        .interpolate(d3.interpolateRgb)
        .range([d3.rgb(255, 0, 0), d3.rgb(0, 0, 255)]);

    var body = d3.select(".fairness-insig").append("svg").attr("width", 40).attr("height", 40).attr("style","display:block;margin:0 auto;");

    body.selectAll("rect.fairness-insig").data(getData(avg, qstns)).enter().append("rect").attr("class", "fairness-insig")
        .attr("width", 10).attr("height", 10)
        .attr("id", function (d, i) {
            return "insigSq-" + (i + 1)
        })
        .attr("x", function (d) {
            return d.posx;
        }).attr("y", function (d) {
        return d.posy;
        }).style("fill", function (d) {
        return scale(d.numdata);
        })
        .style("stroke", "white").style("stroke-width", 1).style("shape-rendering", "crispEdges");

    body.selectAll("rect.btn").data(getData(avg, qstns)).enter().append("rect").attr("class", "btn").attr("width", 10).attr("height", 10)
        .attr("x", function (d) {
            return d.posx;
        }).attr("y", function (d) {
        return d.posy;
        }).style("fill-opacity", 0)
        .on("mouseover", opac)
        .on("mouseout", bopac)
    ;
}

function makeBlankInsig(qstns) {

    var body = d3.select(".fairness-insig").append("svg").attr("width", 40).attr("height", 40).attr("style","display:block;margin:0 auto;");

    body.selectAll("rect.fairness-insig").data(getBlankData(qstns)).enter().append("rect").attr("class", "fairness-insig")
        .attr("id", function (d, i) {
            return "insigSq-" + (i + 1)
        })
        .attr("width", 10).attr("height", 10)
        .attr("x", function (d) {
            return d.posx;
        }).attr("y", function (d) {
        return d.posy;
        }).style("fill", "darkgray").style("stroke", "white").style("stroke-width", 1).style("shape-rendering", "crispEdges");

    body.selectAll("rect.btn").data(getBlankData(qstns)).enter().append("rect").attr("class", "btn").attr("width", 10).attr("height", 10)
        .attr("x", function (d) {
            return d.posx;
        }).attr("y", function (d) {
        return d.posy;
        }).style("fill-opacity", 0)
        .on("mouseover", opacBlank)
        .on("mouseout", bopac)
    ;
}

function getData(avg, qstns) {

    var avgAns = avg.split(",");

    return [{numdata: avgAns[0], qdata: "1. " + qstns[1], posx: 0, posy: 0},
        {numdata: avgAns[1], qdata: "2. " + qstns[2], posx: 10, posy: 0},
        {numdata: avgAns[2], qdata: "3. " + qstns[3], posx: 20, posy: 0},
        {numdata: avgAns[3], qdata: "4. " + qstns[4], posx: 30, posy: 0},
        {numdata: avgAns[4], qdata: "5. " + qstns[5], posx: 0, posy: 10},
        {numdata: avgAns[5], qdata: "6. " + qstns[6], posx: 10, posy: 10},
        {numdata: avgAns[6], qdata: "7. " + qstns[7], posx: 20, posy: 10},
        {numdata: avgAns[7], qdata: "8. " + qstns[8], posx: 30, posy: 10},
        {numdata: avgAns[8], qdata: "9. " + qstns[9], posx: 0, posy: 20},
        {numdata: avgAns[9], qdata: "10. " + qstns[10], posx: 10, posy: 20},
        {numdata: avgAns[10], qdata: "11. " + qstns[11], posx: 20, posy: 20},
        {numdata: avgAns[11], qdata: "12. " + qstns[12], posx: 30, posy: 20},
        {numdata: avgAns[12], qdata: "13. " + qstns[13], posx: 0, posy: 30},
        {numdata: avgAns[13], qdata: "14. " + qstns[14], posx: 10, posy: 30},
        {numdata: avgAns[14], qdata: "15. " + qstns[15], posx: 20, posy: 30},
        {numdata: avgAns[15], qdata: "16. " + qstns[16], posx: 30, posy: 30}
    ]
}

function getBlankData(qstns) {

    return [{qdata: "1. " + qstns[1], posx: 0, posy: 0},
        {qdata: "2. " + qstns[2], posx: 10, posy: 0},
        {qdata: "3. " + qstns[3], posx: 20, posy: 0},
        {qdata: "4. " + qstns[4], posx: 30, posy: 0},
        {qdata: "5. " + qstns[5], posx: 0, posy: 10},
        {qdata: "6. " + qstns[6], posx: 10, posy: 10},
        {qdata: "7. " + qstns[7], posx: 20, posy: 10},
        {qdata: "8. " + qstns[8], posx: 30, posy: 10},
        {qdata: "9. " + qstns[9], posx: 0, posy: 20},
        {qdata: "10. " + qstns[10], posx: 10, posy: 20},
        {qdata: "11. " + qstns[11], posx: 20, posy: 20},
        {qdata: "12. " + qstns[12], posx: 30, posy: 20},
        {qdata: "13. " + qstns[13], posx: 0, posy: 30},
        {qdata: "14. " + qstns[14], posx: 10, posy: 30},
        {qdata: "15. " + qstns[15], posx: 20, posy: 30},
        {qdata: "16. " + qstns[16], posx: 30, posy: 30}]
}

function roundTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}

function opac(d, i) {
    d3.select("#insigSq-" + (i + 1)).style("fill-opacity", .3);
    var div = d3.select("body").append("div")
        .attr("class", "tooltip").attr("id","fairtt").style("opacity", 0)
        .style("position","absolute").style("padding","2px").style("font","13px sans-serif").style("background","black").style("color","white")
        .style("border-radius","2px").style("pointer-events","none").style("z-index","2147483637").style("text-align","left").style("visibility","visible")
        .style("display","block");

    div.transition().style("opacity", .8);
    div.html("Score: " + roundTwo(d.numdata) + "<br>" + d.qdata)
        .style("left", (d3.event.pageX - 50) + "px")
        .style("top", (d3.event.pageY + 25) + "px");
}

function opacBlank(d, i) {
    d3.select("#insigSq-" + (i + 1)).style("fill-opacity", .3);
    var div = d3.select("body").append("div")
        .attr("class", "tooltip").attr("id","fairtt").style("opacity", 0)
        .style("position","absolute").style("padding","2px").style("font","13px sans-serif").style("background","black").style("color","white")
        .style("border-radius","2px").style("pointer-events","none").style("z-index","2147483637").style("text-align","left").style("visibility","visible")
        .style("display","block");

    div.transition().style("opacity", .8);
    div.html("Score: " + "N/A" + "<br>" + d.qdata)
        .style("left", (d3.event.pageX - 50) + "px")
        .style("top", (d3.event.pageY + 25) + "px");
}

function bopac(d, i) {
    d3.select("#insigSq-" + (i + 1)).style("fill-opacity", 1);
    d3.selectAll("#fairtt").remove();
}

function notFound(){
    document.getElementById("fairshakeLink").innerText = "FAIRness data unavailable.";
}
