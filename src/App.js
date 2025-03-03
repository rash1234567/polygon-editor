import React from "react";
import PolygonEditor from "./PolygonEditor";
import ResponsivePolygonEditor from "./ResponsivePolygonEditor";

const App = () => {
  return (
    <div className="w-[90vw] mx-auto mt-4">
      <PolygonEditor />
      {/* <ResponsivePolygonEditor/> */}
    </div>
  );
};

export default App;
