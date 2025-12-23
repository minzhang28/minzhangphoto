import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "https://api.minzhangphoto.com";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

// Camera icons for loading animation
const CameraIcons = {
  rangefinder: (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Body */}
      <rect x="20" y="30" width="80" height="40" rx="4" />
      {/* Lens */}
      <circle cx="60" cy="50" r="15" />
      <circle cx="60" cy="50" r="10" />
      {/* Viewfinder */}
      <rect x="25" y="22" width="15" height="8" rx="2" />
      {/* Shutter button */}
      <circle cx="85" cy="25" r="3" />
      {/* Film advance */}
      <rect x="75" y="22" width="8" height="6" rx="1" />
    </svg>
  ),
  slr: (
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Pentaprism */}
      <path d="M 45 20 L 35 35 L 85 35 L 75 20 Z" />
      {/* Body */}
      <rect x="25" y="35" width="70" height="45" rx="4" />
      {/* Lens */}
      <circle cx="60" cy="57.5" r="18" />
      <circle cx="60" cy="57.5" r="13" />
      <circle cx="60" cy="57.5" r="8" />
      {/* Shutter button */}
      <circle cx="82" cy="30" r="3" />
    </svg>
  ),
  tlr: (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Body */}
      <rect x="35" y="15" width="50" height="70" rx="4" />
      {/* Top lens (viewfinder) */}
      <circle cx="60" cy="35" r="12" />
      <circle cx="60" cy="35" r="8" />
      {/* Bottom lens (taking) */}
      <circle cx="60" cy="60" r="12" />
      <circle cx="60" cy="60" r="8" />
      {/* Side crank */}
      <rect x="85" y="45" width="8" height="4" />
      <circle cx="96" cy="47" r="4" />
    </svg>
  )
};

