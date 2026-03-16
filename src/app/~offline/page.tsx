export default function OfflinePage() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>PokerGoat - Sin conexi&oacute;n</title>
      </head>
      <body
        style={{
          backgroundColor: "#0a0a0f",
          color: "#f0f0f5",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#d4a847",
              marginBottom: "1rem",
            }}
          >
            PokerGoat
          </h1>
          <p style={{ color: "#8888a0", marginBottom: "1.5rem" }}>
            Sin conexi&oacute;n a internet.
          </p>
          <p style={{ color: "#555570", fontSize: "0.875rem" }}>
            Vuelve a intentarlo cuando tengas conexi&oacute;n.
          </p>
        </div>
      </body>
    </html>
  );
}
