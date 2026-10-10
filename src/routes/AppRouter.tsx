import { Route, Routes } from "react-router";
import Home from "../pages/Home";
import Title from "../pages/Title";
import Setlist from "../pages/Setlist";
import Control from "../pages/Control";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/title" element={<Title />} />
      <Route path="/setlist" element={<Setlist />} />
      <Route path="/control" element={<Control />} />
    </Routes>
  );
};

export default AppRouter;
