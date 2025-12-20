import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  // 1. 定义 State 来存储 API 数据
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [randomHeroIndex, setRandomHeroIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  // 2. Fetch Data from Worker API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 后端 Worker 已经处理好了所有 URL (包含 blockId 缓存键)
        // 前端直接傻瓜式获取即可
        const response = await fetch("https://api.minzhangphoto.com");
        const data = await response.json();

        setProjects(data);

        // 数据加载完成后，计算随机 Hero 索引
        if (data.length > 0) {
          setRandomHeroIndex(Math.floor(Math.random() * data.length));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3. 统计逻辑 (依赖于 projects 变化)
  const stats = useMemo(() => {
    if (projects.length === 0) return { totalPhotos: 0, uniqueLocations: 0 };

    const totalPhotos = projects.reduce(
      (acc, curr) => acc + (curr.images ? curr.images.length : 0),
      0
    );
    const uniqueLocations = new Set(projects.map((p) => p.location)).size;
    return { totalPhotos, uniqueLocations };
  }, [projects]);

  // 4. 禁止滚动的副作用
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedProject]);

  // --- Loading 状态处理 ---
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <span>LOADING...</span>
      </div>
    );
  }

  // 防止 API 返回空数组导致报错
  if (projects.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <span>NO PROJECTS FOUND</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* --- Section 1: Hero --- */}
      <section style={styles.heroSection}>
        <div style={styles.heroBgWrapper}>
          <img
            // 这里的 cover 已经是 Worker 返回的 Smart Cache URL 了
            // 格式: .../image?url=...&blockId=...
            src={projects[randomHeroIndex].cover}
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

      {/* --- Section 2: List --- */}
      <main style={styles.listSection}>
        <div style={styles.listContainer}>
          {projects.map((project) => (
            <div
              key={project.id} // 使用 UUID 作为 Key，性能更好
              onClick={() => setSelectedProject(project)}
              style={styles.listItem}
            >
              <div style={styles.itemContent}>
                {/* [关键修改点] 
                   之前是用 project.id，但现在 ID 变成了很长的 UUID。
                   所以我改成了 project.displayId (1, 2, 3...) 以保持原本的美观。
                */}
                <span style={styles.idNumber}>
                  {String(project.displayId).padStart(2, "0")}
                </span>
                <h2 style={styles.title}>{project.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- Overlay: Full Screen Gallery --- */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={styles.galleryOverlay}
          >
            {/* 1. 动态模糊背景层 */}
            <div style={styles.galleryBackgroundWrapper}>
              <img
                src={selectedProject.cover}
                alt="bg"
                style={styles.galleryBackgroundImage}
              />
              <div style={styles.galleryBackgroundOverlay} />
            </div>

            {/* 2. 关闭按钮 */}
            <button
              onClick={() => setSelectedProject(null)}
              style={styles.closeButton}
            >
              CLOSE
            </button>

            {/* 3. 内容滚动容器 */}
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
                      {/* 这里的 img 同样已经是缓存优化过的 URL */}
                      <img src={img} alt="" style={styles.galleryImage} />
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

// 样式部分完全保持你原来的代码，不做任何改动
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
