'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller : 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope) {

        const cellWidth  = 50;
        const cellHeight = 50;
        const sightRange = 8 ;
        const mapWidth   = sightRange * 2 + 1;
        const mapHeight  = sightRange * 2 + 1;
        const svgWidth   = mapWidth  * cellWidth ;
        const svgHeight  = mapHeight * cellHeight;

        let scene = [] ;   // empty map. Will contain whole scene map
        let pov = [10,10];   // p.o.v - Point of view. cartesian coordinates pointing to the player perspective


        $scope.slice = function(_scene, _pov, _range) {
            // Slice takes a subset of an array. Returned array will contain all coordinates between
            // [x_pov - _range][y_pov - _range] and [x_pov + _range][y_pov + _range] where x_pov and y_pov are
            // cartesian coordinates of center of vision, taken from _pov argument.
            let x_pov = _pov[0];
            let y_pov = _pov[1];
            let lowerSliceX = x_pov - _range;
            let upperSliceX = x_pov + _range;
            let lowerSliceY = y_pov - _range;
            let upperSliceY = y_pov + _range;
            if (lowerSliceX < 0) lowerSliceX = 0;
            if (lowerSliceY < 0) lowerSliceY = 0;
            let mapSliceY = _scene.slice(lowerSliceY, upperSliceY + 1);
            let mapSlice  = [];
            for (let row of mapSliceY) {
                row = row.slice(lowerSliceX, upperSliceX + 1);
                mapSlice.push(row);
            }
            return mapSlice;
        };

        $scope.draw = function() {
            let cellData = $scope.slice(scene, pov, sightRange) ;
            cellData = $scope.flatten(cellData);
            d3.select("#gridSvg").remove();
            let svg = d3.select('#grid').append('svg')
                        .attr('width' , svgWidth)
                        .attr('height', svgHeight)
                        .attr('id' , 'gridSvg');
            svg.selectAll('rect')
                .data(cellData)
                .enter()
                .append('rect')
                .attr('x',  function(d) { return d.viewX * cellWidth })
                .attr('y',  function(d) { return d.viewY * cellHeight})
                .attr('width' , cellWidth)
                .attr('height', cellHeight)
                .attr('fill','red');
           /* svg.append('text')
                .attr('x',20)
                .attr('y',20)
                .text('B');*/

        };

        $scope.flatten = function(arrayOfArrays) {
            let flatJson = [];
            let viewY = 1;
            for (let row of arrayOfArrays) {
                let viewX = 1;
                for (let cell of row) {
                    if (Object.keys(cell).length == 0) ; // Don't add empty cells
                    else {
                        cell.viewX = viewX;
                        cell.viewY = viewY;
                        flatJson.push(cell)
                    }
                    viewX++;
                }
                viewY++;
            }
            console.log(flatJson);
            return flatJson;
        };

        let movePov = function(diffX, diffY) {
            pov[0] += diffX;
            pov[1] += diffY;
            $scope.draw()  ;
        };

        $scope.handleKeyboard = function(keyEvent) {
            console.log(keyEvent.which);
            if (keyEvent.which === 119) {         // W
                movePov(0, 1);
            } else if (keyEvent.which === 115) {  // down
                movePov(0, -1);
            } else if (keyEvent.which === 97) {  // left
                movePov(-1, 0);
            } else if (keyEvent.which === 100) {  // right
                movePov(1, 0);
            }
        };

        let mockScene = function() {
            for (let i = 0; i <= 256; i++) {
                let row = [];
                for (let j = 0; j <=256; j++) {
                    let cell = {};
                    if ((j % 2) == 0) cell = {'text':'whatevah'};
                    row.push(cell);
                }
                scene.push(row);
            }
            console.log(scene);
        };
    mockScene();
}]);
