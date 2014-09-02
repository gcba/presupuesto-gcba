var custom_bubble_chart, referencias;

referencias = $(".referencias");

d3.csv("/data/presupuesto.csv", function(data) {

    var jurisdiccion = [];
    var finalidad = [];
    var totalesFinalidad = [];
    var totalesJurisdiccion = [];

    data.forEach(function(d) {

        if (jurisdiccion.indexOf(d.id_jurisdiccion) < 0) {
            jurisdiccion.push(d.id_jurisdiccion); // junto todos los ids
            totalesJurisdiccion.push(0);
        };
        if (finalidad.indexOf(d.finalidad) < 0) {
            finalidad.push(d.finalidad); // junto todos los ids
            totalesFinalidad.push(0);
        };

        totalesFinalidad[finalidad.indexOf(d.finalidad)] = parseInt(totalesFinalidad[finalidad.indexOf(d.finalidad)]) + parseInt(d.monto);
        totalesJurisdiccion[jurisdiccion.indexOf(d.id_jurisdiccion)] = parseInt(totalesJurisdiccion[jurisdiccion.indexOf(d.id_jurisdiccion)]) + parseInt(d.monto);

    });

    var finalidad2d = []; // armo array 2d para ordenar
    for (var i = 0; i < finalidad.length; i++){
        finalidad2d[i] = [finalidad[i] , totalesFinalidad[i]]; 
    }

    var jurisdiccion2d = []; // armo array 2d para ordenar
    for (var i = 0; i < jurisdiccion.length; i++){
        jurisdiccion2d[i] = [jurisdiccion[i] , totalesJurisdiccion[i]]; 
    }

    // armo array 2d ordenados
    finalidad2d = orderMultiDimensionalArray (finalidad2d, 1);
    jurisdiccion2d = orderMultiDimensionalArray (jurisdiccion2d, 1);

 
    custom_bubble_chart = (function(d3, CustomTooltip) {
        "use strict";

        var width = 1200,
            height = 500,
            tooltip = CustomTooltip("tooltip", 300),
            gravedad = -0.01,
            friction = 0.9,
            damper = 0.45,
            nodes = [],
            radioMinimo = 5,
            radioMaximo = 120,
            vis, force, circles, radius_scale,
            montosLiterales = function(n){return formatNumber(n*1)};
        var center = {
            x: width / 2,
            y: height / 2
        };


        var centroides_finalidad = {

            "3": {
                x: width / 6,
                y: height / 2
            },
            "4": {
                x: 2 * width / 6,
                y: height / 2
            },
            "1": {
                x: 3 * width / 6,
                y: height / 2
            },
            "2": {
                x: 4 * width / 6,
                y: height / 2
            },
            "5": {
                x: 5 * width / 6,
                y: height / 2
            }

        };

        var columnas = 4;
        var filas = 6;
        var correccion = 250;

        //IDs
        var centroides_jurisdiccion = {};
        var contador = [1, 1];

        for (var i = 0; i < jurisdiccion.length; i++) {
            centroides_jurisdiccion[jurisdiccion[i]] = {
                x: contador[0] * (width - correccion) / columnas,
                y: (height / filas) * contador[1]
            }
            contador[0]++;
            if (contador[0] === 5) {
                contador[0] = 1;
                contador[1]++;
            }
        }


        //var finalidad = ["Administración Gubernamental", "Deuda Pública - Intereses y Gastos", "Servicios de Seguridad", "Servicios Económicos", "Servicios Sociales"];

        var fill_color = d3.scale.ordinal()
            .domain(finalidad)
            .range(["#ECD078", "#D95B43", "#C02942", "#542437", "#53777A"]);

        function custom_chart(data) {
            var max_amount = d3.max(data, function(d) {
                    return parseInt(d.monto, 10);
                }),
                radius_scale = d3.scale.linear().domain([0, max_amount]).range([radioMinimo, radioMaximo]);

            //create node objects from original data
            //that will serve as the data behind each
            //bubble in the vis, then add each node
            //to nodes to be used later
            data.forEach(function(d) {
                var node = {
                    id: d.id_jurisdiccion,
                    radius: radius_scale(parseInt(d.monto, 10)),
                    monto: d.monto,
                    jurisdiccion: d.jurisdiccion,
                    id_jurisdiccion: d.id_jurisdiccion,
                    finalidad: d.finalidad,
                    id_finalidad: d.id_finalidad,
                    funcion: d.funcion,
                    id_funcion: d.id_funcion,
                    x: Math.random() * width,
                    y: Math.random() * height,
                };
                nodes.push(node);

                // console.log(nodes);
            });

            nodes.sort(function(a, b) {
                return b.monto - a.monto;
            });

            // var maxFinalidad = d3.max(data, function(d) { return d.y; }

            // console.log(nodes);

            vis = d3.select("#presupuesto-visualizado").append("svg")
                .attr("width", width)
                .attr("id", "svg_vis");

            circles = vis.selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", 0)
                .attr("fill", function(d) {
                    return fill_color(d.finalidad);
                })
                .attr("stroke-width", 1.5)
                .attr("stroke", function(d) {
                    return d3.rgb(fill_color(d.finalidad)).darker();
                })
                .attr("id", function(d) {
                    return "bubble_" + d.id;
                })
                .on("mouseover", function(d, i) {
                  var el = d3.select(this)
                      el.style("stroke-width",3);
                  show_details(d, i, this);
                })
                .on("mouseout", function(d, i) {
                  hide_details(d, i, this);
                  var el = d3.select(this)
                      el.style("stroke-width",1.5);
                });

            circles.transition().duration(1500).attr("r", function(d) {
                return d.radius;
            });

        }

        d3.selection.prototype.moveToFront = function() { 
              return this.each(function() { 
              this.parentNode.appendChild(this); 
              }); 
            };

        function charge(d) {
            if (d.value < 0) {
                return 0
            } else {
                //      return -Math.pow(d.radius,2.4)/7 
                return -Math.pow(d.radius,1.9)
                // return -(d.radius * (d.radius) / 1.2)
            };
        }

        function start() {
            //console.log('Inicio todo.');

            force = d3.layout.force()
                .nodes(nodes)
                .size([width, height]);
        }

        function mostrarGrupoCompleto() {
            // console.log('Inicio force.');
            force.gravity(gravedad)
                .charge(charge)
                .friction(friction)
                .on("tick", function(e) {
                    circles.each(moverAlCentro(e.alpha))
                        .attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        });
                });
            // console.log(force);
            force.start();
            borrarReferencias();
        }

        function moverAlCentro(alpha) {
            // console.log('Muevo objetos al centro.');
            return function(d) {
                d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
                d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
            };
        }

        function mostrarJurisdiccion() {
            force.gravity(gravedad)
                .charge(charge)
                .friction(friction)
                .on("tick", function(e) {
                    circles.each(ordenJurisdiccion(e.alpha))
                        .attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        });
                });
            force.start();
            borrarReferencias();
        }

        function ordenJurisdiccion(alpha) {
            return function(d) {
                var target = centroides_jurisdiccion[d.id_jurisdiccion];
                d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.2;
                d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.2;
            };
        }

        function mostrarFinalidad() {
            force.gravity(gravedad)
                .charge(charge)
                .friction(0.9)
                .on("tick", function(e) {
                    circles.each(ordenFinalidad(e.alpha))
                        .attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        });
                });
            force.start();
            titulosFinalidad();
        }


        function ordenFinalidad(alpha) {
            return function(d) {
                var target = centroides_finalidad[d.id_finalidad];
                d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.2;
                d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.2;
            };
        }


        function titulosFinalidad() {
            var finalidadId = {
                            "Servicios Sociales": (width-100)/5 * 1,
                            "Servicios Económicos": (width-100)/5 * 2,
                            "Administración Gubernamental": (width-100)/5 * 3  ,
                            "Servicios de Seguridad": (width-100)/5 * 4,
                            "Deuda Pública Intereses y Gastos": (width-100)/5 * 5
                          };

            var finalidadKeys = d3.keys(finalidadId);
            var finalidad = vis.append("g").classed("finalidad", true).attr("transform", "translate(0," + 20 + ")").selectAll(".finalidad").data(finalidadKeys);
                
                finalidad.enter()
                  .append("text")
                    .attr("class", "total")
                    .attr("x", function(d) { return finalidadId[d]; }  )
                    .attr("y", 20)
                    .attr("text-wrap", "normal")
                    .attr("text-anchor", "middle")
                    .text("$" +montosLiterales(8240909523));


                finalidad.enter()
                  .append("text")
                    .attr("class", "titulo")
                    .attr("x", function(d) { return finalidadId[d]; }  )
                    .attr("dy", "3em")
                    .attr("y", 5)
                    .attr("text-wrap", "normal")
                    .attr("text-anchor", "middle")
                    .text(function(d) { return d;})
                    .call(wrap, 130); 
                    

        }



        function borrarReferencias() {
            var finalidad = vis.selectAll(".finalidad").remove();
        }


        function show_details(data, i, element) {
            d3.select(element).attr("stroke", "black");
            var content = "<span class=\"name\">Finalidad:</span><span class=\"value\"> " + data.finalidad + "</span><br/>";
            content += "<span class=\"name\">Función:</span><span class=\"value\"> " + data.funcion + "</span><br/>";
            content += "<span class=\"name\">Jurisdicción:</span><span class=\"value\"> " + data.jurisdiccion + "</span><br/>";
            content += "<span class=\"name\">Monto:</span><span class=\"value\"> $" + addCommas(montosLiterales(data.monto)) + "</span>";
            tooltip.showTooltip(content, d3.event);
        }

        /*
    id_jurisdiccion
    jurisdiccion
    id_finalidad
    finalidad
    id_funcion
    funcion
    monto
    porcentaje
  */

        function hide_details(data, i, element) {
            d3.select(element).attr("stroke", function(d) {
                return d3.rgb(fill_color(d.finalidad)).darker();
            });
            tooltip.hideTooltip();
        }

        var presupuesto = {};
        presupuesto.init = function(_data) {
            custom_chart(_data);
            start();
        };

        // presupuesto.display_all = mostrarGrupoCompleto;
        // presupuesto.display_year = mostrarFinalidad;

        presupuesto.cambiarVista = function(ver_tipo) {
            if (ver_tipo == 'finalidad') {
                mostrarFinalidad();
                referencias.animate({opacity:0},250);
            } else if (ver_tipo == 'jurisdiccion') {
                mostrarJurisdiccion();
                referencias.animate({opacity:0},250);
            } else {
                mostrarGrupoCompleto();
                referencias.delay(300).animate({opacity:1},350);
            }
        };

        return presupuesto;
    })(d3, CustomTooltip);


    custom_bubble_chart.init(data);
    custom_bubble_chart.cambiarVista('todo');


});

