import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularChart from 'angular-chart.js';
import { format, getTime } from 'date-fns'

import template from './graph.html';
import config from './graphConfig';

class Graph {
  constructor($scope, $reactive, $state, viewService, $timeout, $window, $stateParams) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    this.call('reportGraph', $stateParams.id, (error, res) => {
          if (!error) {
            if (res && res.length) {
              $scope.labels = res[0].labels.map((date, i) => getTime(date));
              $scope.data = [res[0].one];

              const data = res[0].labels.map((date, i) => {
                return { date: getTime(date), value: res[0].one[i]}
              });

              // set the dimensions and margins of the graph
              const margin = {top: 10, right: 30, bottom: 30, left: 60},
                  width = $window.innerWidth - margin.left - margin.right,
                  height = 400 - margin.top - margin.bottom;

              // append the svg object to the body of the page
              const svg = d3.select('#reportGraph')
                  .append('svg')
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                  .append('g')
                  .attr('transform', `translate(${margin.left},${margin.top})`);


              // Add X axis --> it is a date format
              const x = d3.scaleTime()
                  .domain(d3.extent(data, function(d) { return d.date; }))
                  .range([ 0, width ]);
              svg.append('g')
                  .attr('transform', `translate(0, ${height})`)
                  .call(d3.axisBottom(x));

              // Add Y axis
              const y = d3.scaleLinear()
                  .domain([d3.min(data, function(d) { return +d.value; }), d3.max(data, function(d) { return +d.value; })])
                  .range([ height, 0 ]);
              svg.append('g')
                  .call(d3.axisLeft(y));

              // Add the line
              svg.append('path')
                  .datum(data)
                  .attr('fill', 'none')
                  .attr('stroke', 'steelblue')
                  .attr('stroke-width', 1.5)
                  .attr('d', d3.line()
                      .x(function(d) { return x(d.date) })
                      .y(function(d) { return y(d.value) })
                  )

            }
          }
        }
    );
  }
}


const name = 'graph';

// create a module
export default angular.module(name, [angularMeteor, 'chart.js'])
    .component(name, { template, controllerAs: name, controller: Graph})
    .config(config);


