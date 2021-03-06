// Nick Nordale

$(function() {
    d3.csv('data/NBAteams.csv', function (error, data) {
        var xmetric = 'WIN%';
        var ymetric = 'FG%';

        var xScale, yScale;

        var svg = d3.select('#vis')
            .append('svg')
            .attr('height', 650)
            .attr('width', 750);

        var margin = {
            left:75,
            bottom:75,
            top:50,
            right:25
        };

        var randomColor = function() {
            var golden_ratio_conjugate = 0.618033988749895;
            var h = Math.random();

            var hslToRgb = function (h, s, l){
                var r, g, b;

                if(s == 0){
                    r = g = b = l; // achromatic
                }else{
                    function hue2rgb(p, q, t){
                        if(t < 0) t += 1;
                        if(t > 1) t -= 1;
                        if(t < 1/6) return p + (q - p) * 6 * t;
                        if(t < 1/2) return q;
                        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    }

                    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    var p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1/3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1/3);
                }

                return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
            };

            h += golden_ratio_conjugate;
            h %= 1;
            return hslToRgb(h, 0.5, 0.60);
        };

        $.each(data, function() {
            this.color = randomColor();
        });

        console.log(data);

        var height = 650 - margin.bottom - margin.top;
        var width = 750 - margin.left - margin.right;

        var g = svg.append('g')
            .attr('transform', 'translate(' +  margin.left + ',' + margin.top + ')')
            .attr('height', height)
            .attr('width', width);

        var setScales = function() {
            var xMax = d3.max(data, function(d) { return parseFloat(d[xmetric]) }) * 105;
            var xMin = d3.min(data, function(d) { return parseFloat(d[xmetric]) }) * 95;
            var yMax = d3.max(data, function(d) { return parseFloat(d[ymetric]) }) * 1.05;
            var yMin = d3.min(data, function(d) { return parseFloat(d[ymetric]) }) * 0.95;
            xScale = d3.scaleLinear().range([0, width]).domain([xMin, xMax]);
            yScale = d3.scaleLinear().range([height, 0]).domain([yMin, yMax]);
        };

        var circleFunc = function(circle) {
            circle.attr('r', 5)
                .attr('fill', 'blue')
                .attr('cx', function(d) { return xScale(parseFloat(d[xmetric]) * 100)})
                .attr('cy', function(d) { return yScale(parseFloat(d[ymetric]))})
                .attr('title', function(d) { return d['TEAM'] })
                .attr("fill", function(d) { return d.color})
                .style('opacity', 0.7)
                .call(curr_show_func);
        };

        var showAll = function(c) {
            c.transition().duration(750).style('opacity', 0.7);
        };

        var hideEast = function(c) {
            c.filter(function(d) { return d['CONF'] === '0'; })
                .style('opacity', 0);
        };

        var hideWest = function(c) {
            c.filter(function(d) { return d['CONF'] === '1'; })
                .style('opacity', 0);
        };

        var curr_show_func = showAll;

        var draw = function(data) {
            setScales();
            var circles = g.selectAll('circle').data(data);
            circles.enter().append('circle').call(circleFunc);
            g.selectAll('circle')
                .transition().duration(750).call(circleFunc);
            circles.exit().remove();
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

        $("#conference-group input[type=radio]").on('change', function() {
            switch (this.value) {
                case 'west':
                    curr_show_func = hideEast;
                    break;
                case 'east':
                    curr_show_func = hideWest;
                    break;
                default:
                    curr_show_func = showAll;
                    break;
            }

            draw(data);
            drawAxes();
        });

        $("#metric-group input[type=radio]").on('change', function() {
            ymetric = this.value;
            draw(data);
            drawAxes();
        });
    });
});
