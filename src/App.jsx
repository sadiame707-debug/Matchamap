import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import placesData from "./places.json";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const MELBOURNE_CENTER = [-37.8136, 144.9631];

const theme = {
  bg: "#F7FBF8",
  sidebar: "#EEF6F0",
  card: "#FFFFFF",
  border: "#DCE9E0",
  primary: "#6BAF92",
  primaryDark: "#4E8F74",
  accent: "#DDEEE4",
  text: "#24332B",
  muted: "#66756D",
  shadow: "0 10px 30px rgba(36, 51, 43, 0.08)",
  shadowSoft: "0 4px 16px rgba(36, 51, 43, 0.06)"
};

const matchaDivIcon = (rating = 0) =>
  L.divIcon({
    className: "custom-matcha-marker",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: ${rating >= 4.5 ? theme.primaryDark : theme.primary};
        border: 3px solid white;
        border-radius: 999px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.18);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });

function FlyToPlace({ selectedPlace }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedPlace) return;
    map.flyTo([selectedPlace.lat, selectedPlace.lng], 15, { duration: 0.9 });
  }, [selectedPlace, map]);

  return null;
}

function getRatingLabel(rating) {
  if (rating >= 4.8) return "must try";
  if (rating >= 4.5) return "favourite";
  if (rating >= 4.0) return "worth a visit";
  return "casual stop";
}

