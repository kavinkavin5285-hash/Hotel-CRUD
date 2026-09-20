import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const emptyForm = {
  title: "",
  description: "",
  latitude: "",
  longitude: "",
  price: "",
};

function HotelForm({ hotel, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hotel) {
      setForm({
        title: hotel.title,
        description: hotel.description,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        price: hotel.price,
      });

      setPreview(hotel.image ? `${API_BASE}${hotel.image}` : "");
    } else {
      setForm(emptyForm);
      setPreview("");
    }

    setImage(null);
    setError("");
  }, [hotel]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImage = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const validate = () => {
    if (!form.title.trim() || !form.description.trim()) {
      return "Title and description are required.";
    }

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const price = Number(form.price);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return "Latitude must be between -90 and 90.";
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return "Longitude must be between -180 and 180.";
    }

    if (!Number.isFinite(price) || price <= 0) {
      return "Price must be greater than 0.";
    }

    if (!hotel && !image) {
      return "Please select a hotel image.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const data = new FormData();

    data.append("title", form.title);
    data.append("description", form.description);
    data.append("latitude", form.latitude);
    data.append("longitude", form.longitude);
    data.append("price", form.price);

    if (image) {
      data.append("image", image);
    }

    await onSave(data);
  };

  return (
    <div className="form-box">
      <div className="form-heading">
        <h2>{hotel ? "Edit Hotel" : "Add Hotel"}</h2>
        {hotel && (
          <button type="button" onClick={onCancel} className="button secondary">
            Cancel
          </button>
        )}
      </div>

      {error && <p className="message error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Hotel title *
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Hotel name"
          />
        </label>

        <label>
          Description *
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            placeholder="Describe the hotel"
          />
        </label>

        <div className="two-columns">
          <label>
            Latitude *
            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="11.0168"
            />
          </label>

          <label>
            Longitude *
            <input
              type="number"
              step="any"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="76.9558"
            />
          </label>
        </div>

        <label>
          Price *
          <input
            type="number"
            min="1"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="2500"
          />
        </label>

        <label>
          Image {hotel ? "(optional when editing)" : "*"}
          <input type="file" accept="image/*" onChange={handleImage} />
        </label>

        {preview && (
          <img src={preview} alt="Hotel preview" className="preview-image" />
        )}

        <button className="button primary" type="submit">
          {hotel ? "Update Hotel" : "Add Hotel"}
        </button>
      </form>
    </div>
  );
}

export default HotelForm;
