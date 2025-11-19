import React from "react";
import {
  Mail,
  Smartphone,
  Share2,
  Bell,
  Activity,
  CreditCard,
} from "lucide-react";

export default function OpenCallbackPage() {
  return (
    <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "#F5F5F5",
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
    <div style={{ textAlign: "center"}}>
    <svg
        width="120"
        height="120"
        viewBox="0 0 31 40" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maxWidth: "120px",
          borderRadius: "50%",
          margin: "0 auto",
          display: "block",
          backgroundColor: "#000000"
        }}
      >
        <circle cx="15.5" cy="20" r="15.5" fill="#000000"/> 
        <g transform="scale(0.5) translate(16, 16)"> 
          <path d="M30.4092 0V4.23361H4.84732V43.7664H30.4092V48H0.59082V0H30.4092Z" fill="#F2F2F2"/>
          <path d="M26.6676 16.1564H15.6946V31.8436H26.6676V16.1564Z" fill="#F2F2F2"/>
          <path d="M30.4093 7.05981V11.2934H11.9416V36.7065H30.4093V40.9402H7.68506V7.05981H30.4093Z" fill="#F2F2F2"/>
        </g>
    </svg>
    </div>
    
    <section style={{
      color: 'black', 
      padding: '32px', 
      textAlign: 'center'
    }}>
      <h1 style={{
        color: 'black', 
        fontWeight: 'bold'
      }}>
        Welcome to Entro-Noona-NFC Feature Integration
      </h1>
      <p style={{
        marginTop: '6px'
      }}>
        Seamlessly integrate secure smart door access for your bookings.
      </p>
    </section>
    <div
      style={{
        background: "#F9FAFB",
        padding: "20px",
        borderRadius: "12px",
        textAlign: "center",
        marginBottom: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h3
        style={{
          color: "#010808",
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
          <Mail color='#010808' size={20} />
          <span style={{ color: "#555", fontSize: "1rem" }}>
            Send customized and personalized emails for bookings.
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
          <Smartphone color='#010808' size={20} />
          <span style={{ color: "#555", fontSize: "1rem" }}>
            Send personalized SMS notifications for appointments.
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
          <Share2 color='#010808' size={20} />
          <span style={{ color: "#555", fontSize: "1rem" }}>
            Integrate bookings with Entro systems via webhooks.
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
          <Bell color='#010808' size={20} />
          <span style={{ color: "#555", fontSize: "1rem" }}>
            Receive customized notifications for Noona mobile apps.
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
          <Activity color='#010808' size={20} />
          <span style={{ color: "#555", fontSize: "1rem" }}>
            Trigger dynamic workflows for events such as creation, updates, and deletions.
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
          <CreditCard color='#010808' size={20} />
          <span style={{ color: "#555", fontSize: "1rem" }}>
            NFC wallet integration for booking with secure smart access control.
          </span>
        </li>
      </ul>
    </div>
    <div style={{
      background: "#F9FAFB", 
      padding: "20px", 
      borderRadius: "12px", 
      textAlign: "left", 
    }}>
      <h3 style={{
        fontSize: "1.25rem", 
        marginBottom: "25px", 
        fontWeight: "600",
        color: "#010808",
        textAlign: 'center'
      }}>
        How it Works
      </h3>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between', 
      }}>
        <div style={{ flex: 1, marginRight: '24px' }}> 
          <div style={{
            display: 'flex',
            flexDirection: 'column', // Stack the content vertically
            gap: '24px',
            marginBottom: '24px',
            color: "#010808",
          }}>
            <div style={{ maxWidth: '640px', color: "#010808" }}>
              <span style={{
                cursor: 'pointer',
                fontSize: '1.05rem',
                color: "#555",
                fontWeight: 'bold',
              }}>
                Automatic Access Codes:
              </span>
              <p style={{ color: '#718096', width: '100%' }}>
                Entro automatically generates unique access codes for each booking.
              </p>
            </div>
            <div style={{ maxWidth: '640px' }}>
              <span style={{
                cursor: 'pointer',
                fontSize: '1.05rem',
                color: "#555",
                fontWeight: 'bold',
              }}>
                SMS Notifications:
              </span>
              <p style={{ color: '#718096', width: '100%' }}>
                Access codes are sent directly to your guests via SMS for convenient and secure access.
              </p>
            </div>
            <div style={{ maxWidth: '640px' }}>
              <span style={{
                cursor: 'pointer',
                fontSize: '1.05rem',
                color: "#555",
                fontWeight: 'bold',
              }}>
                NFC Wallet Integration:
              </span>
              <p style={{ color: '#718096', width: '100%' }}>
                Guests can use their NFC-enabled devices or digital wallets for seamless, contactless access to secure smart door controls.
              </p>
            </div>
          </div>
        </div>
      
      </div>
    </div>
   
    <footer style={{
      backgroundColor: "#1F2937",
      color: "white",
      textAlign: "center",
      padding: "16px",
    }}>
      <p>Contact us at support@entro.co</p>
    </footer>
  </div>
  </div>
  );
}
