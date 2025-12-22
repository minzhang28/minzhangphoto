
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "https://api.minzhangphoto.com";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

export default function App() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [randomHeroIndex, setRandomHeroIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/collections`);
        const data = await response.json();

        const processedData = data.map((item, index) => ({
          ...item,
          displayId: index + 1,
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

  const stats = useMemo(() => {
    if (projects.length === 0) return { totalPhotos: 0, uniqueLocations: 0, totalProjects: 0 };

    const totalPhotos = projects.reduce(
      (acc, curr) => acc + (curr.count || curr.images?.length || 0),
      0
    );
    const uniqueLocations = new Set(
      projects.map((p) => p.location).filter(Boolean)
    ).size;
    return { totalPhotos, uniqueLocations, totalProjects: projects.length };
  }, [projects]);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedProject]);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span style={styles.loadingText}>LOADING</span>
          <motion.div
            style={styles.loadingDots}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <span>NO PROJECTS FOUND</span>
      </div>
    );
  }

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroScale = 1 + scrollY / 2000;

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBgWrapper}>
          <div
            style={{
              ...styles.heroImageWrapper,
              transform: `scale(${heroScale})`,
              opacity: heroOpacity,
            }}
          >
            <img
              src={getImageUrl(projects[randomHeroIndex].cover)}
              alt="Hero"
              style={styles.heroImage}
            />
          </div>
          <div style={styles.heroOverlay} />
        </div>

        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={styles.heroTitle}
          >
            <h1 style={styles.mainTitle}>VISUAL STORIES</h1>
            <p style={styles.subtitle}>A COLLECTION OF MOMENTS FROZEN IN TIME</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            style={styles.heroFooter}
          >
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{stats.totalProjects}</span>
                <span style={styles.statLabel}>PROJECTS</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{stats.totalPhotos}</span>
                <span style={styles.statLabel}>PHOTOS</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{stats.uniqueLocations}</span>
                <span style={styles.statLabel}>LOCATIONS</span>
              </div>
            </div>
            <div style={styles.scrollHint}>
              <span>SCROLL TO EXPLORE</span>
              <div style={styles.scrollArrow}>↓</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* List Section */}
      <main style={styles.listSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>ALL PROJECTS</h2>
          <div style={styles.sectionLine} />
        </div>

        <div style={styles.listContainer}>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => setSelectedProject(project)}
              style={styles.listItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={styles.itemContent}>
                <span style={styles.idNumber}>
                  {String(project.displayId).padStart(2, "0")}
                </span>
                <div style={styles.itemMain}>
                  <h2 style={styles.title}>{project.title}</h2>
                  <div style={styles.itemMeta}>
                    <span style={styles.metaLocation}>{project.location}</span>
                    <span style={styles.metaDot}>·</span>
                    <span style={styles.metaCount}>{project.count} PHOTOS</span>
                    <span style={styles.metaDot}>·</span>
                    <span style={styles.metaYear}>{project.year}</span>
                  </div>
                </div>
                <div style={styles.itemArrow}>→</div>
              </div>

              {/* Preview thumbnails */}
              <div style={styles.thumbnailsWrapper}>
                {project.previewImages?.slice(0, 3).map((img, i) => (
                  <div key={i} style={styles.thumbnailItem}>
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      style={styles.thumbnailImage}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <p style={styles.footerText}>© 2025 · ALL RIGHTS RESERVED</p>
          </div>
          <div style={styles.footerRight}>
            <a href="#" style={styles.footerLink}>INSTAGRAM</a>
            <span style={styles.footerDivider}>·</span>
            <a href="#" style={styles.footerLink}>EMAIL</a>
          </div>
        </div>
      </footer>

      {/* Gallery Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={styles.galleryOverlay}
          >
            <div style={styles.galleryBackgroundWrapper}>
              <img
                src={getImageUrl(selectedProject.cover)}
                alt="bg"
                style={styles.galleryBackgroundImage}
              />
              <div style={styles.galleryBackgroundOverlay} />
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              style={styles.closeButton}
            >
              ✕
            </button>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={styles.galleryContent}
            >
              <div style={styles.galleryHeader}>
                <h1 style={styles.galleryTitle}>{selectedProject.title}</h1>
                <div style={styles.galleryMeta}>
                  <span>{selectedProject.location}</span>
                  <span style={styles.galleryMetaDot}>·</span>
                  <span>{selectedProject.year}</span>
                  <span style={styles.galleryMetaDot}>·</span>
                  <span>{selectedProject.images.length} IMAGES</span>
                </div>
              </div>

              <div style={styles.galleryScroll}>
                {selectedProject.images &&
                  selectedProject.images.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-200px" }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      style={styles.galleryImageContainer}
                    >
                      <img
                        src={getImageUrl(img.url || img)}
                        alt=""
                        style={styles.galleryImage}
                      />
                      <span style={styles.imageIndex}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </motion.div>
                  ))}

                <div style={styles.galleryFooter}>
                  <div style={styles.galleryFooterLine} />
                  <span>END OF PROJECT</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    fontFamily: "'Helvetica Neue', -apple-system, Arial, sans-serif",
    minHeight: "100vh",
  },
  loadingContainer: {
    height: "100vh",
    width: "100vw",
    backgroundColor: "#0a0a0a",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "monospace",
  },
  loadingText: {
    fontSize: "14px",
    letterSpacing: "4px",
    marginBottom: "10px",
  },
  loadingDots: {
    fontSize: "20px",
    letterSpacing: "2px",
  },
  heroSection: {
    position: "relative",
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
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
  heroImageWrapper: {
    width: "100%",
    height: "100%",
    transition: "transform 0.1s ease-out",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.5,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle at 50% 50%, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.95) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "80px 40px 60px",
  },
  heroTitle: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  mainTitle: {
    fontSize: "clamp(60px, 12vw, 140px)",
    fontWeight: "200",
    letterSpacing: "-0.02em",
    margin: "0 0 20px 0",
    lineHeight: "0.9",
  },
  subtitle: {
    fontSize: "clamp(12px, 2vw, 16px)",
    letterSpacing: "0.15em",
    opacity: 0.6,
    fontWeight: "300",
  },
  heroFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "40px",
    flexWrap: "wrap",
  },
  statsGrid: {
    display: "flex",
    gap: "40px",
    alignItems: "center",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statNumber: {
    fontSize: "clamp(40px, 8vw, 64px)",
    fontWeight: "200",
    lineHeight: "1",
  },
  statLabel: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    opacity: 0.5,
    fontWeight: "500",
  },
  statDivider: {
    width: "1px",
    height: "40px",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  scrollHint: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    fontSize: "10px",
    letterSpacing: "0.15em",
    opacity: 0.4,
  },
  scrollArrow: {
    fontSize: "16px",
    animation: "bounce 2s infinite",
  },
  listSection: {
    backgroundColor: "#0a0a0a",
    position: "relative",
    padding: "120px 40px",
    minHeight: "100vh",
  },
  sectionHeader: {
    maxWidth: "1400px",
    margin: "0 auto 80px",
    display: "flex",
    alignItems: "center",
    gap: "30px",
  },
  sectionTitle: {
    fontSize: "14px",
    letterSpacing: "0.2em",
    fontWeight: "500",
    margin: 0,
    opacity: 0.5,
    whiteSpace: "nowrap",
  },
  sectionLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(to right, rgba(255,255,255,0.2) 0%, transparent 100%)",
  },
  listContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  listItem: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "50px 0",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  itemContent: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
    marginBottom: "30px",
  },
  idNumber: {
    fontSize: "14px",
    fontFamily: "monospace",
    color: "rgba(255,255,255,0.3)",
    minWidth: "40px",
  },
  itemMain: {
    flex: 1,
  },
  title: {
    fontSize: "clamp(40px, 6vw, 64px)",
    fontWeight: "200",
    margin: "0 0 12px 0",
    letterSpacing: "-0.02em",
    transition: "transform 0.3s ease",
  },
  itemMeta: {
    display: "flex",
    gap: "12px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.05em",
  },
  metaLocation: {},
  metaDot: {
    opacity: 0.3,
  },
  metaCount: {},
  metaYear: {},
  itemArrow: {
    fontSize: "32px",
    opacity: 0.3,
    transition: "all 0.3s ease",
  },
  thumbnailsWrapper: {
    display: "flex",
    gap: "16px",
    marginLeft: "80px",
    opacity: 0.6,
    transition: "opacity 0.3s ease",
  },
  thumbnailItem: {
    width: "120px",
    height: "80px",
    overflow: "hidden",
    borderRadius: "4px",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "40px",
    backgroundColor: "#0a0a0a",
  },
  footerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  footerLeft: {},
  footerText: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    opacity: 0.4,
    margin: 0,
  },
  footerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  footerLink: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    transition: "color 0.3s ease",
  },
  footerDivider: {
    opacity: 0.3,
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
  },
  galleryBackgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "blur(60px) brightness(0.3)",
    transform: "scale(1.2)",
  },
  galleryBackgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeButton: {
    position: "fixed",
    top: "40px",
    right: "40px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 101,
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
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
    padding: "140px 40px 80px",
    textAlign: "center",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  galleryTitle: {
    fontSize: "clamp(50px, 10vw, 96px)",
    margin: "0 0 24px 0",
    fontWeight: "200",
    letterSpacing: "-0.02em",
  },
  galleryMeta: {
    fontSize: "13px",
    letterSpacing: "0.1em",
    opacity: 0.6,
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },
  galleryMetaDot: {
    opacity: 0.4,
  },
  galleryScroll: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "80px",
    paddingBottom: "120px",
  },
  galleryImageContainer: {
    width: "90%",
    maxWidth: "1200px",
    position: "relative",
    boxShadow: "0 30px 100px rgba(0,0,0,0.6)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  imageIndex: {
    position: "absolute",
    top: "20px",
    left: "-50px",
    fontFamily: "monospace",
    fontSize: "12px",
    opacity: 0.4,
  },
  galleryFooter: {
    marginTop: "60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  galleryFooterLine: {
    width: "60px",
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
};

