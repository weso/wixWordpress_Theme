<?php
  require_once("controller.php");

  $controller = Controller::getInstance();
  $compiler = $controller->compiler;

  $compiler->compileTemplates();
?>