function wrap(text, width) {

    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em"); // ver pos X
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("y", y).attr("x", x).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

var formatNumber = function(n,decimals) {
    var s, remainder, num, negativePrefix, negativeSuffix, prefix, suffix;
    suffix = ""
    negativePrefix = ""
    negativeSuffix = "";
    
    if (n >= 1000000000) {
        suffix = " mil millones"
        n = n / 1000000000
        decimals = 1
    } else if (n >= 1000000) {
        suffix = " millones"
        n = n / 1000000
        decimals = 1 
    } else if (n >= 100000) {
        suffix = ""
        n = n / 100000
        decimals = 1
    } 
    
    
    prefix = ""
    if (decimals > 0) {
        if (n<1) {prefix = "0"};
        s = String(Math.round(n * (Math.pow(10,decimals))));
        if (s < 10) {
            remainder = "0" + s.substr(s.length-(decimals),decimals);
            num = "";
        } else{
            remainder = s.substr(s.length-(decimals),decimals);
            num = s.substr(0,s.length - decimals);
        }
        
        
        return  negativePrefix + prefix + num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "." + remainder + suffix + negativeSuffix;
    } else {
        s = String(Math.round(n));
        s = s.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        return  negativePrefix + s + suffix + negativeSuffix;
    }
};




function sortNumber(a,b) {
    return a - b;
}

function orderMultiDimensionalArray (toOrderArray, campo) {
    position = new Array();
    newRow = new Array();
    jQuery.each(toOrderArray, function(key, row) {
            regis = row[campo];
            position[key]  = [regis, key];
            newRow[key] = toOrderArray[key];
    });

    position.sort(sortNumber);
    
    returnArray = new Array();
    jQuery.each(position, function(key, row) {
            pos = position[key][1];
            returnArray[key] = newRow[pos];
    });             
    
    return returnArray;
}


$(document).ready(function() {

  // d3.csv("/data/presupuesto.csv", function(data) {
  //   custom_bubble_chart.init(data);
  //   custom_bubble_chart.cambiarVista('finalidad');
  // });
  
  $('#view_selection a').click(function() {
    var ver_tipo = $(this).attr('id');
    $('#view_selection a').removeClass('active');
    $(this).toggleClass('active');
    custom_bubble_chart.cambiarVista(ver_tipo);
    return false;
  });

});