/* 
 * Visualizcion para el presupuesto 2014
 * del gobierno de la Ciudad de Buenos Aires
 *
 * @Autor: Laboratorio de Gobierno
 *
 */


// Vars de inicializacion
var w = 970, // ancho del gráfico
    h = 350, // largo del gráfico
    cant = 5, // Cant de categorías
    rangoDeColores = ["#961C41","#BFBA80","#488460","#14183D", "#3A0016"];

var nodes = d3.range(cant).map(function(i) {



        return {
            type: Math.random() * cant | 0,
            radius: 0,
            fixed: true, // true para que permanezcan en el lugar
            type: i,
            x: (i + 1) * (w / (cant + 1)),
            y: h / 2
        };
    });
var color = d3.scale.category10().range(rangoDeColores); // 



var force = d3.layout.force()
    .gravity(0)
    .charge(0)
    .nodes(nodes)
    .size([w, h]);

force.start();

var svg = d3.select("#grafico").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

svg.append("svg:rect")
    .attr("width", w)
    .attr("height", h)
    .style("fill", "white");

svg.selectAll("circle")
    .data(nodes)
    .enter().append("svg:circle")
    .attr("r", function(d) {
        return d.radius - 2;
    })
    .style("fill", function(d, i) {
        return color(d.type);
    });

force.on("tick", function(e) {
    var q = d3.geom.quadtree(nodes),
        k = e.alpha * .1,
        i = 0,
        n = nodes.length,
        o;

    while (++i < n) {
        o = nodes[i];
        if (o.fixed) continue;
        c = nodes[o.type];
        o.x += (c.x - o.x) * k;
        o.y += (c.y - o.y) * k;
        q.visit(collide(o));
    }

    svg.selectAll("circle")
        .attr("cx", function(d) {
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        });
});

function collide(node) {
    var r = node.radius + 10,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .5;
                node.px += x * l;
                node.py += y * l;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}




// Intervalo para agregar nodos.

var p0;
var nodos = 0;
var intervaloDeTest = setInterval(function() {
    var p1 = [500, 50], // origen de entrada
        node = {
            radius: Math.random() * 10, // sale del total
            type: Math.random() * cant | 0, // donde pertenece. Sale de id_
            x: p1[0],
            y: p1[1],
            px: (p0 || (p0 = p1))[0],
            py: p0[1]
        };

    p0 = p1;

    svg.append("svg:circle")
        .data([node])
        .attr("cx", function(d) {
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        })
        .attr("r", function(d) {
            return d.radius - 2;
        })
        .style("fill", function(d) {
            return color(d.type);
        })
        .attr("stroke", "black")
        .attr("stroke-width", "1")
        .attr("stroke-opacity", "0.5");


    nodes.push(node);
    force.resume();

    if (nodos > 100) {
        clearInterval(intervaloDeTest)
    }
    nodos++
}, 60);
