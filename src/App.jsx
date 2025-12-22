
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "https://api.minzhangphoto.com";

// Helper function to get full image URL
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path; // Already full URL
  return `${API_BASE_URL}${path}`; // Add base URL to relative path
};

export default function App() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [randomHeroIndex, setRandomHeroIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch Data from Worker API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // FIXED: Use correct endpoint
        const response = await fetch(`${API_BASE_URL}/api/collections`);
        const data = await response.json();

        console.log("Fetched data:", data); // Debug

        // FIXED: Add displayId for UI compatibility
        const processedData = data.map((item, index) => ({
          ...item,
          displayId: index + 1, // Add sequential display ID
          // FIXED: Ensure 'images' field exists for gallery view
          images: item.images || item.previewImages || [],
        }));

        setProjects(processedData);

        if (processedData.length > 0) {
          setRandomHeroIndex(Math.floor(Math.random() * processedData.length));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    if (projects.length === 0) return { totalPhotos: 0, uniqueLocations: 0 };

    const totalPhotos = projects.reduce(
      (acc, curr) => acc + (curr.count || curr.images?.length || 0),
      0
    );
    const uniqueLocations = new Set(
      projects.map((p) => p.location).filter(Boolean)
    ).size;
    return { totalPhotos, uniqueLocations };
  }, [projects]);

  // Disable scroll when gallery is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedProject]);

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <span>LOADING...</span>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <span>NO PROJECTS FOUND</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBgWrapper}>
          <img
            src={getImageUrl(projects[randomHeroIndex].cover)}
            alt="Hero"
            style={styles.heroImage}
          />
          <div style={styles.heroOverlay} />
        </div>

        <header style={styles.header}>
          <div style={styles.logo}>AMBER PROTO</div>
          <div style={styles.logo}>INDEX</div>
        </header>

        <div style={styles.heroFooter}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{stats.totalPhotos}</span>
            <span style={styles.statLabel}>PHOTOS</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{stats.uniqueLocations}</span>
            <span style={styles.statLabel}>LOCATIONS</span>
          </div>
          <div style={styles.scrollHint}>SCROLL TO EXPLORE</div>
        </div>
      </section>

      {/* List Section */}
      <main style={styles.listSection}>
        <div style={styles.listContainer}>
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              style={styles.listItem}
            >
              <div style={styles.itemContent}>
                <span style={styles.idNumber}>
                  {String(project.displayId).padStart(2, "0")}
                </span>
                <h2 style={styles.title}>{project.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Gallery Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={styles.galleryOverlay}
          >
            {/* Blurred background */}
            <div style={styles.galleryBackgroundWrapper}>
              <img
                src={getImageUrl(selectedProject.cover)}
                alt="bg"
                style={styles.galleryBackgroundImage}
              />
              <div style={styles.galleryBackgroundOverlay} />
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedProject(null)}
              style={styles.closeButton}
            >
              CLOSE
            </button>

            {/* Gallery content */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={styles.galleryContent}
            >
              <div style={styles.galleryHeader}>
                <h1 style={styles.galleryTitle}>{selectedProject.title}</h1>
                <p style={styles.galleryLocation}>{selectedProject.location}</p>
              </div>

              <div style={styles.galleryScroll}>
                {selectedProject.images &&
                  selectedProject.images.map((img, index) => (
                    <div key={index} style={styles.galleryImageContainer}>
                      <img
                        src={getImageUrl(img.url || img)}
                        alt=""
                        style={styles.galleryImage}
                      />
                      <span style={styles.imageIndex}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  ))}

                <div style={styles.galleryFooter}>END OF PROJECT</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Styles (unchanged)
const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    minHeight: "200vh",
  },
  loadingContainer: {
    height: "100vh",
    width: "100vw",
    backgroundColor: "#0a0a0a",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "monospace",
    fontSize: "14px",
    letterSpacing: "2px",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    padding: "30px",
    display: "flex",
    justifyContent: "space-between",
    zIndex: 20,
    boxSizing: "border-box",
    mixBlendMode: "difference",
  },
  logo: {
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "2px",
  },
  heroSection: {
    position: "relative",
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroBgWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.6,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(10,10,10,1) 100%)",
  },
  heroFooter: {
    position: "relative",
    zIndex: 10,
    padding: "0 30px 60px 30px",
    display: "flex",
    alignItems: "flex-end",
    gap: "60px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
  },
  statNumber: {
    fontSize: "64px",
    fontWeight: "300",
    lineHeight: "1",
  },
  statLabel: {
    fontSize: "12px",
    letterSpacing: "1px",
    opacity: 0.6,
    marginTop: "10px",
  },
  scrollHint: {
    marginLeft: "auto",
    fontSize: "12px",
    opacity: 0.5,
    marginBottom: "10px",
  },
  listSection: {
    backgroundColor: "#0a0a0a",
    position: "relative",
    zIndex: 10,
    padding: "100px 20px",
  },
  listContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  listItem: {
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "40px 0",
    cursor: "pointer",
    position: "relative",
    zIndex: 2,
    transition: "opacity 0.3s",
  },
  itemContent: {
    display: "flex",
    alignItems: "baseline",
    gap: "40px",
  },
  idNumber: {
    fontSize: "14px",
    fontFamily: "monospace",
    color: "rgba(255,255,255,0.4)",
  },
  title: {
    fontSize: "60px",
    fontWeight: "300",
    margin: 0,
    letterSpacing: "-2px",
  },
  galleryOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    zIndex: 100,
  },
  galleryBackgroundWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    overflow: "hidden",
  },
  galleryBackgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "blur(40px) brightness(0.4)",
    transform: "scale(1.1)",
  },
  galleryBackgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  closeButton: {
    position: "fixed",
    top: "30px",
    right: "30px",
    background: "none",
    border: "1px solid rgba(255,255,255,0.5)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "20px",
    cursor: "pointer",
    zIndex: 101,
    fontSize: "12px",
    backdropFilter: "blur(10px)",
  },
  galleryContent: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
  },
  galleryHeader: {
    padding: "120px 40px 60px 40px",
    textAlign: "center",
  },
  galleryTitle: {
    fontSize: "80px",
    margin: "0 0 20px 0",
    fontWeight: "300",
    letterSpacing: "-2px",
    textShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  galleryLocation: {
    fontSize: "14px",
    letterSpacing: "2px",
    opacity: 0.8,
    textTransform: "uppercase",
  },
  galleryScroll: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "100px",
    paddingBottom: "100px",
  },
  galleryImageContainer: {
    width: "80%",
    maxWidth: "1000px",
    position: "relative",
    boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
  },
  galleryImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  imageIndex: {
    position: "absolute",
    top: "0",
    left: "-40px",
    fontFamily: "monospace",
    fontSize: "12px",
    opacity: 0.6,
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  galleryFooter: {
    marginTop: "50px",
    fontSize: "12px",
    opacity: 0.5,
    letterSpacing: "2px",
  },
};

