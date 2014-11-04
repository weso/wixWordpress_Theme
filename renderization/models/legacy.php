<?php
class LegacyModel {
	function LegacyModel(){
	}

	function get($api_url, $visualisationsPath) {
                $slug = "legacy";
                $data = Array();

                $data[$slug] = Array();

                $children = $this->getChildPages($slug);

                foreach ($children as $page) {
                        $formatted_name = str_replace('-', '_', $page->post_name);
			$formatted_content = $this->generateSubSections($slug, apply_filters('the_content', $page->post_content));
                        $data[$slug][$formatted_name] = $formatted_content;
                }

                return $data;

        }

	function generateSubSections($post_slug, $content) {
		$children = $this->getChildPaged($post_slug);
		$article = str_get_html($content);

		$tags = "";
		foreach ($children as $page) {
			$title = $page->title;
			$link = $page->permalink;

			$tags .= "<li><a href='$link'>$title</a></li>";
		}

                $nav = "<nav><ul class='tags'>$tags</ul></nav>";

                $title = $article->find('h1', 0);

                if ($title)
                	$title->outertext = $title->outertext . $nav;

                return $article;
	}

        function getChildPages($post_slug) {
                global $wpdb;
                $my_wp_query = new WP_Query();

                $id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = '$post_slug'");
                $all_wp_pages = $my_wp_query->query(array('post_type' => 'page'));

                return get_page_children($id, $all_wp_pages);
        }
}
?>
