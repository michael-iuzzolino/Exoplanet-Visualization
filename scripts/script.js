// http://stackoverflow.com/questions/17351016/set-up-python-simplehttpserver-on-windows
// Run    python -m http.server 8888    in index.html root
// Then go to http://localhost:8888/
// ps -fA | grep python
// kill #


var data_dictionary;
var DISCOVERY_METHODS;
var method_move_tracker;
var discovery_method_list = [];
var svg_container_color = "#666699";
var controller_container_color = "#9494b8";



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
var svg_container_width = "100%";

var svg_plot_width = 600;
var svg_plot_height = 400;





var margin = {left:200, right:50, top:100, bottom:0};
var chart_group_margin = {left: 200, right: 50, top:100, bottom:0};

// Adjust mass to Jupiter
var jupiter_mass = 1.898e27;
var min_mass, max_mass, max_temp, max_radius;


var xScale, yScale, rScale, rPlotScale, colorScale, randomColorScale;


var text_color = "#ffffff";
var chart_background = svg_container_color;

var controllerGroup;
var controller_height = 100;
var controller_width = 250;

var controls_container_height = 300;
var controls_container_width = 200;

var keys_height = 100;
var keys_width = 250;

var button_height = 40;
var button_width = 100;
var button_margins = {"left": 10, "top": 10};

var size_button, color_button;
var color_tooltip_open = false;
var size_tooltip_open = false;

var color_channel;
var size_channel;

var size_channel_default = "Radius";
var color_channel_default = "Temperature";
var size_channel_keys_group, color_channel_keys_group;




function start()
{
  initializeVariables();
  getData();
  initializeContainers();
}

function initializeVariables()
{
  color_channel = color_channel_default;
  size_channel = size_channel_default;
}


function GenerateSizeTooltip()
{
  
  if (!size_tooltip_open)
  {
    size_tooltip_open = !size_tooltip_open;
    
    var tooltip = controllerGroup.append("g")
                              .attr("id", "size_button_tooltip")
                              .attr("transform", function()
                              {
                                var x_trans = button_margins.left;
                                var y_trans = button_height + 4*button_margins.top;
                                return "translate("+x_trans+", "+y_trans+")";
                              });
    
    tooltip.append("rect")
            .attr("height", button_height*4)
            .attr("width", button_width)
            .style("fill", "#80ffaa")
            .style("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.8);
    
    
    // Get size channel options
    var size_channel_options = ["Radius", "Temperature"];
    
    // 
    tooltip.append("text")
              .selectAll("tspan")
              .data(size_channel_options).enter()
              .append("tspan") 
              .attr("x", 5)
              .attr("y", function(d, i)
              {
                return 30 + i*30;
              })
              .attr("transform", "translate(20, 0)")
              .text(function(d) { return d; })
              .on("mouseover", function()
              {
                d3.select(this)
                      .style("font-size", "20px");
              })
              .on("mouseout", function()
              {
                d3.select(this).style("fill", "black")
                      .style("font-size", "16px");
              })
              .on("click", function(d)
              {
                size_channel = d;
                GenerateSizeTooltip();
                resetSizeChannel();
              });
            
  }
  else
  {
    size_tooltip_open = !size_tooltip_open;
    d3.select("#size_button_tooltip").remove();
  }
  
}

function resetSizeChannel()
{
  // Reset channel button text
  d3.select("#size_button_text")
    .html(size_channel)
    .attr("transform", function()
    {
      var x_trans;
      x_trans = (size_channel == "Temperature") ? 10 : 25;
      return "translate("+x_trans+", 35)";
    });
  
  
  // Reset scale
  var data = [];
  for (var i in currently_plotted_objects)
  {
    for (var j=0; j < currently_plotted_objects[i].length; j++)
    {
      data.push(currently_plotted_objects[i][j])
    }
  }
  if (data.length == 0)
  {
    return;
  }
  
  
  // Obtain the bounds on plot
  [min_mass, max_mass, max_temp, max_radius] = reinitBounds(data);
  
  // Define scales
  
  if (size_channel == "Radius")
  {
    rPlotScale = d3.scaleLinear()
              .domain([0, max_radius])
              .range([10, 25]);
  }
  else if (size_channel == "Temperature")
  {
    rPlotScale = d3.scaleLinear()
              .domain([0, max_temp])
              .range([5, 25]);
  }
  
  
  for (var i in currently_plotted_objects)
  {
    for (var j=0; j < currently_plotted_objects[i].length; j++)
    {
      var planet_dom = d3.select("#"+i+"_exoplanet_"+j);
      generatePlot(planet_dom);   
    }
  }
}






function GenerateColorTooltip()
{
  
  if (!color_tooltip_open)
  {
    color_tooltip_open = !color_tooltip_open;
    
    var tooltip = controllerGroup.append("g")
                              .attr("id", "color_button_tooltip")
                              .attr("transform", function()
                              {
                                var x_trans = button_width + 3.5*button_margins.left;
                                var y_trans = button_height + 4*button_margins.top;
                                return "translate("+x_trans+", "+y_trans+")";
                              });
    
    tooltip.append("rect")
            .attr("height", button_height*4)
            .attr("width", button_width)
            .style("fill", "#80ffaa")
            .style("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.8);
    
    
    // Get size channel options
    var color_channel_options = ["Radius", "Temperature"];
    
    // 
    tooltip.append("text")
              .selectAll("tspan")
              .data(color_channel_options).enter()
              .append("tspan") 
              .attr("x", 5)
              .attr("y", function(d, i)
              {
                return 30 + i*30;
              })
              .attr("transform", "translate(20, 0)")
              .text(function(d) { return d; })
              .on("mouseover", function()
              {
                d3.select(this)
                      .style("font-size", "20px");
              })
              .on("mouseout", function()
              {
                d3.select(this).style("fill", "black")
                      .style("font-size", "16px");
              })
              .on("click", function(d)
              {
                color_channel = d;
                GenerateColorTooltip();
                resetColorChannel();
              });
            
  }
  else
  {
    color_tooltip_open = !color_tooltip_open;
    d3.select("#color_button_tooltip").remove();
  }
  
}

function resetColorChannel()
{
  updateColorKey();
  // Reset channel button text
  d3.select("#color_button_text").html(color_channel);
  
  
  // Reset scale
  var data = [];
  for (var i in currently_plotted_objects)
  {
    for (var j=0; j < currently_plotted_objects[i].length; j++)
    {
      data.push(currently_plotted_objects[i][j])
    }
  }
  if (data.length == 0)
  {
    return;
  }
  
  
  // Obtain the bounds on plot
  [min_mass, max_mass, max_temp, max_radius] = reinitBounds(data);
  
  // Define scales
  
  if (color_channel == "Radius")
  { 
    colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, max_radius]);
  }
  else if (color_channel == "Temperature")
  {
    colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_temp]);
  }
  
  
  for (var i in currently_plotted_objects)
  {
    for (var j=0; j < currently_plotted_objects[i].length; j++)
    {
      var planet_dom = d3.select("#"+i+"_exoplanet_"+j);
      generatePlot(planet_dom);   
    }
  }
}



