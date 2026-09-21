import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import HotelCard from "../components/HotelCard";
import HotelForm from "../components/HotelForm";
import Pagination from "../components/Pagination";
import { fetchHotels } from "../store/hotelSlice";

const API_URL = `${import.meta.env.VITE_API_URL || ""}/api/hotels`;
const LIMIT = 6;

function HotelList() {
  const dispatch = useDispatch();
  const { items, total, loading, error } = useSelector((state) => state.hotels);

  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [title, setTitle] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const loadHotels = () => {
    dispatch(
      fetchHotels({
        title,
        minPrice,
        maxPrice,
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
      })
    );
  };

  useEffect(() => {
    loadHotels();
  }, [page, title, minPrice, maxPrice]);

  const handleSave = async (formData) => {
    const url = editingHotel
      ? `${API_URL}/${editingHotel.id}`
      : API_URL;

    const method = editingHotel ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Save failed.");
      }

      setMessage(editingHotel ? "Hotel updated successfully." : "Hotel added successfully.");
      setEditingHotel(null);
      setShowForm(false);
      setPage(1);
      loadHotels();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this hotel?");

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed.");
      }

      setMessage("Hotel deleted successfully.");

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadHotels();
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Hotel List | Hotel CRUD</title>
        <meta
          name="description"
          content="Search and manage hotels with a CRUD interface."
        />
      </Helmet>

      <div className="container page">
        <div className="page-heading">
          <div>
            <h1>Hotel List</h1>
            <p>Manage your hotels from one simple page.</p>
          </div>

          <button
            className="button primary"
            onClick={() => {
              setEditingHotel(null);
              setShowForm((value) => !value);
            }}
          >
            {showForm ? "Close Form" : "Add Hotel"}
          </button>
        </div>

        {message && (
          <div className="message success">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {showForm && (
          <HotelForm
            hotel={editingHotel}
            onSave={handleSave}
            onCancel={() => {
              setEditingHotel(null);
              setShowForm(false);
            }}
          />
        )}

        {!showForm && (
          <>
            <section className="filters">
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setPage(1);
                }}
                placeholder="Search hotel title..."
              />

              <input
                type="number"
                min="1"
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(event.target.value);
                  setPage(1);
                }}
                placeholder="Min price"
              />

              <input
                type="number"
                min="1"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value);
                  setPage(1);
                }}
                placeholder="Max price"
              />

              <button
                className="button secondary"
                onClick={() => {
                  setTitle("");
                  setMinPrice("");
                  setMaxPrice("");
                  setPage(1);
                }}
              >
                Clear
              </button>
            </section>

            {loading && <p className="status">Loading hotels...</p>}

            {error && <p className="message error">{error}</p>}

            {!loading && !error && items.length === 0 && (
              <div className="empty">
                <h2>No hotels found</h2>
                <p>Try changing your search/filter or add a hotel.</p>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <>
                <div className="hotel-grid">
                  {items.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default HotelList;
