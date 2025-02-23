// useEffect(() => {
//     const updateSize = () => {
//       if (containerRef.current) {
//         const { offsetWidth, offsetHeight } = containerRef.current;
//         setStageSize({ width: offsetWidth, height: offsetHeight });
//       }
//     };

//     updateSize();
//     window.addEventListener("resize", updateSize);
//     return () => window.removeEventListener("resize", updateSize);
//   }, []);

//   const handleCanvasClick = (e) => {
//     if (!isDrawing) return;
//     const stage = e.target.getStage();
//     const pointerPosition = stage.getPointerPosition();
//     if (!pointerPosition) return;
//     const { x, y } = pointerPosition;

//     if (points.length >= 2) {
//       const [firstX, firstY] = points.slice(0, 2);
//       const distance = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
//       if (distance <= PROXIMITY_THRESHOLD) {
//         setPoints((prevPoints) => [...prevPoints, firstX, firstY]);
//         setMousePosition(null);
//         setIsDrawing(false);
//         return;
//       }
//     }
//     setPoints((prevPoints) => [...prevPoints, x, y]);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing) return;
//     const stage = e.target.getStage();
//     const pointerPosition = stage.getPointerPosition();
//     if (!pointerPosition) return;
//     setMousePosition({ x: pointerPosition.x, y: pointerPosition.y });
//   };

//   const handleSelect = () => {
//     if (transformerRef.current && polygonRef.current) {
//       const currentNodes = transformerRef.current.nodes();
//       if (currentNodes.length > 0) {
//         transformerRef.current.nodes([]); // Deselects the polygon, making the transformer disappear
//       } else if (polygonRef.current) {
//         transformerRef.current.nodes([polygonRef.current]); // Selects the polygon, making the transformer reappear
//       }
//       transformerRef.current.getLayer().batchDraw();
//     }
//   };

//   const handleTransformEnd = () => {
//     if (polygonRef.current) {
//       const node = polygonRef.current;
//       const scaleX = node.scaleX();
//       const scaleY = node.scaleY();
//       const newPoints = points.map((coord, i) =>
//         i % 2 === 0 ? coord * scaleX + node.x() : coord * scaleY + node.y()
//       );
//       node.scaleX(1);
//       node.scaleY(1);
//       node.x(0);
//       node.y(0);
//       setPoints(newPoints);
//     }
//   };

//   const resetPolygon = () => {
//     setPoints([]);
//     setIsDrawing(true);
//     setMousePosition(null);
//   };

//   const exportPoints = () => {
//     navigator.clipboard.writeText(JSON.stringify(points));
//     alert("Polygon points copied to clipboard!");
//   };