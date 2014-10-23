<?php
	
	require_once('lightncandy/lightncandy.php');
	require_once('compiler.php');
	require_once('renderer.php');

	class Controller {	
	
		// singleton
		private static $instance;
		
		public $compiler;
		public $renderer;
		
		private function __construct() {
			$settingsPath = __DIR__.'/settings.json';
			
			if (file_exists($settingsPath)) {
				$settings = json_decode(file_get_contents($settingsPath), true);
				
				$this->compiler = Compiler::getInstance($settings);
				$this->renderer = Renderer::getInstance($settings);
			} else {
				throw new Exception("Settings file couldn't be located: ".__DIR__.'/settings.json');
			}
		}

		public static function getInstance() {
			if (!self::$instance) {
				self::$instance = new static();
			}

			return self::$instance;
		}
		
	}

?>