function setupChannelKeys()
{
  
  
  // Color Channel Keys
  color_channel_keys_group = visContainer.append("g")
                        .attr("id", "color_keys_container")
                        .attr("transform", function()
                        {
                          var y_trans = 2*controller_height;
                          return "translate("+820+", "+y_trans+")"
                        });
  
  // keys background
  color_channel_keys_group.append("rect")
                  .attr("height", keys_height)
                  .attr("width", keys_width)
                  .style("fill", controller_container_color)
                  .style("stroke", "black")
                  .style("stroke-width", "2px");
  
  
  color_channel_keys_group.append("text").attr("id", "color_channel_key_text")
                  .attr("transform", function()
                  {
                    return "translate(60, 20)";
                  })
                  .text(function(d) { return "Color Channel Key"; })
                  .attr("text-anchor", "start")
                  .style("fill", "white");
  
  
  
  color_channel_keys_group.append("text").attr("id", "color_channel_key_text")
                  .attr("transform", "translate(8, 80)")
                  .text(function(d) { return "Min"; })
                  .attr("text-anchor", "start")
                  .style("fill", "white");
  
  
  
  color_channel_keys_group.append("text").attr("id", "color_channel_key_text")
                  .attr("transform", "translate(215, 80)")
                  .text(function(d) { return "Max"; })
                  .attr("text-anchor", "start")
                  .style("fill", "white");
  
  updateColorKey();
  
  
}



  
function updateColorKey()
{
  d3.selectAll(".colorKeys").remove();
  
  var max_range_ = 100;
  var step_size = 2;
  
  // https://bl.ocks.org/d3indepth/89ced137bece23b908cf51580d5e082d
  var linearScale = d3.scaleLinear()
	.domain([0, max_range_])
	.range([0, 240]);
  
  var keyColorScale;
  if (color_channel == "Temperature")
  {
    keyColorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_range_]);
  }
  else
  {
    keyColorScale = d3.scaleSequential(d3.interpolateCool).domain([0, max_range_]);
  }
  
  
  
  var myData = d3.range(0, max_range_, step_size);
  
  color_channel_keys_group.selectAll('rect')
                          .data(myData)
                          .enter()
                          .append('rect')
                          .attr("class", "colorKeys")
                          .attr('x', function(d) 
                          {
                            return linearScale(d);
                          })
                          .attr("y", 30)
                          .attr('width', 11)
                          .attr('height', 30)
                          .style('fill', function(d) 
                          {
                            return keyColorScale(d);
                          });
}



