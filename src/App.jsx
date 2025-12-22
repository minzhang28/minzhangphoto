
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "https://api.minzhangphoto.com";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

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
              e.target.style.backgroundColor = "#1a1a1a";
              e.target.style.color = "#F5F1E8";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#1a1a1a";
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

  const scrollToProject = (projectId) => {
    const element = document.getElementById(`project-${projectId}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
      setShowNavMenu(false);
    }
  };

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

  // Featured projects (first 3)
  const featuredProjects = projects.slice(0, 3);
  // All projects for list view
  const allProjects = projects;

  return (
    <div style={styles.container}>
      {/* Scroll snap container */}
      <div style={styles.scrollContainer}>
        
        {/* Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.heroBackground}>
            <img
              src={getImageUrl(projects[0]?.cover)}
              alt="Hero"
              style={styles.heroImage}
            />
            <div style={styles.heroOverlay} />
          </div>

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
        <section style={styles.transitionSection}>
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
            <div style={styles.transitionLine} />
          </motion.div>
        </section>
      </div>

      {/* All Projects List */}
      <main style={styles.listSection}>
        {/* Quick Navigation */}
        <div style={styles.quickNav}>
          <button
            onClick={() => setShowNavMenu(!showNavMenu)}
            style={{
              ...styles.quickNavButton,
              backgroundColor: showNavMenu ? "rgba(26,26,26,0.12)" : "rgba(26,26,26,0.05)"
            }}
          >
            <span style={styles.quickNavIcon}>☰</span>
            <span style={styles.quickNavText}>QUICK NAV</span>
          </button>

          <AnimatePresence>
            {showNavMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={styles.navMenu}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.navMenuHeader}>
                  <button
                    onClick={() => setFilterType("all")}
                    style={{
                      ...styles.navFilterButton,
                      borderBottom: filterType === "all" ? "2px solid #1a1a1a" : "2px solid transparent"
                    }}
                  >
                    ALL PROJECTS
                  </button>
                  <button
                    onClick={() => setFilterType("location")}
                    style={{
                      ...styles.navFilterButton,
                      borderBottom: filterType === "location" ? "2px solid #1a1a1a" : "2px solid transparent"
                    }}
                  >
                    BY LOCATION
                  </button>
                </div>

                <div style={styles.navMenuContent}>
                  {filterType === "all" ? (
                    allProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => scrollToProject(project.id)}
                        style={styles.navMenuItem}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(26,26,26,0.08)";
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
                            onClick={() => scrollToProject(project.id)}
                            style={styles.navMenuItem}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(26,26,26,0.08)";
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
            )}
          </AnimatePresence>
        </div>

        <div style={styles.listContainer}>
          {allProjects.map((project, index) => (
            <motion.div
              key={project.id}
              id={`project-${project.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              onClick={() => setSelectedProject(project)}
              style={styles.listItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(26,26,26,0.02)";
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
                    <span>{project.location}</span>
                    <span style={styles.metaDot}>·</span>
                    <span>{project.count} PHOTOS</span>
                    <span style={styles.metaDot}>·</span>
                    <span>{project.year}</span>
                  </div>
                </div>
                <div style={styles.itemArrow}>→</div>
              </div>

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
            <p style={styles.footerText}>© 2025 MIN ZHANG · ALL RIGHTS RESERVED</p>
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
                    </motion.div>
                  ))}

                <div style={styles.galleryFooter}>
                  <div style={styles.galleryFooterLine} />
                  <span style={styles.galleryFooterText}>END OF PROJECT</span>
                  <button
                    onClick={() => setSelectedProject(null)}
                    style={styles.galleryCloseButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#2a2a2a";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#1a1a1a";
                    }}
                  >
                    CLOSE & RETURN
                  </button>
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
    backgroundColor: "#F5F1E8",
    color: "#1a1a1a",
    fontFamily: "'Helvetica Neue', -apple-system, Arial, sans-serif",
  },
  loadingContainer: {
    height: "100vh",
    backgroundColor: "#F5F1E8",
    color: "#1a1a1a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: "14px",
    letterSpacing: "4px",
  },
  scrollContainer: {
    scrollSnapType: "y mandatory",
    overflowY: "scroll",
    height: "100vh",
  },
  // Hero Section
  heroSection: {
    position: "relative",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    scrollSnapAlign: "start",
  },
  heroBackground: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.4,
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(245,241,232,0.3) 0%, rgba(245,241,232,0.95) 100%)",
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
    margin: "0 0 20px 0",
  },
  subtitle: {
    fontSize: "clamp(12px, 2vw, 16px)",
    letterSpacing: "0.15em",
    opacity: 0.6,
    marginBottom: "60px",
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
    backgroundColor: "rgba(26,26,26,0.2)",
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
  // Project Cards
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
    background: "linear-gradient(to bottom, rgba(245,241,232,0.5) 0%, rgba(245,241,232,0.9) 100%)",
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
    border: "2px solid #1a1a1a",
    borderRadius: "30px",
    color: "#1a1a1a",
    fontSize: "12px",
    letterSpacing: "0.15em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  // Transition Section
  transitionSection: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    scrollSnapAlign: "start",
  },
  transitionContent: {
    textAlign: "center",
    padding: "40px",
  },
  transitionLine: {
    width: "100px",
    height: "1px",
    backgroundColor: "rgba(26,26,26,0.2)",
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
  // List Section
  listSection: {
    backgroundColor: "#F5F1E8",
    padding: "100px 40px",
  },
  quickNav: {
    position: "fixed",
    top: "30px",
    right: "30px",
    zIndex: 50,
  },
  quickNavButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    background: "rgba(26,26,26,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(26,26,26,0.1)",
    borderRadius: "30px",
    color: "#1a1a1a",
    cursor: "pointer",
    fontSize: "12px",
    letterSpacing: "0.1em",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  quickNavIcon: {
    fontSize: "16px",
  },
  quickNavText: {},
  navMenu: {
    position: "absolute",
    top: "60px",
    right: "0",
    width: "380px",
    maxHeight: "70vh",
    background: "rgba(245,241,232,0.98)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(26,26,26,0.1)",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  navMenuHeader: {
    display: "flex",
    borderBottom: "1px solid rgba(26,26,26,0.1)",
    padding: "0 20px",
  },
  navFilterButton: {
    flex: 1,
    padding: "16px 0",
    background: "none",
    border: "none",
    color: "#1a1a1a",
    fontSize: "11px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    transition: "opacity 0.3s ease",
    opacity: 0.5,
  },
  navMenuContent: {
    maxHeight: "calc(70vh - 50px)",
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
  listContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  listItem: {
    borderTop: "1px solid rgba(26, 26, 26, 0.08)",
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
    color: "rgba(26,26,26,0.3)",
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
  },
  itemMeta: {
    display: "flex",
    gap: "12px",
    fontSize: "13px",
    color: "rgba(26,26,26,0.5)",
    letterSpacing: "0.05em",
  },
  metaDot: {
    opacity: 0.3,
  },
  itemArrow: {
    fontSize: "32px",
    opacity: 0.3,
  },
  thumbnailsWrapper: {
    display: "flex",
    gap: "16px",
    marginLeft: "80px",
    opacity: 0.6,
  },
  thumbnailItem: {
    width: "120px",
    height: "80px",
    overflow: "hidden",
    borderRadius: "4px",
    backgroundColor: "rgba(26,26,26,0.05)",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  // Footer
  footer: {
    borderTop: "1px solid rgba(26,26,26,0.08)",
    padding: "40px",
    backgroundColor: "#F5F1E8",
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
    color: "rgba(26,26,26,0.6)",
    textDecoration: "none",
    transition: "color 0.3s ease",
  },
  footerDivider: {
    opacity: 0.3,
  },
  // Gallery Overlay
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
    backgroundColor: "rgba(245,241,232,0.85)",
  },
  closeButton: {
    position: "fixed",
    top: "40px",
    right: "40px",
    background: "rgba(245,241,232,0.9)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(26,26,26,0.2)",
    color: "#1a1a1a",
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
    backgroundColor: "rgba(26,26,26,0.2)",
  },
  galleryFooterText: {
    fontSize: "12px",
    letterSpacing: "0.15em",
    opacity: 0.5,
  },
  galleryCloseButton: {
    marginTop: "30px",
    padding: "16px 40px",
    background: "#1a1a1a",
    border: "none",
    borderRadius: "30px",
    color: "#F5F1E8",
    fontSize: "12px",
    letterSpacing: "0.15em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

