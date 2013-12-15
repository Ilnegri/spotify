	// Global var
	var page_string = "&page=";
	var results_per_page = 100; //TBD is the max number of results returned by a call
	var call = "http://ws.spotify.com/search/1/track.json?q="; //generic search on spotify 
	var query_results_number, searched_param, 
		scroll_counter, results_counter, pop_sum, 
		results_sum, status_call, scroll_boolean, avarage_pop;
	var search_call, search_thumb_call = null;

	/**
	* Trigger ENTER Key for faster search 
	* @param {string} seconds time in milliseconds
	* @return {string} human formatted time 
	*/
	//
	$('#search').bind("enterKey",function(e){
	   first_search();
	});
	
	$('#search').keyup(function(e){
		if(e.keyCode == 13)
		{
			$(this).trigger("enterKey");
		}
	});

	/**
	* Used in show_results, transform  milliseconds (track length) in a human readeable time
	* @param {string} seconds time in milliseconds
	* @return {string} human readeable formatted time 
	*/
	function secondsToString(seconds) 	{
		var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
		var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
		var numseconds = Math.floor(((seconds % 31536000) % 86400) % 3600) % 60;
		if (numhours  != 0)  { return numhours + " h: " + numminutes + ":m" + numseconds + "s";}
		else { return numminutes + "m:" + numseconds + "s";}
									}
	
	/**
	* Used in retrive_thumb, create single track player
	* @param {string} track_uri used to build the spotify player iframe
	* @return spotify track player iframe
	*/
	function create_track_player (track_uri)	{
		var track_id = track_uri.substr(track_uri.length - 22);
		$('#box_' + track_id).unbind('mouseenter mouseleave');
		$('#play_' + track_id).append('<iframe src="https://embed.spotify.com/?uri='+ track_uri + ' "width="300" height="80" frameborder="0" allowtransparency="true"></iframe>');
	}
								
	/**
	* Used in retrive_thumb, create a album track player
	* @param 	{string} track_uri used to build the track_id, used to identify the album container and animate it
	*			{string} album_uri used to build the spotify album iframe
	*/	
	function create_album_player (track_uri,album_uri)	{
		var track_id = track_uri.substr(track_uri.length - 22);
		$('#box_' + track_id).unbind('mouseenter mouseleave');
		$('#span_' + track_id).append(
									'<div id="div_album_player_container' + track_id + '" class="album_player_container">' +
										'<iframe src="https://embed.spotify.com/?uri='+ album_uri + ' " style="width:300px; height:380px; margin-top:-80px;" frameborder="0" allowtransparency="true"></iframe>' +
									'</div>');
										
		$('#div_album_player_container' + track_id).animate({top: '0px'});
	}
										
	/**
	* Used in retrive_thumb function, replace the spotify cover url with the original album cover url according to the size selected (60px, 85px, 120px, 300px, 640px)
	* @param 	{string} thumb_uri used to build the track_id, used to identify the album container and animate it
	*			{string} size of the cover 
	* @return 	{string} size_url the url of the original cover according to the selected size (60px, 85px, 120px, 300px, 640px)
	*/	
	function cover_size_picker (thumb_uri,size)	{
		var size_url = thumb_uri.replace("cover", size);
		return size_url;
	}
								
	/**
	* Used in show_results() function. Take the album cover to create the track box, fill the track box with all the info gatered in show_results(),
	* Uses create_album_player() and create_album_player() to create iframe players
	* @param 	{string} track_uri is used to build the track_id (used to identify in a unique way several DIVs),
	* 			is also used to create_track_player() funtion to create single track iframe player and for the ajax call related to the cover colections
	*			{string} album_name the track album name
	* 			{string} album_uri the spotify album uri used by the create_album_player() function to create the album player iframe
	* 			{string} track_title is the track title
	* 			{string} track_year is the track year
	* 			{string} track_length is the track length human readeable
	*  			{string} track_pop is the track popularity
	* 			{object} artists_obj is the object with all the artists related to the track
	*/	
	function retrive_thumb(track_uri, album_name, album_uri, track_title, track_year, track_length, track_pop, artists_obj)	 {
	var thumb_call ="https://embed.spotify.com/oembed/?url=" + track_uri + '&callback=?' ;
	var track_id = track_uri.substr(track_uri.length - 22);
	search_thumb_call = $.ajax(	{
	url: thumb_call + track_uri+ '&callback=?',
		dataType: 'json',
		success: function(results)	{
		thumb_uri = results.thumbnail_url;
		var thumb_uri_60 = cover_size_picker(thumb_uri, 60);
		var thumb_uri_85 = cover_size_picker(thumb_uri, 85);
		var thumb_uri_120 = cover_size_picker(thumb_uri, 120);
		var thumb_uri_300 = cover_size_picker(thumb_uri, 300);
		var thumb_uri_640 = cover_size_picker(thumb_uri, 640);
		
		//create the track box with all the info gatered in show_results() function
		$('#main_content').append('<div id="box_' + track_id + '" class="box">' + 
										'<img id="img_' + track_id + '" src="' + thumb_uri + '" class="thumb">' +
										'<span id="span_'+ track_id +'" class="caption full-caption"> '+										
											'<h1>' + track_title +'<br></h1>' + 
											'<h2>' + track_length + '</h2>' +
											'<p id="year_' + track_id +'">Year: ' + track_year +'</p>' +
											'<p>Populraity: ' + parseInt(track_pop*100) + '%</p>'+
											'<p>Album: ' +
												'<a href="#" class="prevent_default" onclick="create_album_player(&#39;' + track_uri +'&#39;,&#39' + album_uri +'&#39;)">' +  album_name + '</a>' +
											'</p>' +
											'<p id="artists_' + track_id +'">Artists: </p>' +
											'<p>Cover: ' +
												'<a href="'+ thumb_uri_60 + '"  download="' + album_name.replace(/ /g,"_")+ '_60px.jpg" target="_blank">60px</a>&nbsp;' +
												'<a href="'+ thumb_uri_85 + '"  download="' + album_name.replace(/ /g,"_")+ '_85px.jpg" target="_blank">85px</a>&nbsp;' +
												'<a href="'+ thumb_uri_120 + '" download="' + album_name.replace(/ /g,"_")+ '_120px.jpg" target="_blank">120px</a>&nbsp;' +
												'<a href="'+ thumb_uri_300 + '" download="' + album_name.replace(/ /g,"_")+ '_300px.jpg" target="_blank">300px</a>&nbsp;' +
												'<a href="'+ thumb_uri_640 + '" download="' + album_name.replace(/ /g,"_")+ '_640px.jpg" target="_blank">640px</a>' +
											'</p>' +
											'<a class="link_player prevent_default" href="#" onclick="create_track_player(&#39;' + track_uri +'&#39;)">' +
												'<p id="play_' + track_id + '" class="player_container"></p>' + 
											'</a>' +
										'</span>' +
										'</div>');
				
				//track caption animation				
				$('#box_' + track_id).mouseenter(function () {$('#span_'+ track_id).animate({top: '0px'},100);});
				$('#box_' + track_id).mouseleave(function () {$('#span_'+ track_id).animate({top: '-300px'},100);});
		
		// cicle the artists object to show all the artists
		for( n = 0, m = artists_obj.length ; n < m; n++ ) 	{	
			if ( n < m-1) {$('#artists_'+ track_id).append(artists_obj[n].name +', ');}
			else {$('#artists_'+ track_id).append(artists_obj[n].name +'');}
														} 
		
		$('a.prevent_default').click(function(event) 	{
		event.preventDefault();	
													});
		} 
			})
									}
	
	/**
	* Used in first_search() and $(window).scroll functions. Call the spotify API according to the user search, and gaters all the tracks info.
	* Uses retrive_thumb to create the HTML and visualize covers and all the info gatered. Uses morris() to create the poplularity donut chart
	*/	
	function show_results() {
			scroll_counter++;
			search_call = $.ajax(	{
				url: call + searched_param + page_string + scroll_counter,
				dataType: 'json',
				success: function(results)	{
					status_call = true;
					$('#loader').hide();
					// control to prevent a call before the previous is finished
					$( document ).ajaxStop(function( event,request, settings )	 {
						$('#search_paragraph').fadeIn();
						$('#search_paragraph_loader').hide();				
						status_call = false;
					});			
						
					results_sum = results_sum +  results.tracks.length; 
						
					// create the results header at the first search
					if (scroll_boolean != true) {
						query_results_number = results.info.num_results;
						$('#header h2').html('<p>' + query_results_number +  ' risultati per &#39;'+ results.info.query + '&#39;</p>');						
						scroll_boolean = true;
					}
							
					//cycle to take all the tracks, gaters the info and send them to retrive_thumb() function
					for( i = 0, l = results.tracks.length; i < l; i++ ) 	{
						results_counter++;
						var aritst_length = results.tracks[i].artists.length;
						var album_name = results.tracks[i].album.name.replace(/['"]/g,'&nbsp;'); 	// da rivedere la rg-ex per passare comunque il single quote
						var album_uri = results.tracks[i].album.href;
						var track_uri = results.tracks[i].href;
						var track_title = results.tracks[i].name;
						var track_length = secondsToString(results.tracks[i].length);
						var track_year = results.tracks[i].album.released;
						var track_pop = results.tracks[i].popularity;
						var artists_obj = results.tracks[i].artists;
						pop_sum = pop_sum + Number(track_pop);						
						retrive_thumb(track_uri, album_name, album_uri, track_title, track_year, track_length,track_pop, artists_obj);					
					}
		
								
					// last page check  									
					if (results.tracks.length < results.info.limit) {
						scroll_boolean = false;
						$('#loader').hide();
						$('#the_end').show();
					}	
					
					// take the avarage popularity used for the donut chart
					avarage_pop = parseInt(pop_sum/results_sum*100);
					morris();	
												
				}	
			})	
	}
				
										
	/**
	* Called when the user make his search, clean previous search, empty previous search DIVs, and reset control variables
	* Uses show_results() to take the track results from spotify
	*/	
	function first_search () {
		$('#graph').empty();
		pop_sum = 0;
		avarage_pop = 0;
		results_sum = 0;
		$('#search_paragraph').hide();
		$('#search_paragraph_loader').show();
		$('#the_end').hide();
		scroll_counter = 0;
		scroll_boolean = false;
		results_counter = 0;
		searched_param = $('#search').val();	
		$('#main_content').empty();
		
		if (searched_param != "") {
			$('#loader').show();
			show_results() ;
		} else 	{
				$('#graph').hide();
				$('#search_paragraph').show();		
				$('#search_paragraph_loader').hide();	
				$('#the_end').hide();
				$('#header h2').html('<p>search something :(</p>');						
		}
	}
									
	/**
	* Called when the user scroll to the end of the page to call other results. There is a timer to avoid multiply calls when the user scroll
	* Uses show_results() to take the track results from spotify
	*/	
	var timerid = null;
	$(window).scroll(function(){
	   if (timerid === null && scroll_boolean == true && status_call == false &&
		   $(window).scrollTop() >= $(document).height() - $(window).height() -100 ){
			$('#search_paragraph').hide();
			$('#search_paragraph_loader').show();
			$('#loader').show();
			show_results();
			timerid = setTimeout(function() { timerid = null; }, 500);
	   }

	   });

	/**
	* Called in show_results() to show donut popularity chart 
	* Uses morris.js and raphael.js libraries
	*/	 
	function morris () {
		$('#graph').show();
		var pop_lable;
		Morris.Donut({
			  element: 'graph',
			  data: [
				{value: avarage_pop, label: 'POP', formatted: avarage_pop +'%' },
				{value: 100-avarage_pop, label: 'UN-POP', formatted: 100-avarage_pop +'%'}
			  ],
			  backgroundColor: '#fff',
			  labelColor: '#fff',
			  colors: [
				'#E46731',
				'#ffce73'
			  ],
	
			formatter: function (x) { return x + "%"} 
		}).select(0);
				
		if (avarage_pop == 0) {
			pop_lable = "Who knows?"
		}else if (avarage_pop > 0 && avarage_pop <=5) {
			pop_lable = "Niche search"
		}else if (avarage_pop > 5 && avarage_pop <=25) {
			pop_lable = "Refined"
		}else if (avarage_pop > 25 && avarage_pop <=50) {
			pop_lable = "Mainstream"
		}else {
			pop_lable = "Trivial Search"
		}
	
		$('#graph').append('<span class="graph_label">avarage popularity<br> (on ' + results_sum + ' results)</span>').fadeIn();
		$('#graph').append('<span class="pop_label">' + pop_lable + '</span>').fadeIn();
	}
		