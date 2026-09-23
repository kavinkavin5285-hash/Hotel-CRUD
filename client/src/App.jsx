import { Routes, Route, Link } from "react-router-dom";
import HotelList from "./pages/HotelList";
import HotelDetails from "./pages/HotelDetails";

function App() {
  return (
    <>
      <header className="header">
        <div className="container nav">
          <Link to="/" className="logo">hotel.com</Link>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HotelList />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
