<?php
  require_once("compiler.php");
	
  $settingsPath = __DIR__.'/settings.json';

  if (file_exists($settingsPath)) {
  	$settings = json_decode(file_get_contents($settingsPath), true);
	$compiler = Compiler::getInstance($settings);
	
  	$compiler->compileTemplates();
  }
?>
