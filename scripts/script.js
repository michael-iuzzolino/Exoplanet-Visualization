
// http://stackoverflow.com/questions/17351016/set-up-python-simplehttpserver-on-windows
// Run    python -m http.server 8888    in index.html root
// Then go to http://localhost:8888/

var data_dictionary;
var DISCOVERY_METHODS;
var method_move_tracker;
var discovery_method_list = [];
var discovery_method_displayed;
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
var svg_container_width = 900;

var svg_plot_width = 600;
var svg_plot_height = 400;

var controls_container_height = 300;
var controls_container_width = 200;


var margin = {left:100, right:50, top:50, bottom:0};
var chart_group_margin = {left: 100, right: 50, top:100, bottom:0};

// Adjust mass to Jupiter
var jupiter_mass = 1.898e27;



var xScale, yScale, rScale, colorScale, randomColorScale;






function tickFn(_elapsed)
{
  return timer_ret_val;
}




function start()
{
  initializeVariables();
  initializeContainers();
  getData();
}


function initializeVariables()
{
  discovery_method_displayed = 'Transit';
}


function initializeContainers()
{
  mainContainer = d3.select("body").append("div").attr("id", "main_container");
  setupVisContainer();
  setupControlsContainer();
}






function setupChartGroup(data)
{
  
  var min_mass, max_mass, max_temp, max_radius;
  var xAxis, yAxis, axis_x_adjusted, axis_y_adjusted;
  
  
  // Obtain the bounds on plot
  [min_mass, max_mass, max_temp, max_radius] = getPlotBounds(data);
  
  
  // Define scales
  xScale = d3.scaleLinear()
              .domain([min_mass, max_mass])
              .range([0, svg_plot_width])

  yScale = d3.scaleLinear()
              .domain([0, max_temp])
              .range([svg_plot_height*2, svg_plot_height])
  
  
  rScale = d3.scaleLinear()
              .domain([0, max_radius])
              .range([10, 25])
  
  // https://github.com/d3/d3-scale
  colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_temp]);
  
  
  // Random color scale
  randomColorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, discovery_method_list.length]);
  
  // Define axes
  
  xAxis = d3.axisTop(xScale);
  yAxis = d3.axisLeft(yScale);
  
  axis_y_adjusted = svg_plot_height + chart_group_margin.top/2-0.5;
  axis_x_adjusted = 5;
  
  // Add Axes
  chartGroup.append("g")
              .attr("class", "axes")
              .attr("transform", "translate(0,"+axis_y_adjusted+")")
              .style("opacity", 1)
              .call(xAxis);

  chartGroup.append("g")
              .attr("class", "axes")
              .attr("transform", "translate(-0.5,49.5)")
              .style("opacity", 1)
              .call(yAxis);
  
  chartGroup.append("text")
              .attr("x", 0)
              .attr("y", 0)
              .attr("font-family", "monospace")
              .attr("transform", "translate(-50, 700) rotate(-90)")
              .text("Effective Temperature [K]")
              .attr("class", "chart_text");

  chartGroup.append("text")
              .attr("x", 250)
              .attr("y", 420)
              .attr("font-family", "monospace")
              .text("Mass, respective to Jupiter [kg]")
              .attr("class", "chart_text"); 
  
  
}

function setupVisContainer()
{
  visContainer = mainContainer.append("div").attr("id", "vis_container")
                              .append("svg")
                              .attr("width", svg_container_width)
                              .attr("height", svg_container_height);
  
  
  
  planetsGroup = visContainer.append("g").attr("id", "planets_group")
                              .attr("transform", "translate("+margin.left+","+margin.top+")");
  
  
  planetsGroup.append("rect").attr("height", svg_plot_height)
                             .attr("width", svg_container_width+200)
                             .style("fill", "#c299ff").style("stroke", "black");
  
  
  planetsGroup.append("rect").attr("y", svg_plot_height+chart_group_margin.top)
                             .attr("height", svg_plot_height)
                             .attr("width", svg_plot_width+200)
                             .style("fill", "white")
                             .style("stroke", "black");
  
  
  planetsGroup.append("text").attr("x", 25).attr("y", -4)
                            .text("Exoplanet Discovery Methods")
                            .style("font-family", "monospace")
                            .style("font-size", "46px");
  
  chartGroup = visContainer.append("g").attr("id", "chart_group").attr("y", svg_container_height)
                              .attr("transform", "translate("+chart_group_margin.left+","+chart_group_margin.top+")");
  
  
}


function setupControlsContainer()
{
  controlsContainer = mainContainer.append("div").attr("id", "controls_container")
                                    .attr("width", controls_container_width)
                                    .attr("height", controls_container_height)
                                    .style("margin-left", "20px");
}






