<?php
$path   = './plugin/jquery.multibackground.min.js';

header('Content-Type: text/javascript');
header('Content-Disposition: attachment; filename="' . basename($path) . '"');
header('Content-Length: ' . filesize($path));

readfile($path);