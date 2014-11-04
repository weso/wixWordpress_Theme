<?php
class MediaModel {
	
	function MediaModel(){
	}

	function get($api_url, $visualisationsPath) {
		$slug = "media";
		$data = Array();

		$data[$slug] = Array();
			
		$children = $this->getChildPages($slug);
		foreach ($children as $page) {
			$formatted_name = str_replace('-', '_', $page->post_name);
			$data[$slug][$formatted_name] = apply_filters('the_content', $page->post_content);
		}
	
		return $data;
	}

	function getChildPages($post_slug) {
		global $wpdb;
		$my_wp_query = new WP_Query();	
	
		$id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = '$post_slug'");
		$all_wp_pages = $my_wp_query->query(array('post_type' => 'page'));
		return get_page_children($id, $all_wp_pages);
	}

	function getPostContent($post_slug) {	
		global $wpdb;
		
		$id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = '$post_slug'");

		// Obtain the post through its id
		$post = get_post($id);

		// Filter the post content
		$content = apply_filters('the_content', $post->post_content);

		return $content;
	}
	
	function generateSidebar(&$sections) {
		$sidebar = "<ul>";
		
		$chapter_counter = 0;
		foreach( $sections as &$section) {
			$chapter_counter++;
			$html = str_get_html($section);
			
			$chapter_title = $html->find('h1', 0);
			$chapter_title->setAttribute('id', 'chapter_'.$chapter_counter);
			
			$sidebar .= "<li><a href='#".$chapter_title->getAttribute('id')."'>".$chapter_title->innertext."</a><ul>";
			
			$section_counter = 0;
			foreach($html->find('h2') as $h2) {
				$section_counter++;
				$h2->setAttribute('id', 'chapter_'.$chapter_counter.'_section_'.$section_counter);
				$sidebar .= "<li><a href='#".$h2->getAttribute('id')."'>".$h2->innertext()."</a></li>";
			}
			
			$section = $html;
			$sidebar .= "</ul></li>";
		}
		$sidebar .= "</ul>";
		
		return $sidebar;
	}
}
?>
