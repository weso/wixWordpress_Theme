<?php
require_once(get_stylesheet_directory().'/inc/simplehtmldom/simple_html_dom.php');

class AboutModel {
    
    function AboutModel() {
    }

    function get($api_url, $visualisationsPath) {
		global $wpdb;
		
		$data = Array();
		$chapters = Array();
		
		// Obtain the post id through its name
		$id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = 'about'");
		
		// Obtain the post through its id
		$post = get_post($id); 
		
		// Filter the post content
		$post_content = apply_filters('the_content', $post->post_content);

		$chapter_counter = 0;
		$html = "";
		
		foreach($this->sliceHtmlIntoChapters($post_content) as $chapter) {
			$chapter_counter++;
			
			$article = str_get_html($chapter);
			
			$section_counter = 0;
			foreach($article->find('h2') as $h2) {
				$section_counter++;
				$h2->setAttribute('id', $this->formatTitleToAnchor($h2->innertext));
			}
			
			$chapters['chapter_'.$chapter_counter] = $article;
			$html .= $article;
		}
		
		$slices = $this->generateSideBar($chapters);
		
		$data["about"]["content"] = $html;
		$data["about"]["ul"] = $slices["sidebar"];
		
		return $data;
	}
	
	function sliceHtmlIntoChapters($html) {
		$chapters = Array();
		$positions = Array();
		
		$article_class = 'text-article';
		$article_id = 'chapter_';
		
		$lastPos = 0;
		while (($lastPos = strpos($html, "<h1>", $lastPos))!== false) {
			$positions[] = $lastPos;
			$lastPos = $lastPos + strlen("<h1>");
		}
		
		for ($i=0; $i < count($positions); $i++) {
			$number = $i + 1;
			if ($i == (count($positions)-1)) {
				$article = substr($html, $positions[$i]);
			} else {
				$article = substr($html, $positions[$i], $positions[$i+1] - $positions[$i]);
			}

			$processed_article = str_get_html($article);
			$tags = "";
			
			foreach($processed_article->find('h2') as $h2) {
				$content = $h2->innertext();
				$id = $h2->id;
				$tags .= "<li><a href='#$id'>$content</a></li>";
			}
			
			$nav = "<nav><ul class='tags'>$tags</ul></nav>";
			
			$title = $processed_article->find('h1', 0);
			
			if ($title)
				$title->outertext = $title->outertext . $nav;
				$article_id = $this->formatTitleToAnchor($title->innertext);
			
			$content = $processed_article->outertext;
			
			$chapters["chapter_".($i+1)] = "<article class='".$article_class."' id='".$article_id."'><p class='chapter'>$number</p>$content<hr /></article>";
		}
		
		return $chapters;
	}
	
	function generateSideBar($chapters) {
		$slices = Array();
		$subsections = Array();
		$sidebar = "";
		$subsection = "";
		
		foreach ($chapters as $article) {
			$article_element = $article->find('article', 0);
			$chapter_title = $article->find('h1', 0);
			$sidebar .= "<li><a href='#".$article_element->getAttribute('id')."'>".$chapter_title->innertext."</a><ul>";
			
			foreach($article->find('h2') as $h2) {
				$subsection = "<li><a href='#".$h2->getAttribute('id')."'>".$h2->innertext()."</a></li>";
			}
			
			$subsections[$article_element->getAttribute('id')] = "<ul>".$subsection."</ul>";
			$sidebar .= $subsection."</ul></li>";
		}
		
		$slices["sidebar"] = $sidebar;
		$slices["subsections"] = $subsections;
		
		return $slices;
	}

	function formatTitleToAnchor($title) {
                $anchor = strtolower(str_replace(' ', '_', $title));

                return $anchor;
        }

}
?>
