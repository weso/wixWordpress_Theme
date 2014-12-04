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

                        $section_counter = 0;
                        foreach($article->find('h2') as $h2) {
                                $section_counter++;
                                $h2->setAttribute('id', getNodeText($h2));
                        }

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
