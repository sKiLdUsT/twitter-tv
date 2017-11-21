<?php
require_once(__DIR__.'/../vendor/autoload.php');

session_start();
error_reporting( E_ALL & ~E_NOTICE & ~E_STRICT);

// Taken from http://stackoverflow.com/a/14103883
function exception_error_handler()
{
    header('HTTP/1.1 500 Internal Server Error');
    if(is_file(__DIR__.'/../views/500.php'))
    {
        require(__DIR__.'/../views/500.php');
    } else {
        ?>
        <h1>Something goofed really hard</h1>
        <p>We're working on it, sit tight</p>
        <?php
    }
    // I'll just leave this here for debug purposes.
    //throw new ErrorException($errstr, $errno, 0, $errfile, $errline);
}
// set_error_handler("exception_error_handler");

// Taken from http://stackoverflow.com/a/6225706
function sanitize_output($buffer)
{

    $search = array(
        '/\>[^\S ]+/s',     // strip whitespaces after tags, except space
        '/[^\S ]+\</s',     // strip whitespaces before tags, except space
        '/(\s)+/s',         // shorten multiple whitespace sequences
    );

    $replace = array(
        '>',
        '<',
        '\\1',
        ''
    );

    $buffer = preg_replace($search, $replace, $buffer);

    return $buffer;
}
ob_start("sanitize_output");

$url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
switch( $url )
{
    case '/':
        if(isset($_SESSION['auth']) && $_SESSION['auth'])
        {
            require(__DIR__ . '/../views/home.php');
        } else {
            header("Location: /login");
            echo '<meta http-equiv="Location" content="/login">';
        }
        break;
    case '/login':
        require(__DIR__ . '/../views/login.php');
        break;
    case '/about':
        require(__DIR__ . '/../views/about.php');
        break;
    case '/legal':
        header('Location: https://skildust.com/imprint');
        break;
    case '/api/pull':
        require_once(__DIR__.'/../functions.php');
        getTrends(true);
        break;
    case(preg_match('/\/api\/pull\/(.*)/', $url, $query)  ? true : false):
        require_once(__DIR__.'/../functions.php');
        getTrends(false, $query[1]);
        break;
    case ('/api/callback'):
        require_once(__DIR__.'/../functions.php');
        handleCallback();
        break;
    case ('/api/lpreview'):
        if(isset($_GET['q']))
        {
            require_once(__DIR__.'/../functions.php');
            getRemotePreview($_GET['q']);
        } else {
            http_response_code(400);
        }
        break;
    case ('/tauth'):
        require_once(__DIR__.'/../functions.php');
        $url = startAuth();
        header("Location: ".$url);
        echo '<meta http-equiv="Location" content="'.$url.'">';
        break;
    default:
        require(__DIR__ . '/../views/404.php');
        break;
}
?>