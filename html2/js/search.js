function getSearch() {
	console.log("aaa");
	$.ajax({
		type: "POST",
		url: "/search/result",
		dataType: "json",
		data: {mySearch: $("#sch").val(), typeSearch: $("#typeSch").val()},
		success: successGetSearch
	});
}

function successGetSearch(data, textStatus) {
	$("#tabResult tr").remove();

	data.listLinkFound.forEach(function(val, idx) {
		$("#tabResult > tbody:last").append('<tr class="success"><td>'+(idx+1)+'</td><td><a href='+val+'>'+val+'</a></td><td>...</td></tr>');
		saveId=(idx+1);
	});
}