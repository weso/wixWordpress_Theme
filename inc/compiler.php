<?php

	require_once('/var/www/wordpress/wp-load.php');

	class Compiler {
		
		// singleton
		private static $instance;
		
		private $settings;
		
		private $templatesPath;
		private $compiledTemplatesPath;
		
		private function __construct($settings) {
			$this->settings = $settings;
			
			$this->templatesPath = $this->settings['themePath'].$this->settings['templatesPath'];
			$this->compiledTemplatesPath = $this->settings['themePath'].$this->settings['compiledTemplatesPath'];
		}

		public static function getInstance($settings) {
			if (!self::$instance) {
				self::$instance = new static($settings);
			}

			return self::$instance;
		}

		public function compileTemplates() {
			$pages = get_pages();
			self::compileTemplate('index', false);
			self::compileTemplate('header', true);
			self::compileTemplate('footer', true);
			
			foreach ($pages as $page) {
				self::compileTemplate($page->post_name, false);
			}
		}

		public function compileTemplate($templateName, $partial) {
			if ($partial) {
				$templatePath = $this->templatesPath."partials/".$templateName.'.hbs';			
			} else {
				$templatePath = $this->templatesPath.$templateName.'.hbs';			
			}
			
			if (file_exists($templatePath)) {
				$template = file_get_contents($templatePath);

				$compiledTemplate = LightnCandy::compile($template, Array(
   					'flags' => LightnCandy::FLAG_STANDALONE,
    					'basedir' => Array(
        					$this->templatesPath,
							$this->templatesPath.'partials/',
    					),
    					'fileext' => Array(
        					'.tmpl',
        					'.mustache',
        					'.hbs',
    					)
				));

				file_put_contents($this->compiledTemplatesPath.$templateName, $compiledTemplate);
			} else {
				error_log(date("Y-m-d H:i:s").': File: '.$templatePath.' does not exists');
			}	
		}
		
	}
?>
