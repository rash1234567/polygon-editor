// This component renders a resizable and responsive polygon editor.
// The polygon scales dynamically with window size 
import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Transformer, Circle } from "react-konva";
import { Button, Card} from "@mui/material";

const ResponsivePolygonEditor = () => {
  const [stageSize, setStageSize] = useState({ width: 800, height: 500 });
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePosition, setMousePosition] = useState(null);
  const PROXIMITY_THRESHOLD = 10;
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const polygonRef = useRef(null);
  const transformerRef = useRef(null);
  const scaleRef = useRef({ x: 1, y: 1 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        const scaleX = offsetWidth / stageSize.width;
        const scaleY = offsetHeight / stageSize.height;
        scaleRef.current = { x: scaleX, y: scaleY };
        setStageSize({ width: offsetWidth, height: offsetHeight });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const scalePoints = (points, scaleX, scaleY) =>
    points.map((coord, i) => (i % 2 === 0 ? coord * scaleX : coord * scaleY));

  const handleCanvasClick = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const { x, y } = pointerPosition;
    const scaledX = x / scaleRef.current.x;
    const scaledY = y / scaleRef.current.y;
    // If at least 2 points exist, check proximity to the starting point
    if (points.length >= 2) {
      const [firstX, firstY] = points.slice(0, 2);
      const distance = Math.sqrt(
        (scaledX - firstX) ** 2 + (scaledY - firstY) ** 2
      );

      if (distance <= PROXIMITY_THRESHOLD) {
        // Close the polygon by adding the first point again
        setPoints((prev) => [...prev, firstX, firstY]);
        setIsDrawing(false); // Stop drawing
        return;
      }
    }
    // Add new point to the polygon
    setPoints((prev) => [...prev, scaledX, scaledY]);
  };

  const handleTransformEnd = () => {
    if (polygonRef.current) {
      const node = polygonRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const newPoints = points.map((coord, i) =>
        i % 2 === 0 ? coord * scaleX + node.x() : coord * scaleY + node.y()
      );
      node.scaleX(1);
      node.scaleY(1);
      node.x(0);
      node.y(0);
      setPoints(newPoints);
    }
  };
  const handleSelect = () => {
    if (transformerRef.current && polygonRef.current) {
      const currentNodes = transformerRef.current.nodes();
      if (currentNodes.length > 0) {
        transformerRef.current.nodes([]); // Deselects the polygon, making the transformer disappear
      } else if (polygonRef.current) {
        transformerRef.current.nodes([polygonRef.current]); // Selects the polygon, making the transformer reappear
      }
      transformerRef.current.getLayer().batchDraw();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    setMousePosition({
      x: pointerPosition.x / scaleRef.current.x,
      y: pointerPosition.y / scaleRef.current.y,
    });
  };

  const resetPolygon = () => {
    setPoints([]);
    setIsDrawing(true);
    setMousePosition(null);
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/* Toolbar */}
      <Card
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          padding: "10px",
          zIndex: 10,
          display: "flex",
          gap: "10px",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Button
          variant="contained"
          color={isDrawing ? "secondary" : "primary"}
          onClick={() => setIsDrawing(!isDrawing)}
        >
          {isDrawing ? "Stop Drawing" : "Start Drawing"}
        </Button>
        <Button variant="outlined" color="error" onClick={resetPolygon}>
          Reset
        </Button>
      </Card>

      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        ref={stageRef}
        style={{
          cursor: isDrawing ? "crosshair" : "default",
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
        }}
      >
        <Layer>
          {points.length >= 2 && isDrawing && (
            <Circle
              x={points[0] * scaleRef.current.x}
              y={points[1] * scaleRef.current.y}
              radius={6}
              fill="#B20000"
            />
          )}
          {/* Preview lines and color fill during drawing */}
          {isDrawing && points.length >= 2 && (
            <Line
              points={scalePoints(
                [...points, mousePosition.x, mousePosition.y],
                scaleRef.current.x,
                scaleRef.current.y
              )}
              stroke="#008080"
              strokeWidth={0.2}
              closed={true} // Ensures it appears as a filled shape
              fill="rgba(230, 255, 250, 0.3)" // Light mint green fill while drawing
            />
          )}

          {points.length > 0 && (
            <Line
              points={scalePoints(
                points,
                scaleRef.current.x,
                scaleRef.current.y
              )}
              stroke="#008080"
              strokeWidth={2}
              closed={!isDrawing}
              fill={!isDrawing ? "rgba(230, 255, 250, 0.5)" : undefined}
              ref={polygonRef}
              draggable={!isDrawing}
              onTransformEnd={handleTransformEnd}
              onClick={handleSelect}
            />
          )}

          {isDrawing && points.length >= 2 && mousePosition && (
            <Line
              points={scalePoints(
                [...points, mousePosition.x, mousePosition.y],
                scaleRef.current.x,
                scaleRef.current.y
              )}
              stroke="#008080"
              strokeWidth={1}
            />
          )}
          {/* Transformer (for resizing the polygon) */}
          {!isDrawing && (
            <Transformer ref={transformerRef} rotateEnabled={false} />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ResponsivePolygonEditor;
