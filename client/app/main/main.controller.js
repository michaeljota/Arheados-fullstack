'use strict';

angular.module('arheadosFullstackApp')
  .controller('MainCtrl', function ($scope, $http, drawSyncManager) {

    var colors = {
      transparent: 'rgba(0, 0, 0, 0)',
      black:       'rgba(0, 0, 0, 1)',
      gray:        'rgba(180, 180, 180, 1)'
    };

    //Internal
    var
    //Variables
      canvas,

      resizeCanvas = function () {
        var container = document.getElementById('canvasContainer');
        var w = container.clientWidth;
        var h = window.innerHeight * 0.70;

        canvas.width  = w;
        canvas.height = h;

        drawSyncManager.setCanvasSize({width: w, height: h});
        drawSyncManager.renderShapeStorage();
      }
      ;

    //Bindings
    $scope.shape = {
      toolName   : 'pencil',
      lineColor  : colors.black,
      lineWidth  : 1,
      lineCap    : 'round',
      fillStyle  : colors.transparent,
      filled     : true,
      stroked    : true
    };

    //Funcions

    $scope.init = function () {
      canvas = document.getElementById('canvas');
      drawSyncManager.setContext(canvas.getContext('2d'));

      canvas.ontouchstart =
      canvas.onmousedown = function () {
        drawSyncManager.setTmpShape($scope.shape);
        drawSyncManager.startDrawing();
      };

      canvas.ontouchmove = function () {
        event.preventDefault();
        drawSyncManager.continueDrawing ();
      };

      canvas.onmousemove = function () {
        drawSyncManager.continueDrawing ();
      };

      canvas.ontouchend =
      canvas.ontouchcancel =
        canvas.onmouseup = function () {
          drawSyncManager.endDrawing();
        };

      window.addEventListener('resize', resizeCanvas);
      window.addEventListener('load', resizeCanvas());
    };

    $scope.resetDraw = function (){
      drawSyncManager.resetDraw();
    };

    $scope.undo = function () {
      drawSyncManager.undo();
    };

    $scope.$watch('shape.toolName', function () {
      $scope.shape.filled = $scope.shape.toolName !== 'pencil';
    });
  });
