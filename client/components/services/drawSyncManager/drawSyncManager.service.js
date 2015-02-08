'use strict';

angular.module('arheadosFullstackApp')
  .factory('drawSyncManager', function (socket) {

    function Shape (shape) {
      this.ToolName   = shape.toolName;
      this.LineColor  = shape.lineColor;
      this.LineWidth  = shape.lineWidth;
      this.LineCap    = shape.lineCap;
      this.FillStyle  = shape.fillStyle;
      this.isFilled   = shape.filled;
      this.isStroked  = shape.stroked;
      this.Points     = [];
      this.addPoint   = function (point) {
        if (this.ToolName !== 'pencil' && this.Points.length > 1) {
          this.Points.pop();
        }
        this.Points.push(point)
      }
    }

    var
      CANVAS_SIZE = 600;

    var
      context,
      shapeStorage = [],
      tmpShape,
      remoteDrawing = false,
      scale,
      offset,

    //Functions

      renderShape = function(shape){
        context.beginPath();
        context.lineWidth = shape.LineWidth;
        context.lineCap = shape.LineCap;
        context.strokeStyle = shape.isStroked ? shape.LineColor : 'rgba(0, 0, 0, 0)';
        context.fillStyle = shape.isFilled ? shape.FillStyle : 'rgba(0, 0, 0, 0)';
        switch (shape.ToolName){
          case 'pencil':
            pencil(shape);
            break;
          case 'line':
            line(shape);
            break;
          case 'rectangle':
            rectangle(shape);
            break;
          case 'circle':
            circle(shape);
            break;
          default:
            console.log('ERR! ToolName undefined or invalid');
            resetTmpShape();
            break;
        }
        context.fill();
        context.stroke();
      },

      pencil = function(shape){
        context.moveTo(shape.Points[0].x, shape.Points[0].y);
        for (var i = 0; i < shape.Points.length; i++) {
          context.lineTo(shape.Points[i].x, shape.Points[i].y);
        }
      },

      line = function(shape){
        context.moveTo(shape.Points[0].x, shape.Points[0].y);
        context.lineTo(shape.Points[1].x, shape.Points[1].y);
      },

      rectangle = function(shape){
        var width, height;
        width = shape.Points[1].x - shape.Points[0].x;
        height = shape.Points[1].y - shape.Points[0].y;
        context.rect(shape.Points[0].x, shape.Points[0].y, width, height);
      },

      circle = function(shape){
        var radius = (Math.abs(shape.Points[1].x - shape.Points[0].x) + (Math.abs(shape.Points[1].y - shape.Points[0].y)) / 2);
        context.arc(shape.Points[1].x, shape.Points[1].y, radius, 0, Math.PI * 2, false);
      },

      renderShapeStorage = function() {
        context.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE);
        for (var i = 0; i < shapeStorage.length; i++) {
          renderShape(shapeStorage[i]);
        }
      },

      startDrawing = function () {
        if (remoteDrawing) {
          resetTmpShape();
        } else {
          socket.socket.emit('remoteDrawing', true);
        }
      },

      continueDrawing = function () {
        if (tmpShape) {
          var point = (event.touches) ?
          {
            x: (event.touches[0].pageX - event.target.offsetLeft),
            y: (event.touches[0].pageY - event.target.offsetTop)
          } :
          {
            x: (event.pageX - event.target.offsetLeft),
            y: (event.pageY - event.target.offsetTop)
          };
          if(tmpShape.ToolName !== 'pencil'){
            socket.socket.emit('renderShapeStorage');
          }
          tmpShape.addPoint(point);
          if(tmpShape.Points.length > 1){
            socket.socket.emit('draw', tmpShape);
            renderShape(tmpShape);
          }
        }
      },

      endDrawing = function () {
        if(tmpShape){
          if(tmpShape.Points.length > 1){
            socket.socket.emit('saveShape', tmpShape);
          }
          renderShapeStorage();
          resetTmpShape();
          socket.socket.emit('remoteDrawing', false);
        }
      },

      resetTmpShape = function() {
        tmpShape = null;
      },

      setScaleFrom = function(preSize) {
        var factor;
        factor = preSize.height < preSize.width ? preSize.height : preSize.width;
        scale = factor/CANVAS_SIZE;
        context.scale(scale, scale);
      }
      ;

    //Sync

    socket.socket.on('draw', function(shape) {
      if(!tmpShape){
        renderShape(shape);
      }
    });

    socket.socket.on('renderShapeStorage', function() {
      renderShapeStorage();
    });

    socket.socket.on('syncShapeStorage', function(ss) {
      shapeStorage = ss;
      renderShapeStorage();
    });

    socket.socket.on('remoteDrawing', function(active) {
      remoteDrawing = active;
    });

    socket.socket.on('cancelDraw', function(){
      resetTmpShape();
    });

    return {

      setTmpShape : function (shape) {
        tmpShape = new Shape(shape);
      },

      startDrawing : function () {
        startDrawing();
      },

      continueDrawing : function () {
        continueDrawing();
      },

      endDrawing : function () {
        endDrawing();
      },

      setContext : function (ctx) {
        context = ctx;
      },

      CANVAS_SIZE : CANVAS_SIZE,

      resetDraw : function () {
        context.translate(0,0);
        socket.socket.emit('resetShapeStorage');
        resetTmpShape();
      },

      undo : function () {
        shapeStorage.pop();
        renderShapeStorage();
        resetTmpShape();
      },

      renderShapeStorage : function () {
        renderShapeStorage();
      },

      setScaleFrom : function (preSize) {
        setScaleFrom(preSize);
      },

      getScale : function(){
        return scale;
      }

    };
  });
