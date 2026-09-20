import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";

function HotelCard({ hotel, onEdit, onDelete }) {
  const imageUrl = hotel.image
    ? `${API_BASE}${hotel.image}`
    : "https://via.placeholder.com/600x400?text=No+Image";

  return (
    <article className="hotel-card">
      <Link to={`/hotels/${hotel.id}`} className="card-image-link">
        <img src={imageUrl} alt={hotel.title} className="card-image" />
      </Link>

      <div className="card-content">
        <h2>{hotel.title}</h2>
        <p className="price">₹{Number(hotel.price).toLocaleString()}</p>
        <p className="description">
          {hotel.description.length > 110
            ? `${hotel.description.slice(0, 110)}...`
            : hotel.description}
        </p>

        <div className="card-actions">
          <button onClick={() => onEdit(hotel)} className="button secondary">
            Edit
          </button>
          <button onClick={() => onDelete(hotel.id)} className="button danger">
            Delete
          </button>
          <Link to={`/hotels/${hotel.id}`} className="button">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