function setupControllers()
{
  
  setupChannelKeys();
  
  
  // Setup controller group
  controllerGroup = visContainer.append("g")
                        .attr("id", "controller_container")
                        .attr("transform", function()
                        {
                          return "translate("+820+", "+margin.top+")"
                        });
  
  
  
  // Controller background
  controllerGroup.append("rect")
                  .attr("height", controller_height)
                  .attr("width", controller_width)
                  .style("fill", controller_container_color)
                  .style("stroke", "black")
                  .style("stroke-width", "2px");
                        

  
   
  
  
  
  // Size channel
  controllerGroup.append("text")
                  .attr("transform", function()
                  {
                    var x_trans;
                    x_trans = (size_channel == "Temperature") ? 0 : 10;
                    return "translate("+x_trans+", "+25+")";
                  })
                  .text("Radius Channel")
                  .attr("text-anchor", "start")
                  .attr("fill", "white");
  
  size_button = controllerGroup.append("g")
                        .data([size_channel])
                        .attr("id", "size_channel")
                        .attr("transform", "translate("+button_margins.left+","+3*button_margins.top+")")
                        .on("mouseover", function(d)
                        {
                          var self = d3.select(this);
                          self.style("opacity", 0.5);
                        })
                        .on("mouseout", function(d)
                        {
                          var self = d3.select(this);
                          var text = d3.select("#size_button_text");
                          
                          self.style("opacity", 1)
                              .style("fill", "white");
                          
                          text.style("fill", "black");
                          
                        })
                        .on("click", function(d)
                        {
                          d3.select(this).attr("opacity", 0.5);
                          GenerateSizeTooltip(); 
                        });
  
  
  
  size_button.append("rect")
                  .attr("height", button_height)
                  .attr("width", button_width)
                  .attr("transform", "translate(0, "+button_margins.top+")")
                  .style("fill", "#80ffaa")
                  .style("stroke", "black")
                  .style("stroke-width", "2px");
  
  size_button.append("text").attr("id", "size_button_text")
                  .attr("transform", "translate("+25+", "+3.5*button_margins.top+")")
                  .text(function(d) { return d; })
                  .attr("text-anchor", "start");
  
  
  
  
  
                  
  // Color channel
  controllerGroup.append("text")
                  .attr("transform", function()
                  {
                    var x_trans = button_width + 4*button_margins.left;
                    return "translate("+x_trans+", "+25+")";
                  })
                  .text("Color Channel")
                  .attr("text-anchor", "start")
                  .attr("fill", "white");
  
  color_button = controllerGroup.append("g")
                        .data([color_channel])
                        .attr("id", "color_channel")
                        .attr("transform", "translate("+2.5*button_margins.left+","+3*button_margins.top+")")
                        .on("mouseover", function(d)
                        {
                          var self = d3.select(this);
                          self.style("opacity", 0.5);
                          
                        })
                        .on("mouseout", function(d)
                        {
                          var self = d3.select(this);
                          var text = d3.select("#color_button_text");
                          
                          self.style("opacity", 1)
                              .style("fill", "white");
                          
                          text.style("fill", "black");
                          
                        })
                        .on("click", function(d)
                        {
                          d3.select(this).attr("opacity", 0.5);
                          GenerateColorTooltip(); 
                          
                        });
  
  
  
  color_button.append("rect")
                  .attr("height", button_height)
                  .attr("width", button_width)
                  .attr("transform", function()
                  {
                    var x_trans = button_width + button_margins.left;
                    return "translate("+x_trans+", "+button_margins.top+")";
                  })
                  .style("fill", "#80ffaa")
                  .style("stroke", "black")
                  .style("stroke-width", "2px");
  
  
  color_button.append("text").attr("id", "color_button_text")
                  .attr("transform", function()
                  {
                    var x_trans = button_width + 2*button_margins.left;
                    return "translate("+x_trans+", "+3.5*button_margins.top+")";
                  })
                  .text(function(d) { return d; })
                  .attr("text-anchor", "start");
  
  
 
  
}

function initializeContainers()
{
  mainContainer = d3.select("body").append("div").attr("id", "main_container");
  setupVisContainer();
  setupControllers();
}




