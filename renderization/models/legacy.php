<?php
require_once('utils.php');

class LegacyModel {
	function LegacyModel(){
	}

	function get() {
                $slug = "legacy";
                $data = Array();

                $data[$slug] = Array();

                $children = getChildPages($slug);
		$chapters = array();

		$formatted_content = '';
                foreach ($children as $page) {
                        $formatted_name = str_replace('-', '_', $page->post_name);
			$content = '<article>' . apply_filters('the_content', $page->post_content) . '</article>';
			array_push($chapters, str_get_html($content));
			$formatted_content .= $content;
                }
		
		$data[$slug]['content'] = $formatted_content;
		$data[$slug]['ul'] = generateSidebar($chapters);

		var_dump($data);
                return $data;
	}

	function generateSubSections($post_slug, $content) {
		print $post_slug;
		$children = getChildPages($post_slug);
		$article = str_get_html($content);

		$tags = "";
		foreach ($children as $page) {
			$title = $page->title;
			$link = $page->permalink;

			$tags .= "<li><a href='$link'>$title</a></li>";
		}

                $nav = "<nav><ul class='tags'>$tags</ul></nav>";
		
		print $nav . '---------';
                $title = $article->find('h1', 0);

                if ($title)
                	$title->outertext = $title->outertext . $nav;

                return $article;
	}
}
?>
