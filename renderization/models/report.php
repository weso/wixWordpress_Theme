<?php
require_once('utils.php');

class ReportModel {
	
	function ReportModel() {
	}
	
	function get() {
		global $wpdb;
		
		$data = Array();
		$chapters = Array();
		
		// Obtain the post id through its name
		$id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = 'report'");
		
		// Obtain the post through its id
		$post = get_post($id); 
		
		// Filter the post content
		$post_content = apply_filters('the_content', $post->post_content);

		$chapter_counter = 0;
		$html = "";
		
		foreach(sliceHtmlIntoChapters($post_content) as $chapter) {
			$chapter_counter++;
			
			$article = str_get_html($chapter);
			
			$tags = "";
			foreach($article->find('h2') as $h2) {
				$h2->setAttribute('id', formatTitleToAnchor($h2->innertext));
				
				$content = $h2->innertext;
				$id = $h2->id;
				$tags .= "<li><a href='#$id'>$content</a></li>";
			}
			
			$nav = "<nav><ul class='tags'>$tags</ul></nav>";
		
			$title = $article->find('h1', 0);

                        if ($title)
                                $title->outertext = $title->outertext . $nav;
	
			$chapters['chapter_'.$chapter_counter] = $article;
			$html .= $article;
		}
		
		$slices = generateSideBar($chapters);
		
		$data["report"]["content"] = $html;
		$data["report"]["ul"] = $slices["sidebar"];
		
		return $data;
	}
}
?>
