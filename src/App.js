import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Transformer, Circle } from "react-konva";
import PolygonEditor from "./PolygonEditor";

const App = () => {
  return (
    <div className="">
      <PolygonEditor />
    </div>
  );
};

export default App;
