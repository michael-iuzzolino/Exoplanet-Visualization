var discovery_method_to_name = {};
var currently_plotted_objects = {};

function getData()
{
  var keys, discovery_name;
  
  DISCOVERY_METHODS = {};
  method_move_tracker = {};    
  
  d3.csv("/data/planets.csv")
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



function generatePlot(data)
{
  
  // Adjust cx
  data.transition().duration(500)
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
  
  
  rScale = d3.scaleLinear()
              .domain([0, max_radius])
              .range([10, 25])
  
  
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
              .attr("transform", "translate(0,"+svg_plot_height+")")
              .call(xAxis);
  

  // Add Y Axis
  planetsGroup.append("g")
              .attr("class", "axes")
              .style("opacity", 0)
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


function generateMean(plot_dimension)
{
  var random_mean, good_mean;
  
  good_mean = false;
  while (!good_mean)
  {
    random_mean = (Math.random() * plot_dimension);

    if (!((random_mean < plot_dimension*0.2) || (random_mean > plot_dimension*.8)))
    {
      good_mean = true;
    }
  }
  return random_mean;
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
  
  
  d3.selectAll(".text_info").remove();
  d3.selectAll(".text_info_2").remove();
  
  other_text_size = "24px";
  current_class = self.attr("class");
  already_plotted = method_move_tracker[current_class]; 
  
  
 
  
  if (display)
  {
    text_data = [self.attr("class")];
    method = self.attr("class");
    planetsGroup.append("text").attr("class", "text_info").selectAll("tspan").data(text_data)
                        .enter().append("tspan")
                          .attr("x", 25)
                          .attr("y", svg_plot_height + margin.top*0.5)
                          .text(function(d) 
                          { 
                            var text_ = "Method: " + discovery_method_to_name[d]
                              return text_;
                          })
                          .style("font-family", "monospace").style("opacity", 0)
                          .style("font-size", other_text_size)
                          .transition().duration(600).style("opacity", 1);
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
      
                                  // Check if it is already plotted
                                  already_plotted = method_move_tracker[current_class];                    
      
                                  // Update the method_move_tracker
                                  method_move_tracker[current_class] = !method_move_tracker[current_class];
                                  transitionToPlot(current_class, already_plotted);
                                  
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