export default function App() {
  const mapRef = useRef(null);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const places = useMemo(() => {
    const s = search.trim().toLowerCase();

    return placesData
      .filter((p) => (Number(p.rating) || 0) >= minRating)
      .filter((p) => {
        if (!s) return true;
        return (
          p.name.toLowerCase().includes(s) ||
          (p.suburb || "").toLowerCase().includes(s) ||
          (p.notes || "").toLowerCase().includes(s) ||
          (p.bestOrder || "").toLowerCase().includes(s)
        );
      })
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
  }, [search, minRating]);

  const topPick = places[0];

  const flyToPlace = (place) => {
    setSelectedPlace(place);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: Inter, sans-serif;
          background: ${theme.bg};
          color: ${theme.text};
        }

        body {
          overflow: hidden;
        }

        .leaflet-container {
          width: 100%;
          height: 100%;
          font-family: Inter, sans-serif;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 18px;
          box-shadow: ${theme.shadow};
        }

        .leaflet-popup-content {
          margin: 14px 16px;
        }

        .leaflet-control-zoom a {
          border-radius: 12px !important;
          color: ${theme.text} !important;
        }

        .place-card {
          text-align: left;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid ${theme.border};
          background: ${theme.card};
          cursor: pointer;
          box-shadow: ${theme.shadowSoft};
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          width: 100%;
        }

        .place-card:hover {
          transform: translateY(-2px);
          box-shadow: ${theme.shadow};
          border-color: #bfd8c8;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #d0e2d7;
          border-radius: 999px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "400px 1fr",
          height: "100vh",
          background: theme.bg
        }}
      >
        <aside
          className="sidebar-scroll"
          style={{
            borderRight: `1px solid ${theme.border}`,
            padding: 20,
            overflow: "auto",
            background: `linear-gradient(180deg, ${theme.sidebar} 0%, #F8FCF9 100%)`
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${theme.border}`,
              borderRadius: 24,
              padding: 18,
              boxShadow: theme.shadowSoft
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                borderRadius: 999,
                background: theme.accent,
                color: theme.primaryDark,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.6
              }}
            >
              Melbourne matcha guide
            </div>

            <h1
              style={{
                margin: "14px 0 6px 0",
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                lineHeight: 1.05,
                fontSize: 34,
                letterSpacing: -0.6
              }}
            >
              Matcha Map Melbourne 🍵
            </h1>

            <p
              style={{
                margin: 0,
                color: theme.muted,
                lineHeight: 1.55,
                fontSize: 14
              }}
            >
              A soft little guide to the best matcha spots around Melbourne — save your favourites,
              browse by suburb, and find your next café stop.
            </p>

            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, suburb, notes, best order..."
                style={{
                  width: "100%",
                  padding: "13px 15px",
                  borderRadius: 16,
                  border: `1px solid ${theme.border}`,
                  background: "#fff",
                  outline: "none",
                  fontSize: 14,
                  color: theme.text,
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)"
                }}
              />

              <div
                style={{
                  borderRadius: 18,
                  background: "#fff",
                  border: `1px solid ${theme.border}`,
                  padding: 14
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                    gap: 10
                  }}
                >
                  <span style={{ fontSize: 14, color: theme.muted }}>Minimum rating</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.primaryDark,
                      background: theme.accent,
                      padding: "6px 10px",
                      borderRadius: 999
                    }}
                  >
                    ⭐ {minRating.toFixed(1)}+
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  style={{ width: "100%", accentColor: theme.primary }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 14
            }}
          >
            <div
              style={{
                background: theme.card,
                borderRadius: 20,
                border: `1px solid ${theme.border}`,
                padding: 14,
                boxShadow: theme.shadowSoft
              }}
            >
              <div style={{ color: theme.muted, fontSize: 13 }}>Showing</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{places.length}</div>
              <div style={{ color: theme.muted, fontSize: 13, marginTop: 2 }}>places</div>
            </div>

            <div
              style={{
                background: theme.card,
                borderRadius: 20,
                border: `1px solid ${theme.border}`,
                padding: 14,
                boxShadow: theme.shadowSoft
              }}
            >
              <div style={{ color: theme.muted, fontSize: 13 }}>Top pick</div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4, lineHeight: 1.2 }}>
                {topPick?.name || "—"}
              </div>
              <div style={{ color: theme.primaryDark, fontSize: 13, marginTop: 4 }}>
                {topPick ? `⭐ ${Number(topPick.rating).toFixed(1)}` : "No match"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "grid", gap: 12, paddingBottom: 30 }}>
            {places.map((p) => {
              const rating = Number(p.rating) || 0;
              const isSelected = selectedPlace?.id === p.id;

              return (
                <button
                  key={p.id}
                  className="place-card"
                  onClick={() => flyToPlace(p)}
                  style={{
                    borderColor: isSelected ? "#b9d7c4" : theme.border,
                    boxShadow: isSelected ? theme.shadow : theme.shadowSoft
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 17 }}>{p.name}</div>
                      <div style={{ marginTop: 6, color: theme.muted, fontSize: 13 }}>
                        {(p.suburb || "Melbourne")} • {p.bestOrder || "No best order added yet"}
                      </div>
                    </div>

                    <div
                      style={{
                        whiteSpace: "nowrap",
                        fontWeight: 700,
                        color: theme.primaryDark,
                        background: theme.accent,
                        borderRadius: 999,
                        padding: "7px 10px",
                        fontSize: 13
                      }}
                    >
                      ⭐ {rating.toFixed(1)}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: "inline-flex",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "#F5FAF7",
                      border: `1px solid ${theme.border}`,
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.primaryDark,
                      textTransform: "capitalize"
                    }}
                  >
                    {getRatingLabel(rating)}
                  </div>

                  {p.notes ? (
                    <div
                      style={{
                        marginTop: 10,
                        color: theme.text,
                        fontSize: 13,
                        lineHeight: 1.55
                      }}
                    >
                      {p.notes}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <main style={{ height: "100vh", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              zIndex: 500,
              top: 18,
              left: 18,
              background: "rgba(255,255,255,0.86)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.border}`,
              borderRadius: 18,
              padding: "12px 14px",
              boxShadow: theme.shadowSoft,
              maxWidth: 320
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 14, color: theme.text }}>Explore on the map</div>
            <div style={{ marginTop: 4, fontSize: 13, color: theme.muted, lineHeight: 1.5 }}>
              Click a café card to fly across Melbourne and open its matcha details.
            </div>
          </div>

          <MapContainer
            center={MELBOURNE_CENTER}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <FlyToPlace selectedPlace={selectedPlace} />

            <TileLayer
              attribution='© OpenStreetMap contributors © CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {places.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={matchaDivIcon(Number(p.rating) || 0)}
                eventHandlers={{
                  click: () => setSelectedPlace(p)
                }}
              >
                <Popup>
                  <div style={{ minWidth: 240 }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "5px 10px",
                        borderRadius: 999,
                        background: theme.accent,
                        color: theme.primaryDark,
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: 0.5
                      }}
                    >
                      {p.suburb || "Melbourne"}
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{p.name}</div>

                    <div style={{ marginBottom: 8, color: theme.primaryDark, fontWeight: 700 }}>
                      ⭐ {Number(p.rating).toFixed(1)} / 5
                    </div>

                    {p.bestOrder ? (
                      <div style={{ marginBottom: 8, color: theme.text, lineHeight: 1.5 }}>
                        <span style={{ color: theme.muted }}>Best order:</span> <b>{p.bestOrder}</b>
                      </div>
                    ) : null}

                    {p.notes ? (
                      <div style={{ color: theme.text, lineHeight: 1.55 }}>{p.notes}</div>
                    ) : (
                      <div style={{ color: theme.muted }}>No notes added yet.</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </main>
      </div>
    </>
  );
}

