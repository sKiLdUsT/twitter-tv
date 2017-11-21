<?php if ( basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"]) ) { die(1); }
function preContent()
{
?>
<html>
<head>
    <title>Twitter TV</title>
    <link rel="stylesheet" type="text/css" href="/assets/app.css">
</head>
<body>
    <div class="loader">
        <div id="lCircle"></div>
        <div id="lImage">
            <p>TV</p>
            <img src="/assets/twitter_logo.svg">
        </div>
        <div id="lProgress">
            <div class="slider"></div>
        </div>
    </div>
    <div class="fullpage">
<?php
}

function afterContent()
{
    ?>
    </div>
</body>
<script type="text/javascript" src="/assets/app.js"></script>
</html>
    <?php
}
