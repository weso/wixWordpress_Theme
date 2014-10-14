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
	
	private $menu = Array(Array("path"=>"", "label"=>"Home"),
						Array("path"=>"report", "label"=>"The Report"),
						Array("path"=>"data", "label"=>"The Data"),
						Array("path"=>"blog", "label"=>"Blog"),
						Array("path"=>"media-centre", "label"=>"Media Centre"),
						Array("path"=>"about", "label"=>"About"));
	
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
			
			$navigation = wp_nav_menu( array( 'theme_location' => 'primary', 'echo' => 0 ) );
			
			$pageContent = Array();
			$pageContent["navigation"] = $navigation;
			$pageContent["data"] = $this->loadData($templateName);
			$pageContent["labels"] = $this->loadLabels("en");
			$pageContent["path"] = get_stylesheet_directory_uri();
			
			return $renderer($pageContent, true);
		} else {
	
			return false;
		}
	}
	
	private function loadData($templateName) {
		try {
			$templateName = preg_replace("/[^A-Za-z]/", '', $templateName);
			
			$className = ucfirst($templateName) . "Model";
			$modelClass = new ReflectionClass($className);
			$modelObj = $modelClass->newInstanceArgs();
			
			return $modelObj->get();
		} catch (ReflectionException $e) {
			return array();
		}
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

		$chapter_counter = 0;
		$html = "";
		
		foreach($this->sliceHtmlIntoChapters($post_content) as $chapter) {
			$chapter_counter++;
			
			$article = str_get_html($chapter);
			
			$section_counter = 0;
			foreach($article->find('h2') as $h2) {
				$section_counter++;
				$h2->setAttribute('id', 'chapter_'.$chapter_counter.'_section_'.$section_counter);
			}
			
			$chapters['chapter_'.$chapter_counter] = $article;
			$html .= $article;
		}
		
		$slices = $this->generateSideBar($chapters);
		
		$data["report"]["content"] = $html;
		$data["report"]["ul"] = $slices["sidebar"];
		
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
		
		for ($i=0; $i < count($positions)-1; $i++) {
			$number = $i + 1;
			$article = substr($html, $positions[$i], $positions[$i+1] - $positions[$i]);
			
			$processed_article = str_get_html($article);
			$tags = "";
			
			foreach($processed_article->find('h2') as $h2) {
				$content = $h2->innertext();
				$id = $h2->id;
				$tags .= "<li><a href='#$id'>$content</a></li>";
			}
			
			$nav = "<nav><ul class='tags'>$tags</ul></nav>";
			
			$title = $processed_article->find('h1');
			$title->outertext = $title->outertext . $nav;
			
			$chapters["chapter_".($i+1)] = "<article class='".$article_class."' id='".$article_id.($i+1)."'><p class='chapter'>$number</p>$nav$article<hr /></article>";
		}
		
		$chapters["chapter_".count($positions)] = "<article class='".$article_class."' id='".$article_id.count($positions)."'>".substr($html, $positions[$i])."</article>";
		
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
		
		while (count($posts) < 3) {
			$post = Array();
			$post['title'] = "No more news";
			$post['content'] = "";

			array_push($posts, $post);
		}
		
		return $posts;
	}
}

class MediaModel {
	
	function MediacentreModel(){
	}

	function get() {
		$data = Array();
		$data["media"] = Array();
		
		$data["media"]["press_releases"] = $this->getPostContent('press-releases');
		$data["media"]["videos"] = $this->getPostContent('videos');
		$data["media"]["visualisations"] = $this->getPostContent('visualizations');
		$data["media"]["in_the_press"] = $this->getPostContent('in-the-press');
	
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
