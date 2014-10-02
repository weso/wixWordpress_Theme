<?php

/**
 * Test function to render specific pages.
 *
 */

require_once('/var/www/wordpress/wp-load.php');
require_once(__DIR__."/twitter/Twitter.php");
require_once(__DIR__."/gallery/Gallery.php");
 
class Renderer {

	private static $instance;

	private $settings;
	
	private $compiledTemplatesPath;
	private $labelsPath;
	
	private function __construct($settings) {
		$this->settings = $settings;
		
		$this->compiledTemplatesPath = $this->settings['themePath'].$this->settings['compiledTemplatesPath'];
		$this->labelsPath = $this->settings['themePath'].$this->settings['labelsPath'];
	}

	public static function getInstance($settings) {
		if (!self::$instance) {
			self::$instance = new static($settings);
		}

		return self::$instance;
	}	

	public function renderTemplate($templateName) {
		$fileCompiledTemplate = $this->compiledTemplatesPath.$templateName;
		
		if (file_exists($fileCompiledTemplate)) {
			$renderer = include($fileCompiledTemplate);
			
			$pageContent = Array();
			$pageContent["data"] = $this->loadData($templateName);
			$pageContent["labels"] = $this->loadLabels("en");
			
			return $renderer($pageContent, true);
		} else {
	
			return false;
		}
	}
	
	private function loadData($templateName) {
		$templateName = preg_replace("/[^A-Za-z]/", '', $templateName);
		
		$className = ucfirst($templateName) . "Model";
		$modelClass = new ReflectionClass($className);
		$modelObj = $modelClass->newInstanceArgs();
		
		return $modelObj->get();
	}
	
	private function loadLabels($lang) {
		$labelsFile = $this->labelsPath.$lang.".json";
		$defaultLabelsFile = $this->labelsPath."en.json";
		
		if (file_exists($labelsFile)) {
	
			return json_decode(file_get_contents($labelsFile), true);
		} else if (file_exists($defaultLabelsFile)) {
		
			return json_decode(file_get_contents($defaultLabelsFile), true);
		} else {
			
			return null;
		}
	}
} 

class AboutModel {
    
    function AboutModel() {
    }

    function get() {
      $gallery = new Gallery();
      $twitter = new Twitter();

      $data = Array();
	  
      $data["tweets"] = $twitter->loadDefaultAccountTweets();
      $data["gallery"] = $gallery->getImages();
	
      return $data;
    }
}

require_once('simplehtmldom/simple_html_dom.php');

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
		$html = str_get_html($post_content);
		
		$chapter_counter = 0;
		foreach($html->find('article') as $article) {
			$chapter_counter++;
			
			$h1 = $article->find('h1', 0);
			$h1->setAttribute('id', 'chapter_'.$chapter_counter);
			
			$section_counter = 0;
			foreach($article->find('h2') as $h2) {
				$section_counter++;
				$h2->setAttribute('id', 'chapter_'.$chapter_counter.'_section_'.$section_counter);
			}
			
			$chapters['chapter_'.$chapter_counter] = $article;
		}
		
		$data["content"] = $html;
		$data["sidebar"] = $this->generateSideBar($chapters);
		
		return $data;
	}
	
	function generateSideBar($chapters) {
		$sidebar = "<ul>";
		
		foreach ($chapters as $article) {
			$chapter_title = $article->find('h1', 0);
			$sidebar .= "<li><a href='#".$chapter_title->getAttribute('id')."'>".$chapter_title->innertext."</a><ul>";
			
			foreach($article->find('h2') as $h2) {
				$sidebar .= "<li><a href='#".$h2->getAttribute('id')."'>".$h2->innertext()."</a></li>";
			}
			
			$sidebar .= "</ul></li>";
		}
		$sidebar .= "</ul>";
		
		return $sidebar;
	}
}

class IndexModel {
	function IndexModel(){
	}
	
	function get() {
	  $twitter = new Twitter();

      $data = Array();
	  
	  $data["news"] = $this->getPostsByCategory('news');
      $data["tweets"] = $twitter->loadDefaultAccountTweets();
	  
	  return $data;
	}
	
	function getPostsByCategory($categorySlug) {
		$posts = Array();
		$categoryId = get_category_by_slug($categorySlug)->term_id;
		
		$args = array('posts_per_page' => 5, 'category' => $categoryId);
		
		$myposts = get_posts( $args );
		
		foreach ( $myposts as $wppost ){ 
			setup_postdata( $wppost );
			$post = Array();
			$post['title'] = get_the_title();
			$post['time'] = get_the_date();
			$post['content'] = get_the_content("Read more...");

			array_push($posts, $post);
		} 
		wp_reset_postdata();
		
		return $posts;
	}
}

class MediacentreModel {
	
	function MediacentreModel(){
	}

	function get() {
		$data = Array();

		$data["sectionOne"] = $this->getPostContent('sectionone');
		$data["sectionTwo"] = $this->getPostContent('sectiontwo');
	
		$data["sidebar"] = $this->generateSidebar($data);
	
		return $data;

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
