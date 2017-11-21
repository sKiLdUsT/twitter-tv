<?php

require('vendor/autoload.php');

function getTrends($resolveIP, $query = false)
{
    header('Content-Type: application/json');
    if($resolveIP || !$query)
    {
        if($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] = "::1") $_SERVER['REMOTE_ADDR'] = file_get_contents("http://ipecho.net/plain");
        $details = json_decode(file_get_contents("http://ipinfo.io/{$_SERVER['REMOTE_ADDR']}/json"));
        $latlong = explode(',', $details->loc);
        $cb = getCodebird();
        $woeid = current($cb->trends_closest([
            'lat' => $latlong[0],
            'long' => $latlong[1]
        ]))->woeid;
        $trends = current($cb->trends_place([
            'id' => $woeid
        ]))->trends;
        $trends = array_slice($trends, 0, 10);
        $statuses = [];
        foreach($trends as $trend)
        {
            $results = $cb->search_tweets([
            'q' => $trend->name . ' -filter:retweets AND -filter:replies',
            'geocode' => "{$latlong[0]},{$latlong[1]},100km",
            'result_type' => 'popular, recent',
            'count' => 10,
            'include_entities' => true
            ])->statuses;
            $statuses[$trend->name] = $results;
        }
        echo json_encode($statuses);
    }
}

function getCodebird()
{
    $dotenv = new Dotenv\Dotenv(__DIR__);
    $dotenv->load();
    $dotenv->required(['CONSUMER_SECRET', 'CONSUMER_KEY']);
    \Codebird\Codebird::setConsumerKey($_ENV["CONSUMER_KEY"], $_ENV["CONSUMER_SECRET"]);
    $cb = \Codebird\Codebird::getInstance();
    $cb->setToken($_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);
    return($cb);
}

function startAuth()
{
    $dotenv = new Dotenv\Dotenv(__DIR__);
    $dotenv->load();
    $dotenv->required(['CONSUMER_SECRET', 'CONSUMER_KEY']);
    \Codebird\Codebird::setConsumerKey($_ENV["CONSUMER_KEY"], $_ENV["CONSUMER_SECRET"]);
    $cb = \Codebird\Codebird::getInstance();
    $cb->setUseCurl(true);
    $reply = $cb->oauth_requestToken([
        'oauth_callback' => 'http://' . $_SERVER['HTTP_HOST'] . '/api/callback'
    ]);
    if($reply->httpstatus === 200)
    {
        $_SESSION['oauth_token'] = $reply->oauth_token;
        $_SESSION['oauth_token_secret'] = $reply->oauth_token_secret;
        $_SESSION['oauth_verify'] = true;
        $cb->setToken($reply->oauth_token, $reply->oauth_token_secret);
        return $cb->oauth_authorize();
    }
	var_dump($reply, 'http://' . $_SERVER['HTTP_HOST'] . '/api/callback');
	http_response_code(500);
	die();
}

function handleCallback()
{
    $dotenv = new Dotenv\Dotenv(__DIR__);
    $dotenv->load();
    $dotenv->required(['CONSUMER_SECRET', 'CONSUMER_KEY']);
    \Codebird\Codebird::setConsumerKey($_ENV["CONSUMER_KEY"], $_ENV["CONSUMER_SECRET"]);
    $cb = \Codebird\Codebird::getInstance();
    if (isset($_GET['oauth_verifier']) && isset($_SESSION['oauth_verify']))
    {
        $cb->setToken($_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);
        unset($_SESSION['oauth_verify']);
        $reply = $cb->oauth_accessToken([
            'oauth_verifier' => $_GET['oauth_verifier']
        ]);
        $_SESSION['oauth_token'] = $reply->oauth_token;
        $_SESSION['oauth_token_secret'] = $reply->oauth_token_secret;
        $_SESSION['auth'] = true;
        header('Location: /');
    }
}

function getRemotePreview($q)
{
    header('Content-Type: application/json');
    $url = base64_decode($q);
    $data = file_get_contents($url);
    $tags = getMetaTags($data);
    preg_match("/\<title\>(.*)\<\/title\>/i", $data, $legacyTitle);
    echo json_encode([
        "title" => array_key_exists('twitter:title', $tags) ? html_entity_decode($tags["twitter:title"]) : array_key_exists('og:title', $tags) ? html_entity_decode($tags["og:title"]) : html_entity_decode($legacyTitle[1]),
        "description" => array_key_exists('twitter:description', $tags) ? html_entity_decode($tags["twitter:description"]) : array_key_exists('og:description', $tags) ?  html_entity_decode($tags["og:description"]) : '',
        "image" => array_key_exists('twitter:image:src', $tags) ? $tags["twitter:image:src"] : array_key_exists('twitter:image', $tags) ? $tags["twitter:image"] : array_key_exists('og:image', $tags) ? $tags["og:image"] : null
    ]);
    return true;
}

// from http://php.net/manual/de/function.get-meta-tags.php#117766
function getMetaTags($str)
{
    $pattern = '
  ~<\s*meta\s

  # using lookahead to capture type to $1
    (?=[^>]*?
    \b(?:name|property|http-equiv)\s*=\s*
    (?|"\s*([^"]*?)\s*"|\'\s*([^\']*?)\s*\'|
    ([^"\'>]*?)(?=\s*/?\s*>|\s\w+\s*=))
  )

  # capture content to $2
  [^>]*?\bcontent\s*=\s*
    (?|"\s*([^"]*?)\s*"|\'\s*([^\']*?)\s*\'|
    ([^"\'>]*?)(?=\s*/?\s*>|\s\w+\s*=))
  [^>]*>

  ~ix';

    if(preg_match_all($pattern, $str, $out))
        return array_combine($out[1], $out[2]);
    return array();
}