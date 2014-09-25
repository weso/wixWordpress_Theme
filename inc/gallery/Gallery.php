<?php
	class Gallery {
		function Gallery() {
			$settings = json_decode(file_get_contents(__DIR__."/settings.json"), true);
			
			if (!defined('GALLERY_ROUTE')) {
				define('GALLERY_ROUTE', $settings["galleryPath"]);
			}
			
			if (!defined('IMAGE_EXTENSIONS')) {
				define('IMAGE_EXTENSIONS', $settings["extensions"]);
			}
		}
		
		function getImages() {
			$images = array();
			
			foreach(glob(GALLERY_ROUTE."*.{".IMAGE_EXTENSIONS."}", GLOB_BRACE) as $filename) {
				$image = array();
				$image['path'] = $filename;
				
				array_push($images, $image);
			}
			
			return $images;
		}
		
		function getImagesByType($type) {
			return glob(GALLERY_ROUTE."*.{".$type."}", GLOB_BRACE);
		}
	}
?>