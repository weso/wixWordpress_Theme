<?php
class ErrorModel {
	function ErrorModel() {
	}

	function get($api_url, $visualisationsPath) {
		global $wpdb;
		$data = Array();
	
		$data["search"] = get_search_form(false);
		
		return $data;
	}
}
?>
