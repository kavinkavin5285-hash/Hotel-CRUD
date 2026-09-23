import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const API_BASE = import.meta.env.VITE_API_URL || "";
const API_URL = `${API_BASE}/api/hotels`;

function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [locating, setLocating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getHotel = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Hotel not found.");
        }

        setHotel(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getHotel();
  }, [id]);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setGeoError("Location access was denied. Showing the hotel location on the map instead.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const copyCoordinates = async () => {
    const coordinates = `${hotel.latitude}, ${hotel.longitude}`;

    try {
      await navigator.clipboard.writeText(coordinates);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setGeoError("Coordinates could not be copied. You can select them manually.");
    }
  };

  if (loading) return <p className="status">Loading hotel...</p>;

  if (error) {
    return (
      <div className="container page">
        <p className="message error">{error}</p>
        <Link to="/" className="button">Back to hotels</Link>
      </div>
    );
  }

  const imageUrl = hotel.image
    ? `${API_BASE}${hotel.image}`
    : "https://via.placeholder.com/800x500?text=No+Image";

  const mapEmbedUrl = `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=13&output=embed`;
  const directionsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${hotel.latitude},${hotel.longitude}`
    : `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`;

  return (
    <>
      <Helmet>
        <title>{hotel.title} | hotel.com</title>
        <meta name="description" content={hotel.description.slice(0, 150)} />
      </Helmet>

      <div className="container page">
        <Link to="/" className="back-link">← Back to hotels</Link>

        <article className="details">
          <img src={imageUrl} alt={hotel.title} className="details-image" />

          <div className="details-content">
            <div className="details-badges">
              <span className="badge">Hotel #{hotel.id}</span>
              <span className="badge">Price from ₹{Number(hotel.price).toLocaleString()}</span>
            </div>

            <h1>{hotel.title}</h1>
            <p className="price">₹{Number(hotel.price).toLocaleString()}</p>
            <p>{hotel.description}</p>

            <div className="location-card">
              <h3>Hotel details</h3>
              <div className="location-info">
                <p><strong>Latitude:</strong> {hotel.latitude}</p>
                <p><strong>Longitude:</strong> {hotel.longitude}</p>
                {userLocation && (
                  <p>
                    <strong>Your location:</strong> {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
                  </p>
                )}
              </div>

              <div className="map-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={requestUserLocation}
                  disabled={locating}
                >
                  {locating ? "Getting location..." : "Use my location"}
                </button>

                <button
                  type="button"
                  className="button secondary"
                  onClick={copyCoordinates}
                >
                  {copied ? "Coordinates copied" : "Copy coordinates"}
                </button>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button primary"
                >
                  {userLocation ? "Get directions" : "Open location in map"}
                </a>
              </div>

              {geoError && <p className="message info">{geoError}</p>}
            </div>
          </div>
        </article>

        <section className="map-section">
          <h2>Location on map</h2>
          <iframe
            title={`Map showing ${hotel.title}`}
            src={mapEmbedUrl}
            loading="lazy"
          />
        </section>
      </div>
    </>
  );
}

export default HotelDetails;
