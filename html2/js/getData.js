function getListScrap() {
	$.ajax({
		type: "POST",
		url: "/queue/listScrap",
		success: successGetListScrap,
		dataType: "json"
	});
}

function successGetListScrap(data, textStatus) {
	$("#tabListe tr").remove();

	$("#tabListe > tbody:last").append('<tr><th>N°</th><th>Url</th><th>Autre info</th></tr>');
	var saveId = 0;
	data.listScrap.urls.forEach(function(val, idx) {
		$("#tabListe > tbody:last").append('<tr class="success"><td>'+(idx+1)+'</td><td>'+val+'</td><td>...</td></tr>');
		saveId=(idx+1);
	});
	var saveId2 = 0;
	data.listError.urls.forEach(function(val, idx) {
		$("#tabListe > tbody:last").append('<tr class="danger"> <td>'+(idx+1+saveId)+'</td><td>'+val+'</td><td>...</td></tr>');
		saveId2 = saveId+(idx+1);
	});
	
	data.listNotScrap.urls.forEach(function(val, idx) {
		$("#tabListe > tbody:last").append('<tr> <td>'+(idx+1+saveId2)+'</td><td>'+val+'</td><td>...</td></tr>');
	});
}
getListScrap();
setInterval(getListScrap, 2000);