export default function UnauthorizedPage() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f3f4f6, #e2e8f0)",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="https://res.cloudinary.com/timatal-ehf/image/upload/t_limit_size_610/v1720975438/eventTypePhotos/wjyjgno908ukotwlbuz0.jpg"
            alt="Noona Workflow Logo"
            style={{
              maxWidth: "120px",
              borderRadius: "50%",
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>
        <h1
          style={{
            color: "#333",
            fontSize: "2rem",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          Welcome to EntroNoona 
        </h1>
        <p
          style={{
            color: "#555",
            fontSize: "1rem",
            lineHeight: "1.8",
            marginBottom: "30px",
          }}
        >
          EntroNoona is your integration hub for Noona HQ, empowering
          you to create seamless workflows triggered by events.
        </p>
        <div
          style={{
            background: "#f9fafb",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "30px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3
            style={{
              color: "#007bff",
              fontSize: "1.25rem",
              marginBottom: "15px",
              fontWeight: "600",
            }}
          >
            Features
          </h3>
          <ul
            style={{
              listStyleType: "none",
              paddingLeft: "0",
              margin: "0 auto",
              display: "inline-block",
              textAlign: "left",
            }}
          >
            <li
              style={{
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  background: "#007bff",
                  borderRadius: "50%",
                }}
              ></span>
              <span style={{ color: "#555", fontSize: "1rem" }}>
                Automatically send personalized emails for bookings.
              </span>
            </li>
            <li
              style={{
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  background: "#007bff",
                  borderRadius: "50%",
                }}
              ></span>
              <span style={{ color: "#555", fontSize: "1rem" }}>
                Automate personalized SMS for appointments.
              </span>
            </li>
            <li
              style={{
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  background: "#007bff",
                  borderRadius: "50%",
                }}
              ></span>
              <span style={{ color: "#555", fontSize: "1rem" }}>
                Integrate orders with Entro systems via webhooks.
              </span>
            </li>
            <li
              style={{
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  background: "#007bff",
                  borderRadius: "50%",
                }}
              ></span>
              <span style={{ color: "#555", fontSize: "1rem" }}>
                Customize appointments for Noona mobile apps.
              </span>
            </li>
            <li
              style={{
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  background: "#007bff",
                  borderRadius: "50%",
                }}
              ></span>
              <span style={{ color: "#555", fontSize: "1rem" }}>
                Create custom webhooks to connect with Entro platform.
              </span>
            </li>
          </ul>
        </div>
        <a
            href="/"
            target="_blank" // Opens the link in a new tab
            rel="noopener noreferrer" // Security best practice for links opening in new tabs
            style={{
                display: "inline-block",
                background: "#007bff",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#0056b3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#007bff")}
            >
            Get Started with EntroNoona
        </a>

      </div>
    </div>
  );
}
