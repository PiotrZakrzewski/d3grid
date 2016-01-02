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
        let positions = {};  // Reverse of 'scene' variable. maps IDs to cartesian coordinates.

        $scope.info = {'text':'Nothing selected'}; // text to be displayed on selection

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
                if(selected != _id){
                    d3.select(that).attr('fill','blue');
                    selected = _id;
                    $scope.info.text = info[_id] ;
                } else {
                    selected = undefined;
                    $scope.info.text = 'Nothing selected' ;
                }
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
                    if (isObjEmpty(cell)) ; // Don't add empty cells
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

        var movePov = function(diffX, diffY) {
            pov[0] += diffX;
            pov[1] += diffY;
            $scope.draw()  ;
        };

        var moveToken = function(tokenId, diffX, diffY ) {
            let currentPos  = positions[tokenId];  // positions is y, x organized
            let destination = [currentPos[0] + diffY, currentPos[1] + diffX]; // so dst will also be y,x
            let dstTile = scene[destination[0]][destination[1] ];
            let free = isObjEmpty(dstTile);
            console.log('Curr: '+currentPos );
            console.log('Dst: ' +destination);
            if (free) {
                let tile = scene[currentPos[0]][currentPos[1]];  // scene is also y, x, sice it is an array of rows
                scene[destination[0]][destination[1]] = tile;
                scene[currentPos[0]][currentPos[1]]   = {}  ;
                positions[tokenId] = [destination[0], destination[1]];
                movePov(diffX, diffY);
            } else {
                alert('Position: '+ destination+' is occupied');
            }
        };

        var isObjEmpty = function(obj) {
            return Object.keys(obj).length == 0;
        };

        $scope.handleKeyboard = function(keyEvent) {
            if (keyEvent.which === 115) {         // W (up)
                if(selected == undefined) movePov(0, 1);
                else moveToken(selected, 0, 1);
            } else if (keyEvent.which === 119) {  // S (down)
                if(selected == undefined) movePov(0, -1);
                else moveToken(selected, 0, -1);
            } else if (keyEvent.which === 97) {   // A (left)
                if(selected == undefined) movePov(-1, 0);
                else moveToken(selected, -1, 0);
            } else if (keyEvent.which === 100) {  // D (right)
                if(selected == undefined) movePov(1, 0);
                else moveToken(selected, 1, 0);
            }
        };

        let mockScene = function() {
            for (let y = 0; y < 256; y++) {
                let row = [];
                for (let x = 0; x <256; x++) {
                    let cell = {};
                    let _id ='tile_'+x+'_'+y;//Math.random().toString(36).substring(7);
                    if (Math.random() > 0.65) cell = {'text':_id, 'id':_id};
                    positions[_id] = [y, x];
                    row.push(cell);
                }
                scene.push(row);
            }
        };
    mockScene();
}]);
