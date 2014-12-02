<?php
class ErrorModel {
	function ErrorModel() {
	}

	function get() {
		global $wpdb;
		$data = Array();
	
		$data["search"] = get_search_form(false);
		return $data;
	}
}
?>
