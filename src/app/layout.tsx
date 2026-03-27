import { SwRegister } from "@/components/layout/sw-register";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
