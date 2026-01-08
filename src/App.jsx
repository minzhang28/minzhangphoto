import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "https://api.minzhangphoto.com";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

const getResponsiveImageProps = (img, useOriginal = false) => {
  if (typeof img === 'string') {
    return { src: getImageUrl(img) };
  }

  if (img.small && img.large && img.original) {
    return {
      src: getImageUrl(img.small),
      srcSet: `${getImageUrl(img.small)} 640w, ${getImageUrl(img.large)} 1280w, ${getImageUrl(img.original)} 2048w`,
      sizes: useOriginal
        ? "(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1200px"
        : "(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 220px"
    };
  }

  return { src: getImageUrl(img.url || img) };
};

const CameraIcons = {
  rangefinder: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="16" width="56" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 22H60" stroke="currentColor" strokeWidth="2" />
      <circle cx="36" cy="32" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="36" cy="32" r="7" stroke="currentColor" strokeWidth="2" />
      <rect x="8" y="24" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="48" y="18" width="8" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="12" width="6" height="4" fill="currentColor" />
      <rect x="44" y="12" width="4" height="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  slr: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="20" width="52" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M6 26H58" stroke="currentColor" strokeWidth="2" />
      <path d="M22 20L28 10H36L42 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="32" cy="36" r="11" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="36" r="7" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="16" width="8" height="4" stroke="currentColor" strokeWidth="2" />
      <rect x="46" y="16" width="8" height="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  tlr: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="14" width="28" height="44" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M18 14L22 6H42L46 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="32" cy="26" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="44" r="8" stroke="currentColor" strokeWidth="2" />
      <rect x="46" y="24" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="M18 52H46" stroke="currentColor" strokeWidth="2" />
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
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={styles.loadingText}
      >
        LOADING
      </motion.p>
    </div>
  );
}

