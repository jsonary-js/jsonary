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
    '_footer.js'
  );

  $outputString = "";
  
  $outputString .= "// Rendered: " . date('r') . "\n";
  foreach ($files as $filename) {
    $outputString .= "//\t* $filename\n";
  }
  $outputString .= "\n";
  
  foreach ($files as $filename) {
    $outputString .= "\n/********************** $filename **********************/\n";
    $outputString .= file_get_contents(BASE_DIR.$filename);
  }
  echo($outputString);
  file_put_contents(TARGET_FILE, $outputString);
  ?>