function getData()
{
  var keys, discovery_name;
  
  DISCOVERY_METHODS = {};
  method_move_tracker = {};
  d3.csv("/data/planets.csv", function(data)
  {
    
  })
  .row( function(data)
  {
    keys = Object.keys(data);
  
    data_dictionary = { discovery_method: data.pl_discmethod,
                            planets_in_system: Number(data.pl_pnum.trim()),
                            orbital_period: Number(data.pl_orbper.trim()),
                            planet_mass: Number(data.pl_bmassj.trim()),
                            planet_radius: Number(data.pl_radj.trim()),
                            planet_letter: data.letter,
                            planet_temp: Number(data.st_teff.trim()),
                            planet_inclination: Number(data.pl_orbincl.trim()) }

    // Create discovery type set:
    if (!(data.pl_discmethod in DISCOVERY_METHODS))
    {
      DISCOVERY_METHODS[data.pl_discmethod] = [data_dictionary];
      discovery_name = data.pl_discmethod.replace(/\s+/g, '');
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
    setupChartGroup(data);
    generateVisualization(data);
    
//    setupDropDown();
  });
}
  



function getPlotBounds(data)
{
  var min_mass, max_mass, max_temp, max_radius;
  
  // Find max mins
  min_mass = d3.min(data, function(d) 
  { 
    if (d.discovery_method == discovery_method_displayed)
    {
      return d.planet_mass;  
    }
  });

  max_mass = d3.max(data, function(d) 
  { 
    if (d.discovery_method == discovery_method_displayed)
    {
      return d.planet_mass; 
    }
  });

  max_temp = d3.max(data, function(d)
  { 
    if (d.discovery_method == discovery_method_displayed)
    {
      return d.planet_temp;   
    }
  });
  
  max_radius = d3.max(data, function(d)
  {
    if (d.discovery_method == discovery_method_displayed)
    {
      return d.planet_radius;
    }
  })
  
  return [min_mass, max_mass, max_temp, max_radius];
}



function generatePlot(data)
{
  
  d3.selectAll(".axes .chart_text").transition().duration(300).style("opacity", 1);
  
  // Adjust cx
  data.transition().duration(250)
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
              return colorScale(d.planet_temp);
            })
            .attr("r", function(d, i) { return rScale(d.planet_radius); })
            .attr("transform", "translate(0,"+chart_group_margin.top+")");;
            
  

  
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

  d3.selectAll("."+current_class).each(function(d,i)
  {
    self = d3.select(this);
    (!already_plotted) ? generatePlot(self) : reinitializeGroup(self, current_class, new_color, random_mean_x, random_mean_y);
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


function updateGroup(current_class, expand)
{
  var radius_change;
  var color_change = (expand) ? "black" : "none";
  
  d3.selectAll("."+current_class).each(function(d,i)
  {
    d3.select(this).transition()
                      .duration(200)
                      .attr("r", function(d, i)
                      {
                        radius_change = (expand) ? rScale(d.planet_radius)*1.25 : rScale(d.planet_radius);
                        return radius_change;
                      })
                      .attr("stroke", color_change);
  });
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
      y = d3.max([d3.min([z, svg_plot_height]), 0]) - chart_group_margin.top;
      return y;
    })
    .style("fill", new_color)
    .style("opacity", 1)
    .style("stroke", "black");
}


function updateToolTip(self, display)
{
  var current_Class, already_plotted, other_text_size, method, text_data;
  
  console.log(self.attr("class"));
  console.log();
  
  
  d3.selectAll(".text_info").remove();
  d3.selectAll(".text_info_2").remove();
  
  other_text_size = "36px";
  current_class = self.attr("class");
  already_plotted = method_move_tracker[current_class]; 
  
  if (already_plotted)
  {
    other_text_size = "26px";
    method = self.attr("class");
    text_data = [method];
    
    planetsGroup.append("text").attr("class", "text_info_2").selectAll("tspan.plot_method_text").data(text_data)
                        .enter().append("tspan").attr("class", "plot_method_text")
                          .attr("x", 330)
                          .attr("y", 530)
                          .text(function(d) 
                          { 
                              return current_class;
                          })
                          
                          .style("font-family", "monospace")
                          .style("font-size", "32px");
  }
 
  
  if (display)
  {
    text_data = [self.attr("class")];
    method = self.attr("class");
    planetsGroup.append("text").attr("class", "text_info").selectAll("tspan").data(text_data)
                        .enter().append("tspan")
                          .attr("x", 25)
                          .attr("y", 35)
                          .text(function(d) 
                          { 
                              return d;
                          })
                          .style("font-family", "monospace")
                          .style("font-size", other_text_size);
  }
}
  


function initializeGroups()
{ 
  var method_index, random_mean_x, random_mean_y;
  var current_method_objects;
  var max_radius, r;
  var x, y, z, standard;
  var self, current_class, already_plotted;
  
  randomColorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, discovery_method_list.length]);
  
  method_index = 0;
  for (method in DISCOVERY_METHODS)
  {
    current_method_objects = DISCOVERY_METHODS[method];
    
    random_mean_x = generateMean(svg_plot_width);
    random_mean_y = generateMean(svg_plot_height);
    
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
                                  self = d3.select(this)
                                  current_class = self.attr("class");
                                  updateGroup(current_class, true);
                                  updateToolTip(self, true)

                                })
                                .on("mouseout", function(d, i)
                                {
                                  self = d3.select(this)
                                  current_class = self.attr("class");
                                  updateGroup(current_class, false);
                                  updateToolTip(self, false);
                                })
                                .on("click", function(d, i)
                                {
                                  current_class = d3.select(this).attr("class");
                                  already_plotted = method_move_tracker[current_class];                                
                                  transitionToPlot(current_class, already_plotted);
                                  method_move_tracker[current_class] = !method_move_tracker[current_class];
                                });
    
    method_index++;  
  }
  
  
  // Kick off the timer, and the action begins: 
  if (MOVEMENT)
  {
    d3.timer(tickFn);
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