¿A dónde van nuestros impuestos?
================================
### Visualización del presupuesto del Gobierno de la Ciudad Autónoma de Buenos Aires

Para acompañar el lanzamiento del [portal de Transparencia](http://www.buenosaires.gob.ar/transparencia) decidimos desarrollar una visualización de los presupuestos sancionados por la Legislatura de la Ciudad de Buenos Aires, con la intención de que cualquier persona interesada, pueda entender cómo se distribuye el dinero que todos aportamos.

[¿A dónde van nuestros impuestos?](http://gcba.github.io/presupuesto-gcba) muestra una de las tantas maneras en que se clasifica el gasto y la inversión pública. En este caso por Finalidad y Función, a lo que le agregamos un corte transversal, por Jurisdiccion. Esto nos permite ver y explorar el presupuesto de la Ciudad de una forma más comprensible.

Un trabajo en conjunto entre el [Laboratorio de Gobierno](https://twitter.com/labgcba) y el [Ministerio de Hacienda](http://www.buenosaires.gob.ar/areas/hacienda).

Para más información visitá el sitio del [Ministerio de Hacienda](http://www.buenosaires.gob.ar/areas/hacienda/) o el catálogo de datos abiertos de la Ciudad, [Buenos Aires Data](http://data.buenosaires.gob.ar/dataset/presupuesto-sancionado).

#### Referencias
* [Four Ways to Slice Obama’s 2013 Budget Proposal](http://www.nytimes.com/interactive/2012/02/13/us/politics/2013-budget-proposal-graphic.html), Shan Carter, New York Times.
* [Creating Animated Bubble Charts in D3](http://vallandingham.me/bubble_charts_in_d3.html), Jim Vallandingham. 


#### Desarrollado con:
* [d3.js](http://d3js.org/) - [Clustered Force Layout](http://bl.ocks.org/mbostock/1747543)
* [jQuery](http://jquery.com/)
* [Bootstrap](http://getbootstrap.com/)
* [Tooltipster](http://iamceege.github.io/tooltipster/)

#### Instalación

Utilizamos [bower](http://bower.io/) para cargar d3.js, jQuery y [grunt](http://gruntjs.com/) para compilar SASS, minificar CSS y JS. 
	npm install
	bower install

#### Para servir un html local via HTTP

*Via Python
	python -m SimpleHTTPServer

En Chrome correr localhost:8000

*Via Node.js
	npm install http-server -g
	http-server .

En Chrome correr localhost:8000
