var custom_bubble_chart;

d3.csv("/data/presupuesto.csv", function(data) {

    var labels = [];

    data.forEach(function(d) {
        if (labels.indexOf(d.id_jurisdiccion) < 0) {
            labels.push(d.id_jurisdiccion); // junto todos los ids
        };
    });

    labels.sort();

    custom_bubble_chart = (function(d3, CustomTooltip) {
        "use strict";

        var width = 1200,
            height = 500,
            tooltip = CustomTooltip("tooltip", 300),
            gravedad = -0.01,
            friction = 0.9,
            damper = 0.5,
            nodes = [],
            radioMinimo = 10,
            radioMaximo = 70,
            vis, force, circles, radius_scale,
            miles = d3.format(",");

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

        //IDs hardcodeadas
        var centroides_jurisdiccion = {};
        var contador = [1, 1];

        for (var i = 0; i < labels.length; i++) {
            centroides_jurisdiccion[labels[i]] = {
                x: contador[0] * (width - correccion) / columnas,
                y: (height / filas) * contador[1]
            }
            contador[0]++;
            if (contador[0] === 5) {
                contador[0] = 1;
                contador[1]++;
            }
        }


        var finalidad = ["Administración Gubernamental", "Deuda Pública - Intereses y Gastos", "Servicios de Seguridad", "Servicios Económicos", "Servicios Sociales"];

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

            vis = d3.select("#grafico").append("svg")
                .attr("width", width)
                .attr("height", height)
            //.attr("shape-rendering","optimizeSpeed")
            //.attr("color-rendering","optimizeSpeed")
            .attr("viewBox", "0 0 1200 800")
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
                    show_details(d, i, this);
                })
                .on("mouseout", function(d, i) {
                    hide_details(d, i, this);
                });

            circles.transition().duration(1500).attr("r", function(d) {
                return d.radius;
            });

        }

        function charge(d) {
            if (d.value < 0) {
                return 0
            } else {
                //      return -Math.pow(d.radius,2.4)/7 
                //      return -Math.pow(d.radius,1.9)
                return -(d.radius * (d.radius) / 1.2)
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
                            "Adm. Gubernamental": (width-100)/5 * 3  ,
                            "Servicios de Seguridad": (width-100)/5 * 4,
                            "Deuda Pública - Intereses y Gastos": (width-100)/5 * 5
                          };

            var finalidadKeys = d3.keys(finalidadId);
            var finalidad = vis.append("g").classed("finalidad", true).attr("transform", "translate(0," + 40 + ")").selectAll(".finalidad").data(finalidadKeys);
        
                finalidad.enter()
                  .append("text")
                    .attr("class", "titulo")
                    .text(function(d) { return d;})
                    .attr("dy", ".5em")
                    .attr("x", function(d) { return finalidadId[d]; }  )
                    // .call(wrap, 100)
                    .attr("text-wrap", "normal")
                    .attr("text-anchor", "middle")
                    
                    

                finalidad.enter()
                  .append("text")
                    .attr("class", "total")
                    .attr("x", function(d) { return finalidadId[d]; }  )
                    .attr("y", 90)
                    .attr("dy", "1em")
                    .attr("text-wrap", "normal")
                    .attr("text-anchor", "middle")
                    .text(miles(1520000));
        }



        function borrarReferencias() {
            var finalidad = vis.selectAll(".finalidad").remove();
        }


        function show_details(data, i, element) {
            d3.select(element).attr("stroke", "black");
            var content = "<span class=\"name\">Finalidad:</span><span class=\"value\"> " + data.finalidad + "</span><br/>";
            content += "<span class=\"name\">Función:</span><span class=\"value\"> " + data.funcion + "</span><br/>";
            content += "<span class=\"name\">Jurisdicción:</span><span class=\"value\"> " + data.jurisdiccion + "</span><br/>";
            content += "<span class=\"name\">Monto:</span><span class=\"value\"> $" + addCommas(data.monto) + "</span>";
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
            } else if (ver_tipo == 'jurisdiccion') {
                mostrarJurisdiccion();
            } else {
                mostrarGrupoCompleto();
            }
        };

        return presupuesto;
    })(d3, CustomTooltip);

    function wrap(text, width) {

        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    custom_bubble_chart.init(data);
    custom_bubble_chart.cambiarVista('todo');


});

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