function setupChartGroup(data)
{
  
  var xAxis, yAxis;
  
  // Get count
  total_number_exoplanets = 0;
  for (var disc_method in DISCOVERY_METHODS)
  {
    total_number_exoplanets += DISCOVERY_METHODS[disc_method].length;
  }
  
   // Total planets
  d3.select("#num_planets_text").remove();
  visContainer.append("text").attr("id", "num_planets_text").attr("class", "text")
                          
                           .text(function()
                           {
                             return "Total Number Planets Discovered: " + total_number_exoplanets;
                           })
                           .style("font-family", "monospace")
                           .style("font-size", "18px")
                           .style("fill", text_color)
                           .attr("transform", "translate(200, 75) rotate(0)");
  
  
  // Obtain the bounds on plot
  [min_mass, max_mass, max_temp, max_radius] = getPlotBounds(data);
  
  
  // Define scales
  xScale = d3.scaleLinear()
              .domain([min_mass, max_mass])
              .range([0, svg_plot_width])

  yScale = d3.scaleLinear()
              .domain([0, max_temp])
              .range([svg_plot_height*2 + margin.top, svg_plot_height + margin.top]);
  
  
  rScale = d3.scaleLinear()
              .domain([0, max_radius])
              .range([10, 25]);
  
  
  // https://github.com/d3/d3-scale
  colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_temp]);
  
  
  // Random color scale
  randomColorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, discovery_method_list.length]);
  
  // Define axes
  
  xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale);
  
  
  // Add X Axis
  chartGroup.append("g")
              .attr("class", "axes")
              .style("opacity", 1)
              .attr("transform", function()
              {
                return "translate(0,"+svg_plot_height*1.3+")"
              })
              .call(xAxis);
  
  // X axis text
  chartGroup.append("text")
              .attr("font-family", "monospace")
              .attr("font-size", "20px")
              .text("Mass, respective to Jupiter [kg]")
              .attr("transform", function()
              {
                return "translate("+0.5*chart_group_margin.left+","+svg_plot_height*1.41+")";
              })
              .attr("class", "chart_text")
              .style("fill", text_color); 

  // Add Y Axis
  planetsGroup.append("g")
              .attr("class", "axes")
              .style("opacity", 1)
              .attr("transform", "translate(-20,0)")
              .call(yAxis);
  
  // y axis text
  planetsGroup.append("text")
              .attr("font-family", "monospace")
              .attr("font-size", "20px")
              .text("Effective Temperature [K]")
              .attr("transform", function()
              {
                return "translate("+(-chart_group_margin.left/2*0.8)+","+2.1*svg_plot_height+") rotate(270)";
              })
              .attr("class", "chart_text")
              .style("fill", text_color);
}

function setupVisContainer()
{
  
  // Main SVG container
  visContainer = mainContainer.append("div")
                              .attr("id", "vis_container")
                              .append("svg")
                              .attr("width", svg_container_width)
                              .attr("height", svg_container_height);
  
  
  // Vis container background
  visContainer.append("rect").attr("height", svg_container_height)
                             .attr("width", svg_container_width)
                             .style("fill", svg_container_color)
                             .style("stroke", "black");
                            
  
  // Chart GROUP
  chartGroup = visContainer.append("g")
                              .attr("id", "chart_group")
                              .attr("width", svg_plot_width)
                              .attr("height", svg_plot_height)
                              .attr("transform", function()
                              {
                                var new_y = svg_plot_height + chart_group_margin.top;
                                return "translate("+margin.left+","+new_y+")";
                              });
  
  // Plot background
  chartGroup.append("rect").attr("height", svg_plot_height)
                           .attr("width", svg_plot_width)
                           .style("fill", chart_background)
                           .style("stroke", "none");
  
   // Title
  visContainer.append("text").attr("class", "text")
                             .attr("x", 200)
                             .attr("y", 40)
                             .text("Exoplanet Discovery Methods")
                             .style("font-family", "monospace")
                             .style("font-size", "38px")
                             .style("fill", text_color);
  
  
  
  
  // Planets GROUP
  planetsGroup = visContainer.append("g").attr("id", "planets_group")
                              .attr("height", svg_plot_height)
                              .attr("width", svg_plot_width)
                              .attr("transform", "translate("+margin.left+","+margin.top+")");
  
  // Planets group Background
  planetsGroup.append("rect").attr("height", svg_plot_height)
                             .attr("width", svg_plot_width)
                             .style("fill", svg_container_color)
                             .style("stroke", "grey");
  
  
}





var discovery_method_to_name = {};
var currently_plotted_objects = {};
var total_number_exoplanets = 0;




