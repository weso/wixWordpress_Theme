<?php
require_once('utils.php');

class MediaModel {
	
	function MediaModel(){
	}

	function get() {
		$slug = "media";
		$data = Array();

		$data[$slug] = Array();
			
		$children = getChildPages($slug);
		foreach ($children as $page) {
			$formatted_name = str_replace('-', '_', $page->post_name);
			$data[$slug][$formatted_name] = apply_filters('the_content', $page->post_content);
		}
	
		return $data;
	}
}
?>
