function getDomain() {
	$("a.active").removeClass('active');
	$("#getDomain").addClass('active');
	$.ajax({
		type: "POST",
		url: "/statistic/result",
		success: successGetDomain,
		dataType: "json"
	});
}

function successGetDomain(data) {
	var canvas = document.getElementById("graph"); 
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	$("#statContent  tr").remove();

	$("#statContent > tbody:last").append('<tr><th>N°</th><th>Domain name</th><th>Number of page found</th></tr>');

	var saveId = 0;

	for(var key in data.result){
		if(data.result.hasOwnProperty(key)){
			$("#statContent > tbody:last").append('<tr><td>'+(saveId+1)+'</td><td>'+key+'</td><td>'+data.result[key]+'</td></tr>');
			saveId++;
		}
	}


}


// http://www.scriptol.com/html5/canvas/circle.php
function pie(ctx, w, h, datalist, colist)
{
  var radius = h / 2 - 5;
  var centerx = w / 2;
  var centery = h / 2;
  var total = 0;
  for(x=0; x < datalist.length; x++) { total += datalist[x]; }; 
  var lastend=0;
  var offset = Math.PI / 2;
  for(x=0; x < datalist.length; x++)
  {
    var thispart = datalist[x]; 
    ctx.beginPath();
    ctx.fillStyle = colist[x];
    ctx.moveTo(centerx,centery);
    var arcsector = Math.PI * (2 * thispart / total);
    ctx.arc(centerx, centery, radius, lastend - offset, lastend + arcsector - offset, false);
    ctx.lineTo(centerx, centery);
    ctx.fill();
    ctx.closePath();		
    lastend += arcsector;	
  }
}

function getGourcentageHtmlJs() {
	$("a.active").removeClass('active');
	$("#getGourcentageHtmlJs").addClass('active');

	$.ajax({
		type: "POST",
		url: "/statistic/pourcentage",
		success: successGetGourcentageHtmlJs,
		dataType: "json"
	}); 
}

function successGetGourcentageHtmlJs(data) {

	$("#statContent  tr").remove();

	$("#statContent > tbody:last").append('<tr>1<th></th><th>text</th><th>image</th><th>audio</th><th>video</th></tr>');
	$("#statContent > tbody:last").append('<tr>2<td></td><td>'+data.text+'</td><td>'+data.image+'</td><td>'+data.audio+'</td><td>'+data.video+'</td></tr>');


	var datalist= new Array(data.text,data.image,data.audio,data.video); 
	var colist = new Array('blue', 'red', 'yellow', 'green');
	var canvas = document.getElementById("graph"); 
	var ctx = canvas.getContext('2d');
	pie(ctx, canvas.width, canvas.height, datalist, colist);

}

getDomain();