function getData()
{
  var keys, discovery_name;
  
  DISCOVERY_METHODS = {};
  method_move_tracker = {};    
  
  d3.csv("data/planets.csv")
  .row(function(data)
  {
    keys = Object.keys(data);
    
    data_dictionary = { discovery_method:     data.pl_discmethod,
                        planets_in_system:    Number(data.pl_pnum.trim()),
                        orbital_period:       Number(data.pl_orbper.trim()),
                        planet_mass:          Number(data.pl_bmassj.trim()),
                        planet_radius:        Number(data.pl_radj.trim()),
                        planet_letter:        data.letter,
                        planet_temp:          Number(data.st_teff.trim()),
                        planet_inclination:   Number(data.pl_orbincl.trim()) 
                      };

    
    // Create discovery type set:
    if (!(data.pl_discmethod in DISCOVERY_METHODS))
    {
      DISCOVERY_METHODS[data.pl_discmethod] = [data_dictionary];
      discovery_name = data.pl_discmethod.replace(/\s+/g, '');
      discovery_method_to_name[discovery_name] = data.pl_discmethod;
      method_move_tracker[discovery_name] = false;
    }
    else
    {
      DISCOVERY_METHODS[data.pl_discmethod].push(data_dictionary);
    }
    
    
    return data_dictionary;
  })
  .get(function(error, data)
  {
    console.log(data);
    setupChartGroup(data);
    generateVisualization(data);
    
  });
}
  



function getPlotBounds(data)
{
  var min_mass, max_mass, max_temp, max_radius;
  
  // Find max mins
  min_mass = d3.min(data, function(d) 
  { 
    return d.planet_mass;  
  });

  max_mass = d3.max(data, function(d) 
  { 
    return d.planet_mass;  
  });

  max_temp = d3.max(data, function(d)
  { 
    return d.planet_temp;  
  });
  
  max_radius = d3.max(data, function(d)
  { 
    return d.planet_radius;  
  });
  
  return [min_mass, max_mass, max_temp, max_radius];
}


var data_transition = d3.transition()

function generatePlot(data)
{
  
  // Adjust cx
  data.transition()
        .duration(500)
        .attr("cx", function(d, i) 
        { 
          return xScale(d.planet_mass); 
        })
        .attr("cy", function(d, i)
        {
          return yScale(d.planet_temp);
        })
        .style("opacity", 0.8)
        .style("fill", function(d, i)
        {
          var new_c;
    
          if (color_channel == "Radius")
          {
            new_c = colorScale(d.planet_radius);
          }
          else if (color_channel == "Temperature")
          {
            new_c = colorScale(d.planet_temp);
          }
          return new_c;
        })
        .attr("r", function(d, i) 
        { 
          var new_r;
    
          if (size_channel == "Radius")
          { 
            var planet_r;
            
            planet_r = (!d.planet_radius) ? 0 : d.planet_radius;
            new_r = rPlotScale(planet_r);
          }
          else if (size_channel == "Temperature")
          {
            var planet_r = (!d.planet_radius) ? 0 : d.planet_radius;
            new_r = rPlotScale(planet_r);
          }
          return new_r;
        })
        .duration(1000)
        .ease(d3.easeElasticOut);
}








function reinitBounds(data)
{
  var min_mass, max_mass, max_temp, max_radius;
  
  // Find max mins
  min_mass = d3.min(data, function(d) 
  { 
    return d.planet_mass;  
  });

  max_mass = d3.max(data, function(d) 
  { 
    return d.planet_mass;  
  });

  max_temp = d3.max(data, function(d)
  { 
    return d.planet_temp;  
  });
  
  max_radius = d3.max(data, function(d)
  { 
    return d.planet_radius;  
  });
  
  return [min_mass, max_mass, max_temp, max_radius];
}


function reinitializePlot(current_class, already_plotted)
{
  var min_mass, max_mass, max_temp, max_radius;
  var xAxis, yAxis;
  var data;
  
  var data = [];
  
  for (var i in currently_plotted_objects)
  {
    for (var j=0; j < currently_plotted_objects[i].length; j++)
    {
      data.push(currently_plotted_objects[i][j])
    }
  }
  if (data.length == 0)
  {
    return;
  }
  

  
  // Obtain the bounds on plot
  [min_mass, max_mass, max_temp, max_radius] = reinitBounds(data);
  
  
  // Define scales
  
  
  yScale = d3.scaleLinear()
              .domain([0, max_temp])
              .range([svg_plot_height*2 + margin.top, svg_plot_height + margin.top]);
  
  if (size_channel == "Radius")
  {
    rPlotScale = d3.scaleLinear()
              .domain([0, max_radius])
              .range([10, 25]);
  }
  else if (size_channel == "Temperature")
  {
    rPlotScale = d3.scaleLinear()
              .domain([0, max_temp])
              .range([5, 25]);
  }
  
  
  // https://github.com/d3/d3-scale
  colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_temp]);
  
  
  // Random color scale
  randomColorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, discovery_method_list.length]);
  
  // Define axes
  
  xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale);
  
  
  d3.selectAll(".axes").remove();
  
  // Add X Axis
  chartGroup.append("g")
              .attr("class", "axes")
              .style("opacity", 0)
              .attr("transform", "translate(0,"+svg_plot_height*1.3+")")
              .call(xAxis);
  

  // Add Y Axis
  planetsGroup.append("g")
              .attr("class", "axes")
              .style("opacity", 0)  
              .attr("transform", "translate(-20,0)")
              .call(yAxis);
  
}
        
