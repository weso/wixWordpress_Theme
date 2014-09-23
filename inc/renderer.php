<?php

/**
 * Test function to render specific pages.
 *
 */

class Renderer {

	private static $instance;

	private $settings;
	
	private $compiledTemplatesPath;
	private $viewsContentPath;
	
	private function __construct($settings) {
		$this->settings = $settings;
		
		$this->compiledTemplatesPath = $this->settings['themePath'].$this->settings['compiledTemplatesPath'];
		$this->viewsContentPath = $this->settings['themePath'].$this->settings['viewsContentPath'];
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
			$contentFile = $this->viewsContentPath.$templateName.".json";
			
			if (file_exists($contentFile)) {
			
				return $renderer(json_decode(file_get_contents($contentFile), true));
			} else {
			
				return $renderer();
			}
		} else {
	
			return false;
		}
	}
} 
?>
