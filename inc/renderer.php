<?php

/**
 * Test function to render specific pages.
 *
 */

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
		} else {
		
			return json_decode(file_get_contents($defaultLabelsFile), true);
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

?>