function transitionToPlot(current_class, already_plotted)
{
  var self, color_index, new_color;
  
  if (already_plotted)
  {
    color_index = Math.floor(Math.random() * discovery_method_list.length);
    new_color = randomColorScale(color_index);
    random_mean_x = generateMean(svg_plot_width);
    random_mean_y = generateMean(svg_plot_height);
  }
  
  resetSizeChannel();
  resetColorChannel();
  
  
  
  
  d3.selectAll("."+current_class).each(function(d,i)
  {
    if (method_move_tracker[current_class])
    {
      if (currently_plotted_objects[current_class])
      {
        currently_plotted_objects[current_class].push(d);
      }
      else
      {
        currently_plotted_objects[current_class] = [];
      }
    }
    else
    {
      delete currently_plotted_objects[current_class];
    }
  });
  

  reinitializePlot(current_class, already_plotted);

  d3.selectAll(".axes").transition().duration(500).style("opacity", 1);
  
  d3.selectAll("."+current_class).each(function(d,i)
  {
    self = d3.select(this);
    (!already_plotted) ? generatePlot(self) : reinitializeGroup(self, current_class, new_color, random_mean_x, random_mean_y);
  });
  
  
  for (var i in currently_plotted_objects)
  {
    if (i != current_class)
    {
      for (var j=0; j < currently_plotted_objects[i].length; j++)
      {
        var planet_dom = d3.select("#"+i+"_exoplanet_"+j);
        generatePlot(planet_dom);   
      }
    }
  }
}



function updateIndividual(d, current_class, object_id, expand)
{
  var already_plotted = method_move_tracker[current_class];
  var exoplanet = d3.select(object_id);
  if (expand && already_plotted)
  {
    exoplanet.transition().duration(500)
                          .attr("r", function()
                          {
                            return (size_channel == "Radius") ? rPlotScale(d.planet_radius)*2 : rPlotScale(d.planet_temp)*2;
                          })
                          .style("stroke", "red")
                          .style("stroke-width", "6px");
  }
  else if (!expand && already_plotted)
  {
    exoplanet.transition().duration(200)
                          .attr("r", function()
                          {
                            return (size_channel == "Radius") ? rPlotScale(d.planet_radius)*1.25 : rPlotScale(d.planet_temp)*1.25;
                          })
                          .style("stroke", "black")
                          .style("stroke-width", "1px");
  }
}


function updateGroup(current_class, expand)
{
  var radius_change;
  var already_plotted;
  
  // Check if it is already plotted
  already_plotted = method_move_tracker[current_class];
  var color_change = (expand && already_plotted) ? "green" : "black";
  var stroke_width_change = (expand && already_plotted) ? "4px" : "1px";
  
  
  
  
  d3.selectAll("."+current_class).each(function(d,i)
  {
    d3.select(this).transition()
                      .duration(200)
                      .attr("r", function(d, i)
                      {
                        if (already_plotted)
                        {
                          if (expand)
                          {
                            radius_change = (size_channel == "Radius") ? rPlotScale(d.planet_radius)*1.25 : rPlotScale(d.planet_temp)*1.25;
                          }
                          else
                          {
                            radius_change = (size_channel == "Radius") ? rPlotScale(d.planet_radius) : rPlotScale(d.planet_temp);
                          }
                        }
                        else
                        {
                          if (expand)
                          {
                            radius_change = rScale(d.planet_radius)*1.25 
                          }
                          else
                          {
                            radius_change = rScale(d.planet_radius);  
                          }
                        }
      
      
                        return radius_change;
                      })
                      .style("stroke", color_change)
                      .style("stroke-width", stroke_width_change);
  });
  
  
}


function generateMean(plot_dimension)
{
  var random_mean, good_mean;
  
  good_mean = false;
  while (!good_mean)
  {
    random_mean = (Math.random() * plot_dimension);

    if (!((random_mean < plot_dimension*0.1) || (random_mean > plot_dimension*.9)))
    {
      good_mean = true;
    }
  }
  return random_mean;
}



