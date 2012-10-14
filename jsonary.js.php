<?php
  
  header("Content-Type: text/javascript");
  
  define("BASE_DIR", "jsonary/");
  define("TARGET_FILE", "jsonary.js");
  
  $files = array(
    '_header.js',
    'uri.js',
    'utils.js',
    'monitors.js',
    'request.js',
    'patch.js',
    'data.js',
    'schema.js',
    'schemamatch.js',
    'schemaset.js',
    'main.js',
    '_footer.js',
    '../plugins/jsonary.render.js'
  );

  $outputString = "/**\n";
  $outputString .= file_get_contents("LICENSE.txt");
  $outputString .= "**/\n\n";
  
  foreach ($files as $filename) {
    $outputString .= file_get_contents(BASE_DIR.$filename)."\n";
  }
  echo($outputString);
  file_put_contents(TARGET_FILE, $outputString);
  ?>
