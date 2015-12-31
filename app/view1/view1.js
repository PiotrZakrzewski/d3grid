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
        const mapWidth   = sightRange * 2 + 1;  // So that the player sees sightRange amount of block in front
        const mapHeight  = sightRange * 2 + 1;  // of her and behind
        const svgWidth   = mapWidth  * cellWidth ;
        const svgHeight  = mapHeight * cellHeight;

        let scene = [] ;     // empty map. Will contain whole scene map
        let pov = [10,10];   // p.o.v - Point of view. cartesian coordinates pointing to the player perspective
        let selected = undefined;  // Holds user's selected tile.
        let info = {} ;

        $scope.info = {'text':''}; // text to be displayed on selection

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

        let selection = function() {
            let that = this;
            $scope.$apply( function() {
                let _id = d3.select(that).attr('id');
                if (selected != undefined) d3.select('#'+selected).attr('fill','red');
                selected = _id;
                d3.select(that).attr('fill','blue');
                $scope.info.text = info[_id] ;
            }) ;
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
                .attr('fill','red')
                .attr('id',function(d) { return d.id } )
                .on('click',selection);
            if (selected != undefined) d3.select('#'+selected).attr('fill','blue');
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
                        flatJson.push(cell);
                        info[cell.id] = cell.text;
                    }
                    viewX++;
                }
                viewY++;
            }
            return flatJson;
        };

        let movePov = function(diffX, diffY) {
            pov[0] += diffX;
            pov[1] += diffY;
            $scope.draw()  ;
        };

        $scope.handleKeyboard = function(keyEvent) {
            if (keyEvent.which === 115) {         // W
                movePov(0, 1);
            } else if (keyEvent.which === 119) {  // down
                movePov(0, -1);
            } else if (keyEvent.which === 97) {   // left
                movePov(-1, 0);
            } else if (keyEvent.which === 100) {  // right
                movePov(1, 0);
            }
        };

        let mockScene = function() {
            for (let i = 0; i < 256; i++) {
                let row = [];
                for (let j = 0; j <256; j++) {
                    let cell = {};
                    let _id ='tile_'+Math.random().toString(36).substring(7);
                    if (Math.random() > 0.65) cell = {'text':_id, 'id':_id};
                    row.push(cell);
                }
                scene.push(row);
            }
            console.log(scene);
        };
    mockScene();
}]);