function getStats(exoplanets)
{
  var totalRadii = 0;
  var totalTemps = 0;
  var totalIncs = 0;
  var totalPeriods = 0;
  
  var validRadiiCounter = 0;
  var validTempCounter = 0;
  var validIncCounter = 0;
  var validPeriodCounter = 0;
  
  var aveRadius, aveTemp, aveInc, avePeriod;
  
  for (var j=0; j < exoplanets.length; j++)
  {
    // get ave radius
    totalRadii += exoplanets[j].planet_radius;
    if (exoplanets[j].planet_radius)
    {
      validRadiiCounter++;
    }
    
    // get ave temp
    totalTemps += exoplanets[j].planet_temp;
    if (exoplanets[j].planet_temp)
    {
      validTempCounter++;
    }
    
    
    // get ave inclination
    totalIncs += exoplanets[j].planet_inclination;
    if (exoplanets[j].planet_inclination)
    {
      validIncCounter++;
    }
    
    // get ave orbital period
    totalPeriods += exoplanets[j].orbital_period;
    if (exoplanets[j].orbital_period)
    {
      validPeriodCounter++;
    }
    
    
    
  }
  
  aveRadius = totalRadii / validRadiiCounter;
  aveTemp = totalTemps / validTempCounter;
  aveInc = totalIncs / validIncCounter;
  avePeriod = totalPeriods / validPeriodCounter;
  
  return [aveRadius, aveTemp, aveInc, avePeriod];
}


  
function reinitializeGroup(data, current_class, new_color, random_mean_x, random_mean_y)
{
  var x, y, z, standard;
  
  data.transition().duration(300)
    .attr("cx", function()
    {
      standard = gaussian(random_mean_x, 20);
      z = standard();
      x = d3.max([d3.min([z, svg_plot_width]), 0]);
      return x;
    })
    .attr("cy", function()
    {
      standard = gaussian(random_mean_y, 20);
      z = standard();
      y = d3.max([d3.min([z, svg_plot_height]), 0]);
      return y;
    })
    .style("fill", new_color)
    .style("opacity", 1)
    .style("stroke", "black")
    .duration(1500)
    .ease(d3.easeElasticOut);
}


function updateToolTip(self, d, display)
{
  var current_class, already_plotted, other_text_size, method, text_data;
  
  
  d3.selectAll(".text_info").remove();
  
  other_text_size = "24px";
  current_class = self.attr("class");
  already_plotted = method_move_tracker[current_class]; 
  
  var number_current_class;
  for (var disc_method in DISCOVERY_METHODS)
  {
    if (disc_method == discovery_method_to_name[current_class])
    {
      number_current_class = DISCOVERY_METHODS[disc_method].length;
      
      var [averageRadius, averageTemp, averageInclination, avePeriod] = getStats(DISCOVERY_METHODS[disc_method]);
    }
  }
  
  var percentage_current_disc = number_current_class/total_number_exoplanets*100
  
  
  
  if (display)
  {
    var text_;
    text_data = [self.attr("class"), 
                number_current_class, 
                percentage_current_disc,
                averageRadius,
                averageTemp,
                avePeriod,
                averageInclination];
    
    method = self.attr("class");
    planetsGroup.append("text").attr("class", "text_info").selectAll("tspan").data(text_data)
                        .enter().append("tspan")
                          .attr("x", svg_plot_width*1.01)
                          .style("fill", text_color)
                          .attr("y", function(d, i)
                          {
                            return margin.top*2.7 + i*20;
                          })
                          .text(function(d, i) 
                          { 
                          
                            if (i == 0)
                            {
                              text_ = "Method: " + discovery_method_to_name[d]  
                            }
                            else if (i == 1)
                            {
                              text_ = "Number Exoplanets: " + d;
                            }
                            else if (i == 2)
                            {
                              text_ = "Proportion of Total: " + d.toFixed(2) + "%";
                            }
                            else if (i == 3)
                            {
                              text_ = "Average Radius: " + d.toFixed(2)  + " [Jupiter Radii]";
                            }
                            else if (i == 4)
                            {
                              text_ = "Average Temp: " + d.toFixed(2) + " [K]";
                            }
                            else if (i == 5)
                            {
                              text_ = "Average Orbital Period: " + d.toFixed(2) + " [Days]";
                            }
                            else if (i == 6)
                            {
                              text_ = "Average Inclination: " + d.toFixed(2) + " [deg]";
                            }
                           
                            
                            
                            return text_;
                          })
                          .style("font-family", "monospace").style("opacity", 0)
                          .style("font-size", "18px")
                          .transition().duration(600).style("opacity", 1);
  }
  
  // Exoplanet information
  if (already_plotted && display)
  {
    var planet_data = [];
    var planet_dict = {};
    
    for (var i in d)
    {
      planet_data.push(i);
      planet_dict[i] = d[i];
    }
    
    planetsGroup.append("text").attr("class", "text_info").selectAll("tspan").data(planet_data)
                        .enter().append("tspan")
                          .attr("x", svg_plot_width*1.005)
                          .style("fill", text_color)
                          .attr("y", function(d, i)
                          {
                            return svg_plot_height + margin.top*0.9 + (i+1)*20;
                          })
                          .text(function(d, i) 
                          { 
                              if (i == 0)
                              {
                                text_ = "Discovery method: " + planet_dict[d];  
                              }
                              else if (i == 1)
                              {
                                text_ = "Planets in system: " + planet_dict[d];  
                              }
                              else if (i == 2)
                              {
                                if (!planet_dict[d])
                                {
                                  text_ = "Oribtal Period: Not Determined"
                                }
                                else
                                {
                                  text_ = "Oribtal Period: " + planet_dict[d] + " [days]";     
                                }
                              }
                              else if (i == 3)
                              {
                                if (!planet_dict[d])
                                {
                                  text_ = "Planet mass: Not Determined"
                                }
                                else
                                {
                                  text_ = "Planet mass: " + planet_dict[d] + " [Jupiter (kg)]";      
                                }
                                 
                              }
                              else if (i == 4)
                              {
                                if (!planet_dict[d])
                                {
                                  text_ = "Planet radius: Not Determined"
                                }
                                else
                                {
                                  text_ = "Planet radius: " + planet_dict[d] + " [Jupiters]";    
                                }
                                
                              }
                              else if (i == 5)
                              {
                                text_ = "";
                              }
                              else if (i == 6)
                              {
                                text_ = "Planet temperature: " + planet_dict[d] + " [K]";  
                              }
                              else if (i == 7)
                              {
                                text_ = "Planet inclination: " + planet_dict[d] + " [deg]";  
                              }
//                              text_ = d + ": " + planet_dict[d];  
      
                              return text_;
                          })
                          .style("font-family", "monospace").style("opacity", 0)
                          .style("font-size", "18px")
                          .transition().duration(600).style("opacity", 1);
    
  }
}
  