// Full screen album card component
function AlbumCard({ album, index, onClick }) {
  return (
    <section style={styles.albumCard}>
      <div style={styles.albumBackground}>
        <img
          {...getResponsiveImageProps(album.cover, true)}
          alt={album.title}
          loading="lazy"
          style={styles.albumBackgroundImage}
        />
        <div style={styles.albumOverlay} />
      </div>

      <div style={styles.albumContent}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={styles.albumInfo}
        >
          <div style={styles.albumMeta}>
            <span>{album.location}</span>
            <span style={styles.albumMetaDot}>·</span>
            <span>{album.year}</span>
          </div>
          <h2 style={styles.albumTitle}>{album.title}</h2>
          <p style={styles.albumCount}>{album.count} PHOTOS</p>

          {album.story && (
            <p style={styles.albumStoryPreview}>
              {album.story.substring(0, 60)}...
            </p>
          )}

          <button
            onClick={onClick}
            style={styles.viewButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
              e.target.style.color = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#f5f5f5";
            }}
          >
            VIEW ALBUM
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
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
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
          year: item.year || new Date().getFullYear(),
          story: item.story || null,
        }));

        setAlbums(processedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (albums.length === 0) return { totalPhotos: 0, uniqueLocations: 0, totalAlbums: 0 };

    const totalPhotos = albums.reduce(
      (acc, curr) => acc + (curr.count || curr.images?.length || 0),
      0
    );
    const uniqueLocations = new Set(
      albums.map((p) => p.location).filter(Boolean)
    ).size;
    return { totalPhotos, uniqueLocations, totalAlbums: albums.length };
  }, [albums]);

  const albumsByLocation = useMemo(() => {
    const groups = {};
    albums.forEach(p => {
      const loc = p.location || "Unknown";
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(p);
    });
    return groups;
  }, [albums]);

  const openAlbumGallery = (album) => {
    setSelectedAlbum(album);
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
        element.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.6)';

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
    if (selectedAlbum) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedAlbum]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (albums.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <span>NO ALBUMS FOUND</span>
      </div>
    );
  }

  // Featured albums (first 5)
  const featuredAlbums = albums.slice(0, 5);
  // All albums for list view
  const allAlbums = albums;

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
                <span style={styles.statNumber}>{stats.totalAlbums}</span>
                <span style={styles.statLabel}>ALBUMS</span>
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

        {/* Featured Albums - Full Screen Cards */}
        {featuredAlbums.map((album, index) => (
          <AlbumCard
            key={album.id}
            album={album}
            index={index}
            onClick={() => setSelectedAlbum(album)}
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
            <h3 style={styles.transitionTitle}>EXPLORE ALL ALBUMS</h3>
            <p style={styles.transitionSubtitle}>{allAlbums.length} collections from around the world</p>
            <button
              style={styles.exploreButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f5f5f5";
                e.target.style.color = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#f5f5f5";
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
                    borderBottom: filterType === "all" ? "2px solid #f5f5f5" : "2px solid transparent"
                  }}
                >
                  ALL ALBUMS
                </button>
                <button
                  onClick={() => setFilterType("location")}
                  style={{
                    ...styles.navFilterButton,
                    borderBottom: filterType === "location" ? "2px solid #f5f5f5" : "2px solid transparent"
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
                  allAlbums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => openAlbumGallery(album)}
                      style={styles.navMenuItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span style={styles.navItemNumber}>
                        {String(album.displayId).padStart(2, "0")}
                      </span>
                      <span style={styles.navItemTitle}>{album.title}</span>
                      <span style={styles.navItemLocation}>{album.location}</span>
                    </div>
                  ))
                ) : (
                  Object.entries(albumsByLocation).map(([location, locationAlbums]) => (
                    <div key={location} style={styles.navLocationGroup}>
                      <div style={styles.navLocationTitle}>{location}</div>
                      {locationAlbums.map((album) => (
                        <div
                          key={album.id}
                          onClick={() => openAlbumGallery(album)}
                          style={styles.navMenuItem}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span style={styles.navItemNumber}>
                            {String(album.displayId).padStart(2, "0")}
                          </span>
                          <span style={styles.navItemTitle}>{album.title}</span>
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
        {selectedAlbum && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={styles.galleryOverlay}
          >
            <div style={styles.galleryBackgroundWrapper}>
              <img
                {...getResponsiveImageProps(selectedAlbum.cover, true)}
                alt="bg"
                loading="eager"
                style={styles.galleryBackgroundImage}
              />
              <div style={styles.galleryBackgroundOverlay} />
            </div>

            <button
              onClick={() => setSelectedAlbum(null)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSelectedAlbum(null);
              }}
              style={styles.closeButton}
              aria-label="Close gallery"
              tabIndex={0}
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
                  e.target.style.backgroundColor = "rgba(50, 48, 45, 0.5)";
                  e.target.style.transform = "scale(1.1) rotate(90deg)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(42, 42, 42, 0.3)";
                  e.target.style.transform = "scale(1) rotate(0deg)";
                }}
                aria-label="Open contact sheet"
                tabIndex={0}
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
                scale: showContactSheet ? 0.98 : 1,
              }}
              transition={{
                delay: 0.15,
                duration: showContactSheet ? 0.6 : 0.4,
                ease: "easeInOut"
              }}
              style={styles.galleryContent}
            >
              <div style={styles.galleryHeader}>
                <h1 style={styles.galleryTitle}>{selectedAlbum.title}</h1>
                <div style={styles.galleryMeta}>
                  <span>{selectedAlbum.location}</span>
                  <span style={styles.galleryMetaDot}>·</span>
                  <span>{selectedAlbum.year}</span>
                  <span style={styles.galleryMetaDot}>·</span>
                  <span>{selectedAlbum.images.length} IMAGES</span>
                </div>

                {selectedAlbum.story && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    style={styles.galleryStory}
                  >
                    <div style={styles.galleryStoryDivider} />
                    <p style={styles.galleryStoryText}>{selectedAlbum.story}</p>
                    <div style={styles.galleryStoryDivider} />
                  </motion.div>
                )}
              </div>

              <div style={styles.galleryScroll}>
                {selectedAlbum.images &&
                  selectedAlbum.images.map((img, index) => (
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
                        {...getResponsiveImageProps(img, true)}
                        alt=""
                        loading="lazy"
                        style={styles.galleryImage}
                      />
                    </motion.div>
                  ))}

                <div style={styles.galleryFooter}>
                  <div style={styles.galleryFooterLine} />
                  <span style={styles.galleryFooterText}>END OF ALBUM</span>
                  <button
                    onClick={() => setSelectedAlbum(null)}
                    style={styles.galleryCloseButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#3a3a3a";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#2a2a2a";
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
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowContactSheet(false);
                  }}
                  role="dialog"
                  aria-label="Contact sheet"
                  tabIndex={-1}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={styles.contactSheetContainer}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Grid */}
                    <div style={styles.contactSheetGrid}>
                      {selectedAlbum.images.map((img, index) => (
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
                            {...getResponsiveImageProps(img, false)}
                            alt={`Image ${index + 1}`}
                            loading="lazy"
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
    backgroundColor: "#1a1a1a",
    color: "#f5f5f5",
    fontFamily: "'Helvetica Neue', -apple-system, Arial, sans-serif",
  },
  loadingContainer: {
    height: "100vh",
    backgroundColor: "#1a1a1a",
    color: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "32px",
  },
  loadingIconWrapper: {
    color: "#f5f5f5",
    opacity: 1,
    width: "80px",
    height: "80px",
    willChange: "transform, opacity",
  },
  loadingText: {
    fontSize: "10px",
    letterSpacing: "0.2em",
    fontWeight: "500",
    color: "#f5f5f5",
    margin: 0,
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
    backgroundColor: "#1a1a1a",
    padding: "0 20px",
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
    margin: "0 0 64px 0",
  },
  statsGrid: {
    display: "flex",
    gap: "48px",
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
    backgroundColor: "rgba(255,255,255,0.2)",
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
  albumCard: {
    position: "relative",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    scrollSnapAlign: "start",
  },
  albumBackground: {
    position: "absolute",
    inset: 0,
  },
  albumBackgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.5,
  },
  albumOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(26,26,26,0.7) 0%, rgba(26,26,26,0.95) 100%)",
  },
  albumContent: {
    position: "relative",
    zIndex: 10,
    textAlign: "center",
    padding: "40px",
  },
  albumInfo: {
    maxWidth: "800px",
  },
  albumMeta: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    opacity: 0.5,
    marginBottom: "20px",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  albumMetaDot: {
    margin: "0 8px",
  },
  albumTitle: {
    fontSize: "clamp(50px, 10vw, 100px)",
    fontWeight: "200",
    letterSpacing: "-0.02em",
    margin: "0 0 16px 0",
  },
  albumCount: {
    fontSize: "12px",
    letterSpacing: "0.15em",
    opacity: 0.5,
    marginBottom: "24px",
  },
  albumStoryPreview: {
    fontSize: "15px",
    lineHeight: "1.8",
    opacity: 0.7,
    marginBottom: "40px",
    maxWidth: "600px",
    margin: "0 auto 40px",
    fontWeight: "300",
  },
  viewButton: {
    padding: "16px 40px",
    background: "transparent",
    border: "2px solid #f5f5f5",
    borderRadius: "32px",
    color: "#f5f5f5",
    fontSize: "12px",
    letterSpacing: "0.15em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minHeight: "48px",
    boxShadow: "0 0 0 0 rgba(245, 245, 245, 0)",
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
    backgroundColor: "rgba(255,255,255,0.2)",
    margin: "0 auto 32px",
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
    marginBottom: "32px",
  },
  exploreButton: {
    padding: "16px 40px",
    background: "transparent",
    border: "2px solid #f5f5f5",
    borderRadius: "32px",
    color: "#f5f5f5",
    fontSize: "12px",
    letterSpacing: "0.15em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "32px",
    minHeight: "48px",
    boxShadow: "0 0 0 0 rgba(245, 245, 245, 0)",
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
    background: "rgba(26, 26, 26, 0.98)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
  },
  navMenuHeader: {
    display: "flex",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "0 20px",
    position: "relative",
  },
  navFilterButton: {
    flex: 1,
    padding: "16px 0",
    background: "none",
    border: "none",
    color: "#f5f5f5",
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
    color: "#f5f5f5",
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
    fontSize: "10px",
    letterSpacing: "0.16em",
    opacity: 0.4,
    padding: "12px 16px 8px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "40px 20px",
    backgroundColor: "#1a1a1a",
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
    filter: "blur(60px) brightness(0.8)",
    transform: "scale(1.2)",
  },
  galleryBackgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  closeButton: {
    position: "fixed",
    top: "40px",
    right: "40px",
    background: "rgba(42, 42, 42, 0.4)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#f5f5f5",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 101,
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    willChange: "transform, background-color",
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
    fontSize: "11px",
    letterSpacing: "0.12em",
    opacity: 0.5,
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  galleryMetaDot: {
    opacity: 0.4,
  },
  galleryStory: {
    marginTop: "64px",
    maxWidth: "700px",
    margin: "64px auto 0",
  },
  galleryStoryDivider: {
    width: "40px",
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.3)",
    margin: "32px auto",
  },
  galleryStoryText: {
    fontSize: "16px",
    lineHeight: "1.9",
    opacity: 0.75,
    fontWeight: "300",
    letterSpacing: "0.01em",
    textAlign: "center",
    margin: 0,
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
    boxShadow: "0 32px 96px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.02)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  galleryFooter: {
    marginTop: "64px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    paddingBottom: "40px",
  },
  galleryFooterLine: {
    width: "64px",
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  galleryFooterText: {
    fontSize: "12px",
    letterSpacing: "0.15em",
    opacity: 0.5,
  },
  galleryCloseButton: {
    marginTop: "32px",
    padding: "16px 40px",
    background: "rgba(42, 42, 42, 0.3)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "32px",
    color: "#f5f5f5",
    fontSize: "12px",
    letterSpacing: "0.15em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minHeight: "48px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },
  // View Toggle Button (Floating) - The Glass Toggle
  viewToggleButton: {
    position: "fixed",
    bottom: "40px",
    right: "40px",
    background: "rgba(42, 42, 42, 0.3)",
    backdropFilter: "blur(24px) saturate(120%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#f5f5f5",
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
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
  },
  // Contact Sheet Overlay - The Frosted Glass
  contactSheetOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 103,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  contactSheetContainer: {
    width: "100%",
    maxWidth: "min(1600px, 95vw)",
    maxHeight: "min(90vh, calc(100vh - 40px))",
    background: "rgba(30, 30, 30, 0.2)",
    backdropFilter: "blur(28px) saturate(110%)",
    WebkitBackdropFilter: "blur(28px) saturate(110%)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 40px 120px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.2)",
    display: "flex",
    flexDirection: "column",
    willChange: "transform, opacity",
  },
  contactSheetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(clamp(140px, 18vw, 220px), 1fr))",
    gap: "clamp(8px, 2vw, 24px)",
    overflowY: "auto",
    overflowX: "hidden",
    flex: 1,
    padding: "clamp(12px, 3vw, 40px)",
    alignContent: "start",
    WebkitOverflowScrolling: "touch",
  },
  contactSheetItem: {
    position: "relative",
    aspectRatio: "3 / 2",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)",
    backgroundColor: "rgba(42, 42, 42, 0.3)",
    willChange: "transform",
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
    color: "#f5f5f5",
    background: "linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))",
    padding: "4px 8px",
    borderRadius: "4px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
};
