// Nick Nordale

$(function() {
    d3.csv('data/NBAteams.csv', function (error, data) {
        var xmetric = 'WIN%';
        var ymetric = 'FG%';

        var xScale, yScale;

        var svg = d3.select('#vis')
            .append('svg')
            .attr('height', 750)
            .attr('width', 750);

        var margin = {
            left:75,
            bottom:75,
            top:50,
            right:25
        };

        var height = 750 - margin.bottom - margin.top;
        var width = 750 - margin.left - margin.right;

        var g = svg.append('g')
            .attr('transform', 'translate(' +  margin.left + ',' + margin.top + ')')
            .attr('height', height)
            .attr('width', width);

        var setScales = function() {
            var xMax = d3.max(data, function(d) { return d[xmetric] }) * 1.05;
            var xMin = d3.min(data, function(d) { return d[xmetric] }) * 0.95;
            var yMax = d3.max(data, function(d) { return d[ymetric] }) * 1.05;
            var yMin = d3.min(data, function(d) { return d[ymetric] }) * 0.95;
            xScale = d3.scaleLinear().range([0, width]).domain([xMin, xMax]);
            yScale = d3.scaleLinear().range([height, 0]).domain([yMin, yMax]);
        };

        var circleFunc = function(circle) {
            circle.attr('r', 5)
                .attr('fill', 'blue')
                .attr('cx', function(d) { return xScale(d[xmetric])})
                .attr('cy', function(d) { return yScale(d[ymetric])})
                .attr('title', function(d) {return d['TEAM']})
                .style('opacity', .3)
        };

        var draw = function(data) {
            setScales();
            var circles = g.selectAll('circle').data(data);
            circles.enter().append('circle').call(circleFunc);
            circles.exit().remove();
            g.selectAll('circle').transition().duration(1500).call(circleFunc)
        };

        draw(data);

        var drawAxes = function() {
            svg.selectAll('.axes').remove();

            var xAxis = d3.axisBottom()
                .scale(xScale);

            var yAxis = d3.axisLeft()
                .scale(yScale);

            svg.append('g').call(xAxis)
                .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
                .attr('class', 'axes');

            svg.append('g').call(yAxis)
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('class', 'axes');

            svg.append("text")
                .attr("transform", "translate(" + ((width + margin.left + margin.right) / 2) + " ," + (height + margin.top + 40) + ")")
                .attr('class', 'axes axes-label')
                .style("text-anchor", "middle")
                .text(xmetric);

            svg.append("text")
                .attr('transform', 'translate(' + 20 + ',' + (height + margin.top + margin.bottom) / 2 + ')rotate(-90)')
                .attr('class', 'axes axes-label')
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(ymetric);
        };

        drawAxes();

        $("circle").tooltip({
            'container': 'body',
            'placement': 'bottom'
        });

        // get selection
        $("input[type=radio]").on('change', function() {
            ymetric = this.value;
            draw(data);
            drawAxes();
        });
    });
});
