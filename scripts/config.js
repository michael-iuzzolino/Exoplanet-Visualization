// http://stackoverflow.com/questions/17351016/set-up-python-simplehttpserver-on-windows
// Run    python -m http.server 8888    in index.html root
// Then go to http://localhost:8888/

var data_dictionary;
var DISCOVERY_METHODS;
var method_move_tracker;
var discovery_method_list = [];
var svg_background_color = "#b3cce6";


var default_exoplanet_r = 10;
var exoplanets;
// timer_ret_val: could be used to stop the timer, but not actually used in this code really. 
var timer_ret_val = false;

// Keeps a record of the elapsed time since the timer began.
var timer_elapsed = 0;

var mainContainer, visContainer, controlsContainer;
var planetsGroup, chartGroup;

var MOVEMENT = false;
var original_r;


var svg_container_height = 1200;
var svg_container_width = 1000;

var svg_plot_width = 600;
var svg_plot_height = 400;

var controls_container_height = 300;
var controls_container_width = 200;


var margin = {left:100, right:50, top:50, bottom:0};
var chart_group_margin = {left: 100, right: 50, top:100, bottom:0};

// Adjust mass to Jupiter
var jupiter_mass = 1.898e27;



var xScale, yScale, rScale, colorScale, randomColorScale;
