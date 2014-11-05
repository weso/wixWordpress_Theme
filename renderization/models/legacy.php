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
}
?>