// Loading animation component
function LoadingAnimation() {
  const [currentIcon, setCurrentIcon] = useState(0);
  const icons = ['rangefinder', 'slr', 'tlr'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.loadingContainer}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIcon}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
          style={styles.loadingIconWrapper}
        >
          {CameraIcons[icons[currentIcon]]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Full screen project card component
function ProjectCard({ project, index, onClick }) {
  return (
    <section style={styles.projectCard}>
      <div style={styles.projectBackground}>
        <img
          src={getImageUrl(project.cover)}
          alt={project.title}
          style={styles.projectBackgroundImage}
        />
        <div style={styles.projectOverlay} />
      </div>

      <div style={styles.projectContent}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={styles.projectInfo}
        >
          <div style={styles.projectMeta}>
            <span>{project.location}</span>
            <span style={styles.projectMetaDot}>·</span>
            <span>{project.year}</span>
          </div>
          <h2 style={styles.projectTitle}>{project.title}</h2>
          <p style={styles.projectCount}>{project.count} PHOTOS</p>

          <button
            onClick={onClick}
            style={styles.viewButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f1f5f9";
              e.target.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#f1f5f9";
            }}
          >
            VIEW PROJECT
          </button>
        </motion.div>
      </div>

      {/* Scroll hint for first card */}
      {index === 0 && (
        <div style={styles.scrollHintBottom}>
          <span>SCROLL</span>
          <div style={styles.scrollArrowDown}>↓</div>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showContactSheet, setShowContactSheet] = useState(false);
  const imageRefs = useRef([]);

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

  const projectsByLocation = useMemo(() => {
    const groups = {};
    projects.forEach(p => {
      const loc = p.location || "Unknown";
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(p);
    });
    return groups;
  }, [projects]);

  const openProjectGallery = (project) => {
    setSelectedProject(project);
    setShowNavMenu(false);
  };

  const scrollToImage = (index) => {
    setShowContactSheet(false);
    setTimeout(() => {
      if (imageRefs.current[index]) {
        // Add flash effect
        const element = imageRefs.current[index];
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 0 40px rgba(245, 241, 232, 0.6)';

        // Scroll to image
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Remove flash after animation
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.style.boxShadow = '';
        }, 600);
      }
    }, 400); // Wait for overlay to dissolve
  };

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedProject]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (projects.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <span>NO PROJECTS FOUND</span>
      </div>
    );
  }

  // Featured projects (first 3)
  const featuredProjects = projects.slice(0, 3);
  // All projects for list view
  const allProjects = projects;

  return (
    <div style={styles.container}>
      {/* Scroll snap container */}
      <div style={styles.scrollContainer}>

        {/* Hero Section - 无背景图 */}
        <section style={styles.heroSection}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={styles.heroContent}
          >
            <h1 style={styles.mainTitle}>MIN ZHANG</h1>

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
          </motion.div>

          <div style={styles.scrollHint}>
            <span>SCROLL TO EXPLORE</span>
            <div style={styles.scrollArrow}>↓</div>
          </div>
        </section>

        {/* Featured Projects - Full Screen Cards */}
        {featuredProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onClick={() => setSelectedProject(project)}
          />
        ))}

        {/* Transition Section - View All */}
        <section
          style={styles.transitionSection}
          onClick={() => setShowNavMenu(true)}
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            style={styles.transitionContent}
          >
            <div style={styles.transitionLine} />
            <h3 style={styles.transitionTitle}>EXPLORE ALL PROJECTS</h3>
            <p style={styles.transitionSubtitle}>{allProjects.length} collections from around the world</p>
            <button
              style={styles.exploreButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f1f5f9";
                e.target.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#f1f5f9";
              }}
            >
              VIEW ALL
            </button>
            <div style={styles.transitionLine} />
          </motion.div>
        </section>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <p style={styles.footerText}>© 2025 MIN ZHANG · ALL RIGHTS RESERVED</p>
          </div>
          <div style={styles.footerRight}>
            <a href="#" style={styles.footerLink}>INSTAGRAM</a>
            <span style={styles.footerDivider}>·</span>
            <a href="#" style={styles.footerLink}>EMAIL</a>
          </div>
        </div>
      </footer>

      {/* Navigation Menu Overlay - Centered */}
      <AnimatePresence>
        {showNavMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.navOverlay}
            onClick={() => setShowNavMenu(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              style={styles.navMenu}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.navMenuHeader}>
                <button
                  onClick={() => setFilterType("all")}
                  style={{
                    ...styles.navFilterButton,
                    borderBottom: filterType === "all" ? "2px solid #f1f5f9" : "2px solid transparent"
                  }}
                >
                  ALL PROJECTS
                </button>
                <button
                  onClick={() => setFilterType("location")}
                  style={{
                    ...styles.navFilterButton,
                    borderBottom: filterType === "location" ? "2px solid #f1f5f9" : "2px solid transparent"
                  }}
                >
                  BY LOCATION
                </button>
                <button
                  onClick={() => setShowNavMenu(false)}
                  style={styles.navCloseButton}
                >
                  ✕
                </button>
              </div>

              <div style={styles.navMenuContent}>
                {filterType === "all" ? (
                  allProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => openProjectGallery(project)}
                      style={styles.navMenuItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(241,245,249,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span style={styles.navItemNumber}>
                        {String(project.displayId).padStart(2, "0")}
                      </span>
                      <span style={styles.navItemTitle}>{project.title}</span>
                      <span style={styles.navItemLocation}>{project.location}</span>
                    </div>
                  ))
                ) : (
                  Object.entries(projectsByLocation).map(([location, locationProjects]) => (
                    <div key={location} style={styles.navLocationGroup}>
                      <div style={styles.navLocationTitle}>{location}</div>
                      {locationProjects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => openProjectGallery(project)}
                          style={styles.navMenuItem}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(241,245,249,0.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span style={styles.navItemNumber}>
                            {String(project.displayId).padStart(2, "0")}
                          </span>
                          <span style={styles.navItemTitle}>{project.title}</span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

            {/* View Toggle Button - The Glass Toggle */}
            {!showContactSheet && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                onClick={() => setShowContactSheet(true)}
                style={styles.viewToggleButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(30, 41, 59, 0.95)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(30, 41, 59, 0.85)";
                }}
              >
                {/* Grid Icon - Four Small Squares */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="7" height="7" fill="currentColor" opacity="0.9" />
                  <rect x="13" y="4" width="7" height="7" fill="currentColor" opacity="0.9" />
                  <rect x="4" y="13" width="7" height="7" fill="currentColor" opacity="0.9" />
                  <rect x="13" y="13" width="7" height="7" fill="currentColor" opacity="0.9" />
                </svg>
              </motion.button>
            )}

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: showContactSheet ? 0.95 : 1,
                filter: showContactSheet ? "blur(60px) brightness(0.7)" : "blur(0px) brightness(1)"
              }}
              transition={{
                delay: 0.15,
                duration: showContactSheet ? 0.6 : 0.4,
                ease: "easeInOut"
              }}
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
                      ref={(el) => (imageRefs.current[index] = el)}
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
                    </motion.div>
                  ))}

                <div style={styles.galleryFooter}>
                  <div style={styles.galleryFooterLine} />
                  <span style={styles.galleryFooterText}>END OF PROJECT</span>
                  <button
                    onClick={() => setSelectedProject(null)}
                    style={styles.galleryCloseButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#334155";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#1e293b";
                    }}
                  >
                    CLOSE & RETURN
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Contact Sheet Overlay - The Frosted Glass Grid */}
            <AnimatePresence>
              {showContactSheet && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={styles.contactSheetOverlay}
                  onClick={() => setShowContactSheet(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={styles.contactSheetContainer}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div style={styles.contactSheetHeader}>
                      <span style={styles.contactSheetTitle}>
                        CONTACT SHEET — {selectedProject.images.length} IMAGES
                      </span>
                      <button
                        onClick={() => setShowContactSheet(false)}
                        style={styles.contactSheetClose}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Grid */}
                    <div style={styles.contactSheetGrid}>
                      {selectedProject.images.map((img, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.3 + index * 0.015,
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1]
                          }}
                          onClick={() => scrollToImage(index)}
                          style={styles.contactSheetItem}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.08)";
                            e.currentTarget.style.zIndex = "10";
                            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.zIndex = "1";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                          }}
                        >
                          <img
                            src={getImageUrl(img.url || img)}
                            alt={`Image ${index + 1}`}
                            style={styles.contactSheetImage}
                          />
                          <div style={styles.contactSheetNumber}>
                            {String(index + 1).padStart(2, "0")}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0f172a", // Slate-900 深色主题
    color: "#f1f5f9", // Slate-100 浅色文字
    fontFamily: "'Helvetica Neue', -apple-system, Arial, sans-serif",
  },
  loadingContainer: {
    height: "100vh",
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "30px",
  },
  loadingIconWrapper: {
    color: "#f1f5f9",
    opacity: 0.7,
  },
  scrollContainer: {
    scrollSnapType: "y mandatory",
    overflowY: "scroll",
    height: "100vh",
  },
  heroSection: {
    position: "relative",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    scrollSnapAlign: "start",
    backgroundColor: "#0f172a",
    padding: "0 20px", // 移动端padding
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    textAlign: "center",
  },
  mainTitle: {
    fontSize: "clamp(60px, 12vw, 140px)",
    fontWeight: "200",
    letterSpacing: "-0.02em",
    margin: "0 0 60px 0",
  },
  statsGrid: {
    display: "flex",
    gap: "40px",
    justifyContent: "center",
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
  },
  statLabel: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    opacity: 0.5,
  },
  statDivider: {
    width: "1px",
    height: "40px",
    backgroundColor: "rgba(241,245,249,0.2)",
  },
  scrollHint: {
    position: "absolute",
    bottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    fontSize: "10px",
    letterSpacing: "0.15em",
    opacity: 0.4,
    zIndex: 10,
  },
  scrollArrow: {
    fontSize: "16px",
    animation: "bounce 2s infinite",
  },
  scrollHintBottom: {
    position: "absolute",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    fontSize: "10px",
    letterSpacing: "0.15em",
    opacity: 0.4,
    zIndex: 10,
  },
  scrollArrowDown: {
    fontSize: "16px",
  },
  projectCard: {
    position: "relative",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    scrollSnapAlign: "start",
  },
  projectBackground: {
    position: "absolute",
    inset: 0,
  },
  projectBackgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.5,
  },
  projectOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.95) 100%)",
  },
  projectContent: {
    position: "relative",
    zIndex: 10,
    textAlign: "center",
    padding: "40px",
  },
  projectInfo: {
    maxWidth: "800px",
  },
  projectMeta: {
    fontSize: "13px",
    letterSpacing: "0.1em",
    opacity: 0.6,
    marginBottom: "20px",
  },
  projectMetaDot: {
    margin: "0 8px",
  },
  projectTitle: {
    fontSize: "clamp(50px, 10vw, 100px)",
    fontWeight: "200",
    letterSpacing: "-0.02em",
    margin: "0 0 16px 0",
  },
  projectCount: {
    fontSize: "12px",
    letterSpacing: "0.15em",
    opacity: 0.5,
    marginBottom: "40px",
  },
  viewButton: {
    padding: "16px 40px",
    background: "transparent",
    border: "2px solid #f1f5f9",
    borderRadius: "30px",
    color: "#f1f5f9",
    fontSize: "12px",
    letterSpacing: "0.15em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minHeight: "48px", // 移动端触摸友好
  },
  transitionSection: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    scrollSnapAlign: "start",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  transitionContent: {
    textAlign: "center",
    padding: "40px",
  },
  transitionLine: {
    width: "100px",
    height: "1px",
    backgroundColor: "rgba(241,245,249,0.2)",
    margin: "0 auto 30px",
  },
  transitionTitle: {
    fontSize: "clamp(24px, 5vw, 48px)",
    fontWeight: "300",
    letterSpacing: "0.05em",
    margin: "0 0 16px 0",
  },
  transitionSubtitle: {
    fontSize: "14px",
    opacity: 0.5,
    letterSpacing: "0.05em",
    marginBottom: "30px",
  },
  exploreButton: {
    padding: "16px 40px",
    background: "transparent",
    border: "2px solid #f1f5f9",
    borderRadius: "30px",
    color: "#f1f5f9",
    fontSize: "12px",
    letterSpacing: "0.15em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "30px",
    minHeight: "48px", // 移动端触摸友好
  },
  navOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navMenu: {
    width: "90%",
    maxWidth: "600px",
    maxHeight: "80vh",
    background: "rgba(30, 41, 59, 0.98)", // 深色主题
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(241,245,249,0.1)",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  navMenuHeader: {
    display: "flex",
    borderBottom: "1px solid rgba(241,245,249,0.1)",
    padding: "0 20px",
    position: "relative",
  },
  navFilterButton: {
    flex: 1,
    padding: "16px 0",
    background: "none",
    border: "none",
    color: "#f1f5f9",
    fontSize: "11px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    transition: "opacity 0.3s ease",
    opacity: 0.6,
    minHeight: "48px", // 移动端触摸友好
  },
  navCloseButton: {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#f1f5f9",
    fontSize: "20px",
    cursor: "pointer",
    padding: "12px",
    opacity: 0.7,
    transition: "opacity 0.3s ease",
    minWidth: "44px",
    minHeight: "44px",
  },
  navMenuContent: {
    maxHeight: "calc(80vh - 50px)",
    overflowY: "auto",
    padding: "12px",
  },
  navMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "4px",
  },
  navItemNumber: {
    fontSize: "11px",
    fontFamily: "monospace",
    opacity: 0.4,
    minWidth: "30px",
  },
  navItemTitle: {
    flex: 1,
    fontSize: "13px",
  },
  navItemLocation: {
    fontSize: "11px",
    opacity: 0.5,
  },
  navLocationGroup: {
    marginBottom: "20px",
  },
  navLocationTitle: {
    fontSize: "11px",
    letterSpacing: "0.15em",
    opacity: 0.4,
    padding: "12px 16px 8px",
    fontWeight: "600",
  },
  footer: {
    borderTop: "1px solid rgba(241,245,249,0.08)",
    padding: "40px 20px", // 移动端responsive padding
    backgroundColor: "#0f172a",
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
    color: "rgba(241,245,249,0.6)",
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
    filter: "blur(60px) brightness(0.8)",
    transform: "scale(1.2)",
  },
  galleryBackgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15,23,42,0.85)",
  },
  closeButton: {
    position: "fixed",
    top: "40px",
    right: "40px",
    background: "rgba(30, 41, 59, 0.9)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(241,245,249,0.2)",
    color: "#f1f5f9",
    width: "48px", // 移动端更大的触摸区域
    height: "48px",
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
    boxShadow: "0 30px 100px rgba(0,0,0,0.15)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  galleryFooter: {
    marginTop: "60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    paddingBottom: "40px",
  },
  galleryFooterLine: {
    width: "60px",
    height: "1px",
    backgroundColor: "rgba(241,245,249,0.2)",
  },
  galleryFooterText: {
    fontSize: "12px",
    letterSpacing: "0.15em",
    opacity: 0.5,
  },
  galleryCloseButton: {
    marginTop: "30px",
    padding: "16px 40px",
    background: "#1e293b",
    border: "none",
    borderRadius: "30px",
    color: "#f1f5f9",
    fontSize: "12px",
    letterSpacing: "0.15em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minHeight: "48px",
  },
  // View Toggle Button (Floating) - The Glass Toggle
  viewToggleButton: {
    position: "fixed",
    bottom: "40px",
    right: "40px",
    background: "rgba(30, 41, 59, 0.85)", // Slate-800 深色磨砂
    backdropFilter: "blur(16px) saturate(180%)",
    border: "1px solid rgba(148, 163, 184, 0.15)", // Slate-400 边框
    color: "#F5F1E8",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 102,
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 40px rgba(15, 23, 42, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.05)",
  },
  // Contact Sheet Overlay - The Frosted Glass
  contactSheetOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    backgroundColor: "rgba(15, 23, 42, 0.85)", // Slate-900 深色不刺眼
    backdropFilter: "blur(24px) saturate(120%)",
    zIndex: 103,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  contactSheetContainer: {
    width: "100%",
    maxWidth: "1400px",
    maxHeight: "90vh",
    background: "rgba(30, 41, 59, 0.97)", // 深色磨砂玻璃
    backdropFilter: "blur(50px) saturate(150%)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 40px 120px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(148, 163, 184, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  contactSheetHeader: {
    padding: "20px 24px", // 移动端responsive padding
    borderBottom: "1px solid rgba(241,245,249,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
  },
  contactSheetTitle: {
    fontSize: "10px", // 移动端稍小
    letterSpacing: "0.15em",
    fontWeight: "600",
    color: "#f1f5f9",
  },
  contactSheetClose: {
    background: "none",
    border: "none",
    color: "#f1f5f9",
    fontSize: "24px",
    cursor: "pointer",
    padding: "12px", // 移动端更大触摸区域
    opacity: 0.7,
    transition: "opacity 0.3s ease",
    minWidth: "44px",
    minHeight: "44px",
  },
  contactSheetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(140px, 100%), 1fr))", // 移动端自适应
    gap: "12px",
    padding: "16px",
    overflowY: "auto",
    flex: 1,
  },
  contactSheetItem: {
    position: "relative",
    aspectRatio: "3 / 2",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)",
    backgroundColor: "rgba(30, 41, 59, 0.3)",
  },
  contactSheetImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  contactSheetNumber: {
    position: "absolute",
    top: "8px",
    left: "8px",
    fontSize: "10px",
    fontFamily: "monospace",
    color: "#f1f5f9",
    backgroundColor: "rgba(15,23,42,0.8)",
    padding: "4px 8px",
    borderRadius: "4px",
    backdropFilter: "blur(4px)",
  },
  // 移动端媒体查询会通过内联样式动态应用
};
