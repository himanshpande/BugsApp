"use client"

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: "#0f0f0f",
      color: "#999",
      padding: "60px 80px",
      borderRadius: "20px",
      margin: "40px 20px",
    },
    container: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    leftSection: {
      flex: 1,
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "24px",
      fontSize: "18px",
      fontWeight: "600",
      color: "#fff",
    },
    logoIcon: {
      width: "24px",
      height: "24px",
      backgroundColor: "#e87722",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "14px",
    },
    description: {
      fontSize: "14px",
      lineHeight: "1.6",
      color: "#666",
      maxWidth: "280px",
      marginBottom: "24px",
    },
    socialIcons: {
      display: "flex",
      gap: "16px",
    },
    socialIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "rgba(232, 119, 34, 0.1)",
      border: "1px solid rgba(232, 119, 34, 0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#e87722",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    linksContainer: {
      display: "flex",
      gap: "80px",
    },
    column: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    columnTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#fff",
      marginBottom: "8px",
    },
    link: {
      fontSize: "14px",
      color: "#666",
      textDecoration: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "color 0.3s ease",
    },
    linkHover: {
      color: "#e87722",
    },
    newBadge: {
      backgroundColor: "#e87722",
      color: "#fff",
      fontSize: "10px",
      fontWeight: "700",
      padding: "2px 6px",
      borderRadius: "3px",
    },
    copyright: {
      fontSize: "14px",
      color: "#555",
      marginTop: "40px",
      paddingTop: "24px",
      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    },
  }

  const handleLinkHover = (e) => {
    e.target.style.color = styles.linkHover.color
  }

  const handleLinkLeave = (e) => {
    e.target.style.color = "#666"
  }

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Left Section */}
        <div style={styles.leftSection}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>◆</div>
            <span>BugMarker</span>
          </div>
          <p style={styles.description}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vehicula.</p>
          <div style={styles.socialIcons}>
            <div style={styles.socialIcon}>𝕏</div>
            <div style={styles.socialIcon}>📷</div>
            <div style={styles.socialIcon}>f</div>
            <div style={styles.socialIcon}>▶</div>
          </div>
        </div>

        {/* Links Sections */}
        <div style={styles.linksContainer}>
          {/* Pages Column */}
          <div style={styles.column}>
            <div style={styles.columnTitle}>Pages</div>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Home
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              About
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Pricing
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Contact <span style={styles.newBadge}>New</span>
            </a>
          </div>

          {/* Solutions Column */}
          <div style={styles.column}>
            <div style={styles.columnTitle}>Solutions</div>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Startup Support
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Growth AI <span style={styles.newBadge}>New</span>
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Business Support
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Shipping
            </a>
          </div>

          {/* Resources Column */}
          <div style={styles.column}>
            <div style={styles.columnTitle}>Resources</div>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Blog
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Community
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Tutorials
            </a>
            <a style={styles.link} onMouseEnter={handleLinkHover} onMouseLeave={handleLinkLeave}>
              Monitoring <span style={styles.newBadge}>New</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={styles.copyright}>© 2025 BugMarker</div>
    </footer>
  )
}

export default Footer
