<?php
require_once('utils.php');

class IndexModel {
	function IndexModel(){
	}
	
	function get($api_url, $visualisationsPath) {
		$twitter = new Twitter();

   	   	$data = Array();
		$data["news"] = getPostsByCategory('news');
	      	$data["tweets"] = $twitter->loadDefaultAccountTweets();
		$data["home-header"] = $this->loadFrontVisualisations($visualisationsPath);
		$data["model"] = $this->formatApiData($api_url);

		return $data;
	}

	function formatApiData($api_url) {
		$api_results = json_decode(file_get_contents($api_url.'/rankings/2013'), true);
		$path = get_stylesheet_directory_uri();
		
		$values = $api_results['values'];
		foreach ($values as &$value) {
			$value['img'] = $path . '/images/flags/' . $value['area'] . '.png';
		}
		$api_results['values'] = $values;

		return $api_results;
	}
	
	function loadFrontVisualisations($visualisationsPath) {
		$visualisationsFile = $visualisationsPath."front-settings.json";

		if (file_exists($visualisationsFile)) {
			return json_decode(file_get_contents($visualisationsFile), true);
		} else {
			return Array();
		}
	}
}
?>
