import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import placesData from "./places.json";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const MELBOURNE_CENTER = [-37.8136, 144.9631];

export default function App() {
  const mapRef = useRef(null);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);

  const places = useMemo(() => {
    const s = search.trim().toLowerCase();
    return placesData
      .filter((p) => (Number(p.rating) || 0) >= minRating)
      .filter((p) => {
        if (!s) return true;
        return (
          p.name.toLowerCase().includes(s) ||
          (p.suburb || "").toLowerCase().includes(s) ||
          (p.notes || "").toLowerCase().includes(s)
        );
      })
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
  }, [search, minRating]);

  const flyToPlace = (p) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([p.lat, p.lng], 15, { duration: 0.8 });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "100vh" }}>
      <div style={{ borderRight: "1px solid #eee", padding: 16, overflow: "auto" }}>
        <h2 style={{ margin: 0 }}>Matcha Map Melbourne 🍵</h2>
        <p style={{ marginTop: 6, color: "#555" }}>Your personal ratings + notes.</p>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, suburb, notes…"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
          />

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14, color: "#444" }}>
              Minimum rating: <b>{minRating.toFixed(1)}</b>
            </span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            />
          </label>
        </div>

        <div style={{ marginTop: 14, color: "#666", fontSize: 14 }}>
          Showing <b>{places.length}</b> places
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {places.map((p) => (
            <button
              key={p.id}
              onClick={() => flyToPlace(p)}
              style={{
                textAlign: "left",
                padding: 12,
                borderRadius: 14,
                border: "1px solid #eee",
                background: "white",
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontWeight: 700 }}>{Number(p.rating).toFixed(1)}/5</div>
              </div>
              <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
                {(p.suburb || "Melbourne")} • {(p.bestOrder || "—")}
              </div>
              {p.notes ? (
                <div style={{ marginTop: 8, color: "#444", fontSize: 13 }}>{p.notes}</div>
              ) : null}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: "#777" }}>
          Edit <code>src/places.json</code> to add new spots.
        </div>
      </div>

      <div style={{ height: "100vh" }}>
        <MapContainer
          center={MELBOURNE_CENTER}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='© OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {places.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ marginBottom: 6 }}>
                    Rating: <b>{Number(p.rating).toFixed(1)}/5</b>
                  </div>
                  {p.bestOrder ? (
                    <div style={{ marginBottom: 6 }}>
                      Best order: <b>{p.bestOrder}</b>
                    </div>
                  ) : null}
                  {p.notes ? <div style={{ color: "#444" }}>{p.notes}</div> : null}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
