<?php
require(dirname(__FILE__) . '/global.php');

header('Content-Type: text/javascript');
$confArray = array(
	'WG_APP_ID' => $gWG_APP_ID_CLIENT,
	'WG_API_URL' => $gWG_API_URL,
	'CLAN_IDS' => $gCLAN_ID,
	'LANG' => $gLang,
	'GOOGLE_API_KEY' => $gGOOGLE_API_KEY,
	'THRESHOLDS_MAX_BATTLES' => $gMAX_BATTLE_TIME,
	'CALENDARS' => $gCALENDARS
);
if (isset($_SESSION["access_token"])) {
	$confArray['ACCESS_TOKEN'] = $_SESSION["access_token"];
	$confArray['PLAYER_ID'] = $_SESSION["account_id"];
}
echo 'var gConfig = ' . json_encode($confArray) . ';';
?>