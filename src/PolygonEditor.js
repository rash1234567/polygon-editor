import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Transformer, Circle } from "react-konva";
import { Button, Card} from "@mui/material";

const PolygonEditor = () => {
  // State to track the size of the canvas
  const [stageSize, setStageSize] = useState({ width: 800, height: 500 });
  // State to store the current mouse position when drawing
  const [mousePosition, setMousePosition] = useState(null);
  // Ref for the container holding the canvas
  const containerRef = useRef(null);
  // Ref for the polygon shape
  const polygonRef = useRef(null);
  // Ref for the transformer tool to enable resizing/moving
  const transformerRef = useRef(null);
  // Proximity threshold to detect if a point is close enough to close the polygon
  const PROXIMITY_THRESHOLD = 10;
  // State to store the polygon's points
  const [points, setPoints] = useState([]);
  // State to track whether the user is actively drawing
  const [isDrawing, setIsDrawing] = useState(false);
  // Ref for the Stage component
  const stageRef = useRef(null);

  // Effect to update the stage size when the window resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setStageSize({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Handles user clicks on the canvas to add points to the polygon
  const handleCanvasClick = (e) => {
    if (!isDrawing) return; // Prevent adding points if not in drawing mode
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition(); // gets where uyour pointer is on the stage ]
    if (!pointerPosition) return;
    const { x, y } = pointerPosition;
    // Check if the new point is close to the starting point, if so, close the polygon
    if (points.length >= 2) {
      const [firstX, firstY] = points.slice(0, 2);
      const distance = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
      if (distance <= PROXIMITY_THRESHOLD) {
        setPoints((prevPoints) => [...prevPoints, firstX, firstY]); // Close polygon You can perform addition function at this point
        setMousePosition(null);
        setIsDrawing(false);
        return;
      }
    }
    setPoints((prevPoints) => [...prevPoints, x, y]);
  };

   // Updates the mouse position while drawing to create a preview line 
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    setMousePosition({ x: pointerPosition.x, y: pointerPosition.y });
  };

    // Handles selection and deselection of the polygon
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
 

// Adjusts the points when the polygon is transformed (scaled or moved)
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

    // Resets the polygon drawing process
  const resetPolygon = () => {
    setPoints([]);
    setIsDrawing(true);
    setMousePosition(null);
  };


  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#f0f0f0",
        padding: "10px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
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
          {/* Draw starting point */}
          {isDrawing && points.length >= 2 && (
            <Circle x={points[0]} y={points[1]} radius={6} fill="#B20000" />
          )}

          {/* blue color in the polygon during drawing */}

          {/* Polygon */}
          {points.length > 0 && (
            <Line
              points={points}
              stroke="#008080" // Teal stroke
              strokeWidth={2}
              closed={!isDrawing}
              fill={!isDrawing ? "rgba(230, 255, 250, 0.5)" : undefined} // Light mint green
              ref={polygonRef}
              draggable={!isDrawing}
              onTransformEnd={handleTransformEnd}
              onClick={handleSelect}
            />
          )}

          {/* Mouse position preview */}
          {isDrawing && points.length >= 2 && mousePosition && (
            <Line
              points={[...points, mousePosition.x, mousePosition.y]}
              stroke="#008080"
              strokeWidth={1}
            />
          )}

          {/* Preview lines and color fill during drawing */}
          {isDrawing && points.length >= 2 && mousePosition && (
            <>
              <Line
                points={[...points, mousePosition.x, mousePosition.y]}
                stroke="#008080" // Teal stroke
                strokeWidth={0.1}
                closed={true}
                fill="rgba(230, 255, 250, 0.2)" // Light mint green fill during drawing
              />
              <Line
                points={[...points, mousePosition.x, mousePosition.y]}
                stroke="#888888"
                strokeWidth={0.1}
              />
            </>
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

export default PolygonEditor;
