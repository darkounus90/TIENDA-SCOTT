<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
echo "1. PHP Working<br>";

require 'db.php';
echo "2. DB Included<br>";

if ($conn) {
    echo "3. Connection Object Exists<br>";
} else {
    echo "3. No Connection Object<br>";
}

echo "4. Script Finished";
?>
