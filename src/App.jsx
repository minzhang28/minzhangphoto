import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css"; // 如果你有css的话

// 样式对象 (简单的内联样式，你可以保持你原本的 CSS)
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    color: "#333",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "300px",
    objectFit: "cover",
    display: "block",
  },
  info: {
    padding: "15px",
  },
  title: {
    margin: "0 0 5px 0",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  location: {
    margin: "0",
    color: "#666",
    fontSize: "0.9rem",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    fontSize: "1.5rem",
    color: "#888",
  },
};

function App() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // 替换成你的 Worker 地址
    fetch("https://api.minzhangphoto.com") 
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load photos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <span>LOADING...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>MinZhang Photography</h1>
      </header>

      <div style={styles.grid}>
        {photos.map((photo) => (
          <motion.div
            layoutId={`card-${photo.id}`} // 使用 Worker 返回的唯一 UUID
            key={photo.id}
            style={styles.card}
            onClick={() => setSelectedId(photo.id)}
            whileHover={{ y: -5 }}
          >
            {/* 关键点：直接使用 photo.cover，不要再手动拼接 URL */}
            <motion.img
              src={photo.cover} 
              alt={photo.title}
              style={styles.image}
              layoutId={`image-${photo.id}`}
            />
            <div style={styles.info}>
              <h3 style={styles.title}>{photo.title}</h3>
              <p style={styles.location}>{photo.location}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            layoutId={`card-${selectedId}`}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            onClick={() => setSelectedId(null)}
          >
            {(() => {
              const photo = photos.find((p) => p.id === selectedId);
              if (!photo) return null;
              return (
                <motion.div
                  style={{
                    background: "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                    maxWidth: "90%",
                    maxHeight: "90%",
                  }}
                  onClick={(e) => e.stopPropagation()} // 防止点击图片关闭
                >
                  <motion.img
                    src={photo.cover} // 这里也直接用 photo.cover
                    layoutId={`image-${photo.id}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "80vh",
                      objectFit: "contain",
                      display: "block",
                      borderRadius: "5px",
                    }}
                  />
                  <div style={{ padding: "10px" }}>
                    <h3>{photo.title}</h3>
                    <p>{photo.location}</p>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