function initializeGroups()
{ 
  var method_index, random_mean_x, random_mean_y;
  var current_method_objects;
  var r, x, y, z, standard;
  var self, current_class, already_plotted;
  
  randomColorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, discovery_method_list.length]);
  
  method_index = 0;
  for (method in DISCOVERY_METHODS)
  {
    current_method_objects = DISCOVERY_METHODS[method];
    
    random_mean_x = generateMean(svg_plot_width);
    random_mean_y = generateMean(svg_plot_height+margin.top);
    
    max_radius = d3.max(current_method_objects, function(d)
    {
      if (d.discovery_method == method)
      {
        return d.planet_radius;
      }
    })

    r = d3.scaleLinear()
            .domain([0, max_radius])
            .range([10, 25])
  
    
    
    exoplanets = planetsGroup.append("g")
                              .selectAll("circle").data(current_method_objects)  
                              .enter().append("circle")
                                .attr("class", function(d) { return method.replace(/\s+/g, ''); } )
                                .attr("id", function(d, i)
                                {
                                  return method.replace(/\s+/g, '') + "_exoplanet_"+i;
                                })
                                .attr("cx", function(d, i)
                                {
                                  standard = gaussian(random_mean_x, 20);
                                  z = standard();
                                  x = d3.max([d3.min([z, svg_plot_width]), 0]);
                                  return x;
                                })
                                .attr("cy", function(d, i)
                                {
                                  standard = gaussian(random_mean_y, 20);
                                  z = standard();
                                  y = d3.max([d3.min([z, svg_plot_height]), 0]);
                                  return y;
                                })
                                .attr("r",  function (d) { return rScale(d.planet_radius); })
                                .style("fill", function()
                                {
                                  return randomColorScale(method_index);
                                })
                                .style("opacity", 1)
                                .style("stroke", "black")
                                .on("mouseover", function(d, i)
                                { 
                                  
                                  self = d3.select(this);
                  
                                  current_class = self.attr("class");
                    
                                  var object_id = "#"+current_class+"_exoplanet_"+i;
                                  updateGroup(current_class, true);
                                  updateIndividual(d, current_class, object_id, true);
                                  updateToolTip(self, d, true)

                                })
                                .on("mouseout", function(d, i)
                                {
                                  self = d3.select(this);
                                  current_class = self.attr("class");
      
                                  var object_id = "#"+current_class+"_exoplanet_"+i;
                                  updateGroup(current_class, false);
                                  updateIndividual(d, current_class, object_id, false);
                                  updateToolTip(self, d, false);
                                })
                                .on("click", function(d, i)
                                { 
                                  current_class = d3.select(this).attr("class");
                
                                  // Check if it is already plotted
                                  already_plotted = method_move_tracker[current_class]; 
                                  
                                  // Update the method_move_tracker
                                  method_move_tracker[current_class] = !method_move_tracker[current_class];
      
                                  transitionToPlot(current_class, already_plotted);
                                  resetSizeChannel();
                                  resetColorChannel();
                                });
    
    method_index++;  
  }
  
}


function generateVisualization(data)
{
  var new_keys = Object.keys(DISCOVERY_METHODS);
  
  for (var key in DISCOVERY_METHODS)
  {
    discovery_method_list.push(key);
  }
  
  initializeGroups();
}